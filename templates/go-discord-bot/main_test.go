package main

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/bwmarrin/discordgo"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (fn roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) {
	return fn(request)
}

func testSession(t *testing.T, transport roundTripFunc) *discordgo.Session {
	t.Helper()
	session, err := discordgo.New("Bot example-test-token")
	if err != nil {
		t.Fatal(err)
	}
	session.Client = &http.Client{Transport: transport, Timeout: time.Second}
	session.MaxRestRetries = 0
	session.ShouldRetryOnRateLimit = false
	return session
}

func TestLoadConfig(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		token   string
		guildID string
		wantErr bool
	}{
		{name: "valid", token: "test-token", guildID: "123456789012345678"},
		{name: "trimmed", token: " test-token\n", guildID: " 123456789012345678 "},
		{name: "missing token", guildID: "123", wantErr: true},
		{name: "missing guild", token: "test-token", wantErr: true},
		{name: "prefixed token", token: "Bot secret-token", guildID: "123", wantErr: true},
		{name: "invalid guild", token: "secret-token", guildID: "abc", wantErr: true},
		{name: "zero guild", token: "secret-token", guildID: "0", wantErr: true},
		{name: "signed guild", token: "secret-token", guildID: "+123", wantErr: true},
		{name: "overflow guild", token: "secret-token", guildID: "18446744073709551616", wantErr: true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			values := map[string]string{"DISCORD_BOT_TOKEN": tt.token, "DISCORD_GUILD_ID": tt.guildID}
			cfg, err := loadConfig(func(key string) string { return values[key] })
			if (err != nil) != tt.wantErr {
				t.Fatalf("loadConfig error = %v, want error %v", err, tt.wantErr)
			}
			if err != nil {
				if strings.Contains(err.Error(), "secret-token") {
					t.Fatal("configuration error exposed token")
				}
				return
			}
			if cfg.token != strings.TrimSpace(tt.token) || cfg.guildID != strings.TrimSpace(tt.guildID) {
				t.Fatal("configuration did not normalize surrounding whitespace")
			}
		})
	}
}

func TestRegisterCommandsPreservesOtherCommands(t *testing.T) {
	t.Parallel()
	names := []string{}
	session := testSession(t, func(request *http.Request) (*http.Response, error) {
		if request.Method != http.MethodPost {
			t.Fatalf("method = %s; only individual command upserts are allowed", request.Method)
		}
		if !strings.HasSuffix(request.URL.Path, "/applications/app-id/guilds/guild-id/commands") {
			t.Fatalf("unexpected command endpoint: %s", request.URL.Path)
		}
		if request.Context().Value(testContextKey{}) != "registration" {
			t.Fatal("registration lost caller context")
		}
		var command discordgo.ApplicationCommand
		if err := json.NewDecoder(request.Body).Decode(&command); err != nil {
			t.Fatal(err)
		}
		names = append(names, command.Name)
		if command.Type != discordgo.ChatApplicationCommand || command.Description == "" {
			t.Fatal("command lacks slash-command type or description")
		}
		return &http.Response{
			StatusCode: http.StatusOK,
			Header:     http.Header{},
			Body:       io.NopCloser(strings.NewReader(`{"id":"command-id"}`)),
		}, nil
	})
	ctx := context.WithValue(t.Context(), testContextKey{}, "registration")
	for range 2 {
		if err := registerCommands(ctx, session, "app-id", "guild-id"); err != nil {
			t.Fatal(err)
		}
	}
	if strings.Join(names, ",") != "ping,about,ping,about" {
		t.Fatalf("registered commands = %v", names)
	}
}

type testContextKey struct{}

func TestRespondToSlashCommands(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		content string
	}{
		{name: "ping", content: "Pong! Your bot is online."},
		{name: "about", content: "DiscordGo"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			calls := 0
			session := testSession(t, func(request *http.Request) (*http.Response, error) {
				calls++
				if request.Method != http.MethodPost || !strings.HasSuffix(request.URL.Path, "/interactions/event-id/interaction-secret/callback") {
					t.Fatalf("unexpected interaction endpoint: %s %s", request.Method, request.URL.Path)
				}
				if deadline, ok := request.Context().Deadline(); !ok || time.Until(deadline) > 2500*time.Millisecond {
					t.Fatal("initial response has no bounded deadline")
				}
				var response discordgo.InteractionResponse
				if err := json.NewDecoder(request.Body).Decode(&response); err != nil {
					t.Fatal(err)
				}
				if response.Type != discordgo.InteractionResponseChannelMessageWithSource {
					t.Fatalf("response type = %d", response.Type)
				}
				if response.Data == nil || !strings.Contains(response.Data.Content, tt.content) {
					t.Fatalf("unexpected response data: %+v", response.Data)
				}
				if response.Data.Flags != discordgo.MessageFlagsEphemeral {
					t.Fatal("response is not ephemeral")
				}
				return &http.Response{
					StatusCode: http.StatusNoContent,
					Header:     http.Header{},
					Body:       io.NopCloser(strings.NewReader("")),
				}, nil
			})
			event := &discordgo.InteractionCreate{Interaction: &discordgo.Interaction{
				ID: "event-id", Token: "interaction-secret", GuildID: "guild-id",
				Type: discordgo.InteractionApplicationCommand,
				Data: discordgo.ApplicationCommandInteractionData{Name: tt.name},
			}}
			if err := respond(t.Context(), session, event, "guild-id"); err != nil {
				t.Fatal(err)
			}
			if calls != 1 {
				t.Fatalf("callback requests = %d, want 1", calls)
			}
		})
	}
}

func TestRespondIgnoresUnrelatedEvents(t *testing.T) {
	t.Parallel()
	session := testSession(t, func(*http.Request) (*http.Response, error) {
		t.Fatal("unrelated event sent an API request")
		return nil, errors.New("unexpected request")
	})
	tests := []struct {
		name  string
		event *discordgo.InteractionCreate
	}{
		{name: "nil"},
		{name: "empty", event: &discordgo.InteractionCreate{}},
		{name: "component", event: &discordgo.InteractionCreate{Interaction: &discordgo.Interaction{
			Type: discordgo.InteractionMessageComponent, GuildID: "guild-id",
		}}},
		{name: "another guild", event: &discordgo.InteractionCreate{Interaction: &discordgo.Interaction{
			Type: discordgo.InteractionApplicationCommand, GuildID: "different-guild",
			Data: discordgo.ApplicationCommandInteractionData{Name: "ping"},
		}}},
		{name: "unknown command", event: &discordgo.InteractionCreate{Interaction: &discordgo.Interaction{
			Type: discordgo.InteractionApplicationCommand, GuildID: "guild-id",
			Data: discordgo.ApplicationCommandInteractionData{Name: "other-command"},
		}}},
		{name: "missing data", event: &discordgo.InteractionCreate{Interaction: &discordgo.Interaction{
			Type: discordgo.InteractionApplicationCommand, GuildID: "guild-id",
		}}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := respond(t.Context(), session, tt.event, "guild-id"); err != nil {
				t.Fatal(err)
			}
		})
	}
}

func TestAPIFailuresNeverExposeSecrets(t *testing.T) {
	t.Parallel()
	session := testSession(t, func(request *http.Request) (*http.Response, error) {
		return &http.Response{
			StatusCode: http.StatusForbidden,
			Status:     "403 Forbidden",
			Header:     http.Header{},
			Body:       io.NopCloser(strings.NewReader(`{"code":50013,"message":"example-test-token interaction-secret"}`)),
			Request:    request,
		}, nil
	})
	registrationErr := registerCommands(t.Context(), session, "app-id", "guild-id")
	event := &discordgo.InteractionCreate{Interaction: &discordgo.Interaction{
		ID: "event-id", Token: "interaction-secret", GuildID: "guild-id",
		Type: discordgo.InteractionApplicationCommand,
		Data: discordgo.ApplicationCommandInteractionData{Name: "ping"},
	}}
	responseErr := respond(t.Context(), session, event, "guild-id")
	for _, err := range []error{registrationErr, responseErr} {
		if err == nil || !strings.Contains(err.Error(), "HTTP 403") || !strings.Contains(err.Error(), "50013") {
			t.Fatalf("expected useful sanitized API error, got %v", err)
		}
		if strings.Contains(err.Error(), "example-test-token") || strings.Contains(err.Error(), "interaction-secret") {
			t.Fatal("API error exposed a token")
		}
	}
}

func TestNetworkErrorsNeverExposeRequestURL(t *testing.T) {
	t.Parallel()
	err := safeDiscordError(&url.Error{
		Op:  "Post",
		URL: "https://discord.com/api/interactions/id/interaction-secret/callback",
		Err: errors.New("example-test-token"),
	})
	if strings.Contains(err.Error(), "interaction-secret") || strings.Contains(err.Error(), "example-test-token") {
		t.Fatal("network error exposed a token")
	}
	if !errors.Is(safeDiscordError(context.Canceled), context.Canceled) {
		t.Fatal("cancellation lost its identity")
	}
}

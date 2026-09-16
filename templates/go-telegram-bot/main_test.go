package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"testing"

	"github.com/PaulSonOfLars/gotgbot/v2"
)

func TestValidateToken(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name string
		raw  string
		want string
	}{
		{name: "missing"},
		{name: "blank", raw: " \n"},
		{name: "malformed", raw: "secret-that-must-not-be-logged"},
		{name: "invalid ID", raw: "zero:secret"},
		{name: "valid", raw: "12345:example_SECRET-123", want: "12345:example_SECRET-123"},
		{name: "surrounding whitespace", raw: " 12345:example_SECRET-123\n", want: "12345:example_SECRET-123"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			token, err := validateToken(tt.raw)
			if tt.want != "" {
				if err != nil || token != tt.want {
					t.Fatalf("valid token was not accepted: %v", err)
				}
				return
			}
			if err == nil || token != "" || !strings.Contains(err.Error(), "TELEGRAM_BOT_TOKEN") {
				t.Fatalf("invalid token must return actionable configuration error: %v", err)
			}
			if strings.TrimSpace(tt.raw) != "" && strings.Contains(err.Error(), tt.raw) {
				t.Fatal("error exposed the supplied token")
			}
		})
	}
}

func TestCommands(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name string
		text string
		want string
	}{
		{name: "start", text: "/start", want: "Your Go Telegram bot is running"},
		{name: "help", text: "/help", want: "/ping"},
		{name: "ping", text: "/ping", want: "Pong!"},
		{name: "addressed command", text: "/ping@example_bot", want: "Pong!"},
		{name: "other bot", text: "/ping@other_bot"},
		{name: "ordinary message", text: "hello"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var replies int
			client := http.Client{Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
				replies++
				defer req.Body.Close()
				if req.Method != http.MethodPost || !strings.HasSuffix(req.URL.Path, "/sendMessage") {
					t.Errorf("unexpected Telegram method: %s", req.Method)
				}
				if err := req.ParseMultipartForm(1 << 20); err != nil {
					t.Fatal(err)
				}
				defer req.MultipartForm.RemoveAll()
				if req.FormValue("chat_id") != "42" || !strings.Contains(req.FormValue("text"), tt.want) {
					t.Errorf("reply went to wrong chat or had unexpected text: %q", req.FormValue("text"))
				}
				return telegramResponse(`{"ok":true,"result":{"message_id":8,"chat":{"id":42,"type":"private"}}}`), nil
			})}
			bot := &gotgbot.Bot{
				Token:     "12345:test_token",
				User:      gotgbot.User{Id: 12345, Username: "example_bot", IsBot: true},
				BotClient: &gotgbot.BaseBotClient{Client: client},
			}
			update := &gotgbot.Update{Message: &gotgbot.Message{
				MessageId: 7,
				Text:      tt.text,
				From:      &gotgbot.User{Id: 42},
				Chat:      gotgbot.Chat{Id: 42, Type: "private"},
			}}
			if err := newDispatcher().ProcessUpdate(bot, update, nil); err != nil {
				t.Fatal(err)
			}
			wantReplies := 0
			if tt.want != "" {
				wantReplies = 1
			}
			if replies != wantReplies {
				t.Errorf("sent %d replies, want %d", replies, wantReplies)
			}
		})
	}
}

func TestNewBotRejectsUnauthorizedTokenWithoutExposingIt(t *testing.T) {
	t.Parallel()
	const token = "12345:private_test_token"
	client := http.Client{Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
		defer req.Body.Close()
		if _, err := io.Copy(io.Discard, req.Body); err != nil {
			t.Fatal(err)
		}
		return telegramResponse(`{"ok":false,"error_code":401,"description":"` + token + `"}`), nil
	})}
	bot, err := newBot(token, client)
	if bot != nil || err == nil || !strings.Contains(err.Error(), "TELEGRAM_BOT_TOKEN") {
		t.Fatalf("expected actionable authentication failure, got %v", err)
	}
	if strings.Contains(err.Error(), token) {
		t.Fatal("authentication error exposed token")
	}
}

func TestSafeTelegramError(t *testing.T) {
	t.Parallel()
	const token = "12345:private_test_token"
	for _, tt := range []struct {
		name string
		err  error
	}{
		{name: "URL error", err: &url.Error{Op: "Post", URL: "https://api.telegram.org/bot" + token + "/getUpdates", Err: errors.New("offline")}},
		{name: "timeout", err: fmt.Errorf("request %s: %w", token, context.DeadlineExceeded)},
		{name: "another poller", err: &gotgbot.TelegramError{Code: 409, Description: token}},
		{name: "rate limit", err: &gotgbot.TelegramError{Code: 429, Description: token}},
		{name: "API failure", err: &gotgbot.TelegramError{Code: 500, Description: token}},
	} {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			message := safeTelegramError(tt.err).Error()
			if strings.Contains(message, token) || strings.Contains(message, "https://") {
				t.Fatal("error exposed sensitive request details")
			}
		})
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) { return f(req) }

func telegramResponse(body string) *http.Response {
	return &http.Response{
		StatusCode: http.StatusOK,
		Header:     make(http.Header),
		Body:       io.NopCloser(strings.NewReader(body)),
	}
}

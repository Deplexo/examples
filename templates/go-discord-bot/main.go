package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/bwmarrin/discordgo"
)

type config struct {
	token   string
	guildID string
}

func loadConfig(getenv func(string) string) (config, error) {
	cfg := config{
		token:   strings.TrimSpace(getenv("DISCORD_BOT_TOKEN")),
		guildID: strings.TrimSpace(getenv("DISCORD_GUILD_ID")),
	}
	if cfg.token == "" {
		return config{}, errors.New("DISCORD_BOT_TOKEN is required")
	}
	if strings.ContainsAny(cfg.token, " \t\r\n") {
		return config{}, errors.New("DISCORD_BOT_TOKEN must contain only the token, without a Bot prefix")
	}
	guildID, err := strconv.ParseUint(cfg.guildID, 10, 64)
	if err != nil || guildID == 0 {
		return config{}, errors.New("DISCORD_GUILD_ID must be a nonzero numeric server ID")
	}
	for _, character := range cfg.guildID {
		if character < '0' || character > '9' {
			return config{}, errors.New("DISCORD_GUILD_ID must be a nonzero numeric server ID")
		}
	}
	return cfg, nil
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	cfg, err := loadConfig(os.Getenv)
	if err != nil {
		logger.Error("invalid bot configuration", "error", err)
		os.Exit(1)
	}
	discordgo.Logger = func(level, _ int, _ string, _ ...interface{}) {
		// SDK diagnostics can include interaction tokens and authorization payloads.
		switch level {
		case discordgo.LogError:
			logger.Error("discord SDK reported a connection issue")
		case discordgo.LogWarning:
			logger.Warn("discord SDK reported a connection warning")
		}
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	err = run(ctx, cfg, logger)
	stop()
	if err != nil {
		logger.Error("bot stopped", "error", err)
		os.Exit(1)
	}
}

func run(ctx context.Context, cfg config, logger *slog.Logger) error {
	session, err := discordgo.New("Bot " + cfg.token)
	if err != nil {
		return fmt.Errorf("create discord session: %w", safeDiscordError(err))
	}
	session.Identify.Intents = discordgo.IntentsGuilds
	session.StateEnabled = false
	session.SyncEvents = true
	session.LogLevel = discordgo.LogWarning
	session.Client = &http.Client{Timeout: 10 * time.Second}
	session.Dialer.HandshakeTimeout = 10 * time.Second

	startupCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	user, err := session.User("@me", discordgo.WithContext(startupCtx))
	if err != nil {
		return fmt.Errorf("authenticate bot: %w", safeDiscordError(err))
	}
	if user == nil || user.ID == "" {
		return errors.New("discord returned no bot identity")
	}
	if err := registerCommands(startupCtx, session, user.ID, cfg.guildID); err != nil {
		return err
	}
	cancel()
	session.AddHandler(func(s *discordgo.Session, event *discordgo.InteractionCreate) {
		if err := respond(ctx, s, event, cfg.guildID); err != nil && ctx.Err() == nil {
			logger.Error("slash command response failed", "error", err)
		}
	})
	session.AddHandler(func(_ *discordgo.Session, _ *discordgo.Ready) {
		logger.Info("bot connected", "guild_id", cfg.guildID)
	})
	if ctx.Err() != nil {
		return nil
	}
	if err := session.Open(); err != nil {
		return fmt.Errorf("connect discord gateway: %w", safeDiscordError(err))
	}
	defer func() {
		if err := session.Close(); err != nil {
			logger.Warn("close discord gateway", "error", safeDiscordError(err))
		}
	}()
	logger.Info("bot ready", "commands", "/ping, /about")
	<-ctx.Done()
	logger.Info("stopping bot")
	return nil
}

func registerCommands(ctx context.Context, session *discordgo.Session, appID, guildID string) error {
	commands := []*discordgo.ApplicationCommand{
		{Name: "ping", Description: "Check that the bot is responding.", Type: discordgo.ChatApplicationCommand},
		{Name: "about", Description: "Learn about this bot.", Type: discordgo.ChatApplicationCommand},
	}
	for _, command := range commands {
		_, err := session.ApplicationCommandCreate(appID, guildID, command, discordgo.WithContext(ctx))
		if err != nil {
			return fmt.Errorf("register /%s: %w", command.Name, safeDiscordError(err))
		}
	}
	return nil
}

func respond(
	ctx context.Context,
	session *discordgo.Session,
	event *discordgo.InteractionCreate,
	guildID string,
) error {
	if event == nil || event.Interaction == nil {
		return nil
	}
	if event.Type != discordgo.InteractionApplicationCommand || event.GuildID != guildID {
		return nil
	}
	data, ok := event.Data.(discordgo.ApplicationCommandInteractionData)
	if !ok {
		return nil
	}
	var content string
	switch data.Name {
	case "ping":
		content = "Pong! Your bot is online."
	case "about":
		content = "A Go slash-command bot built with DiscordGo. Make it your own: https://github.com/Deplexo/examples"
	default:
		return nil
	}
	responseCtx, cancel := context.WithTimeout(ctx, 2500*time.Millisecond)
	defer cancel()
	err := session.InteractionRespond(event.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: content,
			Flags:   discordgo.MessageFlagsEphemeral,
			AllowedMentions: &discordgo.MessageAllowedMentions{
				Parse: []discordgo.AllowedMentionType{},
			},
		},
	}, discordgo.WithContext(responseCtx), discordgo.WithRetryOnRatelimit(false))
	if err != nil {
		return fmt.Errorf("respond to /%s: %w", data.Name, safeDiscordError(err))
	}
	return nil
}

func safeDiscordError(err error) error {
	if errors.Is(err, context.Canceled) {
		return context.Canceled
	}
	if errors.Is(err, context.DeadlineExceeded) {
		return context.DeadlineExceeded
	}
	if errors.Is(err, discordgo.ErrUnauthorized) {
		return errors.New("discord rejected the bot token; check DISCORD_BOT_TOKEN")
	}
	var restErr *discordgo.RESTError
	if errors.As(err, &restErr) && restErr.Response != nil {
		code := 0
		if restErr.Message != nil {
			code = restErr.Message.Code
		}
		return fmt.Errorf(
			"discord API returned HTTP %d (code %d); check the token, guild ID, and bot permissions",
			restErr.Response.StatusCode,
			code,
		)
	}
	var networkErr net.Error
	if errors.As(err, &networkErr) && networkErr.Timeout() {
		return errors.New("discord connection timed out")
	}
	return errors.New("discord connection failed; check credentials, server permissions, and connectivity")
}

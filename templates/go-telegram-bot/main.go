package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"regexp"
	"strings"
	"syscall"
	"time"

	"github.com/PaulSonOfLars/gotgbot/v2"
	"github.com/PaulSonOfLars/gotgbot/v2/ext"
	"github.com/PaulSonOfLars/gotgbot/v2/ext/handlers"
)

var tokenPattern = regexp.MustCompile(`^[1-9][0-9]*:[A-Za-z0-9_-]+$`)

func main() {
	if err := run(); err != nil {
		slog.Error("Bot stopped", "error", err)
		os.Exit(1)
	}
}

func run() error {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	token, err := validateToken(os.Getenv("TELEGRAM_BOT_TOKEN"))
	if err != nil {
		return err
	}
	bot, err := newBot(token, http.Client{Timeout: 30 * time.Second})
	if err != nil {
		return err
	}
	if ctx.Err() != nil {
		return nil
	}
	updater := ext.NewUpdater(newDispatcher(), &ext.UpdaterOpts{
		UnhandledErrFunc: func(err error) {
			if !errors.Is(err, context.Canceled) {
				slog.Warn("Telegram polling failed; retrying", "error", safeTelegramError(err))
			}
		},
	})
	if err := updater.StartPolling(bot, &ext.PollingOpts{
		EnableWebhookDeletion: true,
		GetUpdatesOpts: &gotgbot.GetUpdatesOpts{
			AllowedUpdates: []string{"message"},
			Timeout:        20,
			RequestOpts:    &gotgbot.RequestOpts{Timeout: 25 * time.Second},
		},
	}); err != nil {
		return fmt.Errorf("start polling: %w", safeTelegramError(err))
	}
	slog.Info("Bot ready", "username", bot.Username, "commands", "/start /help /ping")
	<-ctx.Done()
	if err := updater.Stop(); err != nil {
		return fmt.Errorf("stop polling: %w", safeTelegramError(err))
	}
	slog.Info("Bot stopped cleanly")
	return nil
}

func validateToken(raw string) (string, error) {
	token := strings.TrimSpace(raw)
	if token == "" {
		return "", errors.New("TELEGRAM_BOT_TOKEN is required; create a bot with @BotFather")
	}
	if !tokenPattern.MatchString(token) {
		return "", errors.New("TELEGRAM_BOT_TOKEN has an invalid format; copy the complete token from @BotFather")
	}
	return token, nil
}

func newBot(token string, client http.Client) (*gotgbot.Bot, error) {
	bot, err := gotgbot.NewBot(token, &gotgbot.BotOpts{
		BotClient: &gotgbot.BaseBotClient{
			Client:             client,
			DefaultRequestOpts: &gotgbot.RequestOpts{Timeout: 10 * time.Second},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("connect to Telegram: %w", safeTelegramError(err))
	}
	return bot, nil
}

func newDispatcher() *ext.Dispatcher {
	dispatcher := ext.NewDispatcher(&ext.DispatcherOpts{
		MaxRoutines: 8,
		Error: func(_ *gotgbot.Bot, _ *ext.Context, err error) ext.DispatcherAction {
			slog.Error("Command failed", "error", safeTelegramError(err))
			return ext.DispatcherActionNoop
		},
		Panic: func(_ *gotgbot.Bot, _ *ext.Context, _ any) {
			slog.Error("Command panicked; check your handler implementation")
		},
		UnhandledErrFunc: func(err error) {
			slog.Error("Update failed", "error", safeTelegramError(err))
		},
	})
	dispatcher.AddHandler(handlers.NewCommand("start", reply("Hello! Your Go Telegram bot is running. Send /help to see the commands.")))
	dispatcher.AddHandler(handlers.NewCommand("help", reply("/start — Say hello\n/help — Show commands\n/ping — Check that the bot is online")))
	dispatcher.AddHandler(handlers.NewCommand("ping", reply("Pong!")))
	return dispatcher
}

func reply(text string) handlers.Response {
	return func(bot *gotgbot.Bot, ctx *ext.Context) error {
		if ctx.EffectiveMessage == nil {
			return nil
		}
		_, err := ctx.EffectiveMessage.ReplyMessage(bot, text, nil)
		if err != nil {
			return safeTelegramError(err)
		}
		return nil
	}
}

// Telegram errors can contain request URLs with the bot token or private message text.
func safeTelegramError(err error) error {
	var apiError *gotgbot.TelegramError
	if errors.As(err, &apiError) {
		switch apiError.Code {
		case http.StatusUnauthorized:
			return errors.New("Telegram rejected TELEGRAM_BOT_TOKEN; replace it with a valid @BotFather token")
		case http.StatusConflict:
			return errors.New("another bot instance is polling; run only one instance with this token")
		case http.StatusTooManyRequests:
			return errors.New("Telegram rate limit reached; reduce outgoing messages")
		default:
			return fmt.Errorf("Telegram API returned error code %d", apiError.Code)
		}
	}
	if errors.Is(err, context.DeadlineExceeded) {
		return errors.New("Telegram request timed out; check outbound connectivity")
	}
	if errors.Is(err, context.Canceled) {
		return errors.New("Telegram request canceled")
	}
	return errors.New("Telegram request failed; check the bot token and outbound connectivity")
}

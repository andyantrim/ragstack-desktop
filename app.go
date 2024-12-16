package main

import (
	"context"
	"fmt"

	"github.com/tmc/langchaingo/llms"
	"github.com/tmc/langchaingo/llms/openai"
)

// App struct
type App struct {
	ctx      context.Context
	messages []llms.MessageContent
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Ask returns an LLM answer to a question
func (a *App) Ask(question string) string {
	llm, err := openai.New(openai.WithModel("gpt-4o-mini"))
	if err != nil {
		return fmt.Sprintf("%w", err)
	}
	messages := append(a.messages, llms.MessageContent{
		Role: llms.ChatMessageTypeHuman,
		Parts: []llms.ContentPart{
			llms.TextContent{
				Text: question,
			},
		},
	})
	res, err := llm.GenerateContent(a.ctx, messages)
	if err != nil {
		return fmt.Sprintf("%w", err)
	}

	if len(messages) > 10 {
		messages = messages[0:9]
	}
	a.messages = messages
	return res.Choices[0].Content
}

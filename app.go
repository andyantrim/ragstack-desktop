package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"

	"github.com/tmc/langchaingo/chains"
	"github.com/tmc/langchaingo/documentloaders"
	"github.com/tmc/langchaingo/llms"
	"github.com/tmc/langchaingo/llms/openai"
	"github.com/tmc/langchaingo/schema"
	"github.com/tmc/langchaingo/textsplitter"

	wails "github.com/wailsapp/wails/v2/pkg/runtime"
)

var (
	FileOpenError = errors.New("Could not open file")
	FileLoadError = errors.New("Could not load file")
)

// App struct
type App struct {
	ctx      context.Context
	messages []llms.MessageContent
	log      *slog.Logger
	chain    chains.Chain
	filepath string
	docs     []schema.Document
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.log = slog.Default()

	llm, err := openai.New(openai.WithModel("gpt-4o-mini"))
	if err != nil {
		slog.Error("failed to start llm connection", err)
		panic(err)
	}
	a.chain = chains.LoadStuffQA(llm)
}

// Ask returns an LLM answer to a question
func (a *App) Ask(question string) string {
	result, err := chains.Call(a.ctx, a.chain, map[string]any{
		"input_documents": a.docs,
		"question":        question,
	})
	if err != nil {
		a.log.Error("failed", err)
		return fmt.Sprintf("%w", err)
	}
	rawValue, exist := result["text"]
	if !exist {
		a.log.Error("cannot parse response")
		return "Cannot parse response"
	}
	if value, ok := rawValue.(string); !ok {
		a.log.Error("cannot parse response value to string")
		return "Cannot parse response value to string"
	} else {
		return value
	}
}

func (a *App) SelectFile() string {
	var err error
	a.filepath, err = wails.OpenFileDialog(a.ctx, wails.OpenDialogOptions{
		Title: "Select File To talk to",
		Filters: []wails.FileFilter{
			{
				DisplayName: "Plain text files (*.txt,*.md)",
				Pattern:     "*.txt;*.md",
			},
		},
	})
	if err != nil {
		return fmt.Sprintf("%w", err)
	}
	a.docs, err = fileToDocuments(a.filepath)
	if err != nil {
		return fmt.Sprintf("%w", err)
	}

	a.log.Warn(a.filepath)

	return a.filepath
}

func fileToDocuments(filepath string) ([]schema.Document, error) {
	f, err := os.Open(filepath)
	if err != nil {
		return nil, errors.Join(FileOpenError, err)
	}

	p := documentloaders.NewText(f)

	split := textsplitter.NewRecursiveCharacter()
	split.ChunkSize = 300   // size of the chunk is number of characters
	split.ChunkOverlap = 30 // overlap is the number of characters that the chunks overlap
	return p.LoadAndSplit(context.Background(), split)
}

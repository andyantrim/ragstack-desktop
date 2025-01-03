package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"ragstack-desktop/ai"
	"time"

	"github.com/tmc/langchaingo/documentloaders"
	"github.com/tmc/langchaingo/llms"
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
	llm      *ai.LLM
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

	var err error
	a.llm, err = ai.NewLLM()
	if err != nil {
		panic(err)
	}
}

// Ask returns an LLM answer to a question
func (a *App) Ask(question string) string {
	ctx, cancel := context.WithTimeout(a.ctx, time.Second*30)
	defer cancel()
	resp, err := a.llm.Query(ctx, question, &a.docs)
	if err != nil {
		a.log.Error("Failed to query llm %w", err)
		return fmt.Sprintf("%s", err.Error())
	}
	return resp
}

func (a *App) SelectFile() string {
	var err error
	a.filepath, err = wails.OpenFileDialog(a.ctx, wails.OpenDialogOptions{
		Title: "Select File To talk to",
		Filters: []wails.FileFilter{
			{
				DisplayName: "Plain text files (*.txt,*.md)",
				Pattern:     "*.txt;*.md", // TODO: This could be any plain text file
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

	a.log.Debug(a.filepath)

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

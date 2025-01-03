package ai

import (
	"context"
	"errors"
	"os"

	"github.com/tmc/langchaingo/chains"
	"github.com/tmc/langchaingo/llms/anthropic"
	"github.com/tmc/langchaingo/llms/openai"
	"github.com/tmc/langchaingo/schema"
)

type Provider int

const (
	OpenAI Provider = iota
	Claude
	OPENAI_KEY = "OPENAI_API_KEY"
	CLAUDE_KEY = "ANTROPIC_API_KEY"
)

var (
	NoProviderKeyErr   = errors.New("No provider key found, please set either OPENAI_API_KEY or ANTROPIC_API_KEY")
	ParsingResponseErr = errors.New("Cannot parse response from LLM, 'text' does not exist in response")
	CastingErr         = errors.New("Cannot parse response, 'text' is not a string")
)

type LLM struct {
	Chain    chains.Chain
	Provider Provider
}

func NewLLM() (*LLM, error) {
	if key := os.Getenv(OPENAI_KEY); key != "" {
		return NewOpenAILLM("gpt-4o-mini")
	} else if key := os.Getenv(CLAUDE_KEY); key != "" {
		return NewClaudeLLM("")
	}

	return nil, NoProviderKeyErr

}

func NewOpenAILLM(model_name string) (*LLM, error) {
	llm, err := openai.New(openai.WithModel(model_name))
	if err != nil {
		return nil, err
	}
	return &LLM{
		Chain:    chains.LoadStuffQA(llm),
		Provider: OpenAI,
	}, nil
}

func NewClaudeLLM(model_name string) (*LLM, error) {
	llm, err := anthropic.New(anthropic.WithModel(model_name))
	if err != nil {
		return nil, err
	}
	return &LLM{
		Chain:    chains.LoadStuffQA(llm),
		Provider: OpenAI,
	}, nil
}

// Ask returns an LLM answer to a question
func (l *LLM) Query(ctx context.Context, question string, docs *[]schema.Document) (string, error) {
	result, err := chains.Call(ctx, l.Chain, map[string]any{
		"input_documents": *docs,
		"question":        question,
	})
	if err != nil {
		return "", err
	}
	rawValue, exist := result["text"]
	if !exist {
		return "", errors.Join(ParsingResponseErr, err)
	}
	if value, ok := rawValue.(string); !ok {
		return "", errors.Join(CastingErr, err)
	} else {
		return value, nil
	}
}

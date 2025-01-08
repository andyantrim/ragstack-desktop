# Rag-stack
An early prototype desktop app for conversing with documents

![Screenshot from 2024-12-19 22-56-17](https://github.com/user-attachments/assets/247161ce-a273-44a5-9740-3ffe4f23351b)


## Goal
To create a generic and pluggable desktop application that can be used to converse with documents on your machine
across a wide variety of large language models, both hosted, and local


## Plans

- ~Working chat application on openAI, that is able to have a memory window~
- ~Select a document to chat with~
- UI to configure connection with OpenAI (Note currently it looks for openAI then claude API key)
- Support for other major cloud providers
- Support for local language models
- Saving chat history window, and settings

## Building

This application is built with wails! To run locally clone this repo and run `wails dev`.
Windows and linux binaries (amd64) are in the release tab, but may be outdated

## Running the release binary/exe
**Only tested on linux amd64, windows version is there, but un-tested**
- Download the binary/exe
- Ensure you have either `OPENAI_API_KEY` or `ANTROPIC_API_KEY` variable set in your enviornment (sorry I've not got round to the UI yet!)
- Run and select a file to chat to!

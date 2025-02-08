LLM Clients (In JavaScript)
===

This is some JavaScript client to call some LLM provider APIs.

Node.js Version requirement: >= 20

Scripts
---

- `gen-ollama`: Simple script that send chat request to Ollama Server

```
Usage: gen-ollama [options] prompt.

Options: 
    --out    FILE          Output LLM response lines to FILE (env: OUT_FILE)
    --model  MODEL_NAME    Use model MODEL_NAME (env: LLM_MODEL)
    --server SERVER_URL    Use SERVER_URL as endpoint base name (env: SERVER_URL)

Note: '-' in arg list will stop param reading and take prompt from STDIN

Env:
    LLM_SYSTEM_PROMPT_FILE    Provide a text file as system prompt.
    LLM_KEEP_ALIVE            How long for keep LLM model in memory, default is '5m'.
```


- `gen-openai`: Simple script that send chat request to OpenAI 

```
Usage: gen-openai [options] prompt.

Options: 
    --out    FILE          Output LLM response lines to FILE (env: OUT_FILE)
    --model  MODEL_NAME    Use model MODEL_NAME (env: LLM_MODEL)
    --server SERVER_URL    Use SERVER_URL as endpoint base name (env: SERVER_URL)
    --memory MEMORY_FILE   Use the given file to save the chat for continue (env: LLM_MEMORY_FILE)

Note: '-' in arg list will stop param reading and take prompt from STDIN

Env:
    OPENAI_API_KEY            OpenAI API Key, required.
    LLM_SYSTEM_PROMPT_FILE    Provide a text file as system prompt.
    LLM_SYSTEM_PROMPT_ROLE    Role name of system prompt, default is 'developer' (for old models please use 'system').

```

- `gen-gemini`: Simple script that send chat request to Gemini

```
Usage: gen-gemini [options] prompt.

Options: 
    --out    FILE          Output LLM response lines to FILE (env: OUT_FILE)
    --model  MODEL_NAME    Use model MODEL_NAME (env: LLM_MODEL)
    --server SERVER_URL    Use SERVER_URL as endpoint base name (env: SERVER_URL)
    --memory MEMORY_FILE   Use the given file to save the chat for continue (env: LLM_MEMORY_FILE)

Note: '-' in arg list will stop param reading and take prompt from STDIN

Env:
    GEMINI_API_KEY            Google Gemini API Key, required.
    LLM_SYSTEM_PROMPT_FILE    Provide a text file as system prompt.
```
---
layout: post
title: "LangChain Overview"
date: 2025-04-14 12:00:00 -0000
categories: [AI]
permalink: /LangChain/
tags: [LangChain]
---


# LangChain

--- 

* LangChain is a framework for LLM applications

---

## Introduction

### Installation & Setup

1. Install package
```
pip install -qU "langchain[deepseek]" 
``` 

2. Get Environment Variables and Chat Model

```
import getpass
import os

if not os.environ.get("OPENAI_API_KEY"):
  os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter API key for OpenAI: ")

from langchain.chat_models import init_chat_model

model = init_chat_model("gpt-4o-mini", model_provider="openai")
```

3. First API Call
```
model.invoke("Hello, world!")
```  

---

## Architecture

#### Some Open Source Libraries

```
langchain-core
``` 
  * Basic chat model features 
```
langchain-deepseek
```
  * Integration package specifically for the deepseek chat models
```
langchain
```
  * Chains, agents, and retrieval strategies that orchestrate an application's actual, logically implemented features
```
langgraph
``` 
  * Framework for orchestration
  * Represents an application's LLM steps as edges and nodes in a graph

--- 
## Tutorials

### Simple LLM with Chat Model and Prompt Templates

1. Installation
  ```
pip install langchain
``` 

#### Note: Use LangSmith!
  * Used to construct more complex applications
  * Can inspect agents and chains more easily
* LangSmith Environment Variables

``` 
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="..."
export LANGSMITH_PROJECT="default" # or any other project name
``` 
2. Simple Call to a Chat Model

``` 
from langchain_core.messages import HumanMessage, SystemMessage

messages = [
    SystemMessage("Translate the following from English into Italian"),
    HumanMessage("hi!"),
]

model.invoke(messages)
``` 
  * A ChatModel (model.invoke) is a LangChain runnable
  * LangChain Runnables
    * Expose an interface to interact with a chat model
  * Example Langchain Message
```
AIMessage(content='Ciao!', additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 3, 'prompt_tokens': 20, 'total_tokens': 23, 'completion_tokens_details': {'accepted_prediction_tokens': 0, 'audio_tokens': 0, 'reasoning_tokens': 0, 'rejected_prediction_tokens': 0}, 'prompt_tokens_details': {'audio_tokens': 0, 'cached_tokens': 0}}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_0705bf87c0', 'finish_reason': 'stop', 'logprobs': None}, id='run-32654a56-627c-40e1-a141-ad9350bbfd3e-0', usage_metadata={'input_tokens': 20, 'output_tokens': 3, 'total_tokens': 23, 'input_token_details': {'audio': 0, 'cache_read': 0}, 'output_token_details': {'audio': 0, 'reasoning': 0}})
```  


#### Message Objects

* ChatModels receive message objects as inputs
* They generate message objects as outputs in return
* Message objects store a role for the chat
* Message objects store other useful metadata like token usage counts and tool calls
* OpenAI Format

``` 
model.invoke("Hello")

model.invoke([{"role": "user", "content": "Hello"}])

model.invoke([HumanMessage("Hello")])
``` 

#### Streaming
* Remember: Chat Models are Runnables
* Runnables expose interfaces from the API to the developer
* Runnables interface includes
  * Async mode of invocation
  * Streaming mode of invocation
* This way, we can stream individual tokens from a chat model
* Streaming tokens as they arrive instead of once they are all compiled and sent at once
* Streaming Usage

  ```
  for token in model.stream(messages):
      print(token.content, end="|")
  ``` 

#### Prompt Templates

* Transformations
  * Often transformations are made on the user input before being sent to the AI model
  * Including
    * Adding a system message or metadata
    * Formatting a template with user input
* Example
```
from langchain_core.prompts import ChatPromptTemplate

system_template = "Translate the following from English into {language}"

prompt_template = ChatPromptTemplate.from_messages(
    [("system", system_template), ("user", "{text}")]
)
``` 
``` 
language 
``` 
* The language to translate text into
``` 
text
 ``` 
* The text to be translated

* Note:
  * ChatPromptTemplate supports multiple message roles
  * In our example we formatted the language variable as a system message
  * We formatted the user text into a user message

* How to Invoke a Template with Correct Parameters
```
prompt = prompt_template.invoke({"language": "Italian", "text": "hi!"})

prompt
``` 

* What  **prompt**  Returns:
```
ChatPromptValue(messages=[SystemMessage(content='Translate the following from English into Italian', additional_kwargs={}, response_metadata={}), HumanMessage(content='hi!', additional_kwargs={}, response_metadata={})])
```
* What **prompt.to_messages()** Returns:
```
[SystemMessage(content='Translate the following from English into Italian', additional_kwargs={}, response_metadata={}),
 HumanMessage(content='hi!', additional_kwargs={}, response_metadata={})]
``` 
* How to Actually Get a Response From our Invocation:
```
response = model.invoke(prompt)
print(response.content)
``` 


# Topics To Explore Next

* [Conceptual Guide](https://python.langchain.com/docs/concepts/)
* [Tools / Function Calling](https://python.langchain.com/docs/concepts/tools/)
  * For some reason, a separate [tool calling](https://python.langchain.com/docs/concepts/tool_calling/) doc exists
* [Agents / Calling External APIs](https://python.langchain.com/docs/concepts/agents/)
  * [LangGraph](https://python.langchain.com/docs/concepts/architecture/#langgraph) is recommended for constructing agents
  
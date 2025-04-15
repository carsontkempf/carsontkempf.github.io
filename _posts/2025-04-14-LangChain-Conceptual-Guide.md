---
layout: post
title: "LangChain-Conceptual-Guide"
date: 2025-04-14 20:34:39 -0000
categories: [LangChain]
permalink: /LangChain-Conceptual-Guide/
---

# High Level

--- 

## Why LangChain?

* Helps developers build applications that reason. 
* LangChain is modular so any useful components can be easily integrated

--- 

## Architecture

| Architecture |        Uses        |        Uses        |
|:------------:|:------------------:|:------------------:|
| Deployment:  | LangGraph Platform | LangGraph Platform |
| Components:  |    Integrations    |    Integrations    |
| Architecture |     LangChain      |     LangGraph      |

|     LangSmith     |
|:-----------------:|
|    Playground     |
|     Debugging     |
| Prompt Management |
|    Annotation     |
|      Testing      |
|    Monitoring     |

---

## langchain-core

* Basic packages
* Chat models
* Vector stores
* Tools

--- 

## langchain

* Contains chains and retrieval strategies
* Not third party integrations
* Not specific to one integration

---

## Integration Packages

* Popular integrations have their own packages

1. langchain-openai
2. langchain-anthropic
3. langchain-deepseek

---

## langgraph

* An extension of langchain
* Aimed at building robust and complex applications with LLMs
* Used when LLMs need multiple actions

Modeling
* Models steps as edges and nodes in a graph

[LangGraph Overview
](https://langchain-ai.github.io/langgraph/concepts/high_level/#core-principles)

---

## langserve

* Deploys langchains as REST APIs
* Get a production ready API up and running
* Meant for very primitive langchain functionality

---

## LangSmith

* Developer platform
* Work with LLM applications

---

# Concepts

---

## Chat Models

* LLMs exposed via a chat API

---

## Messages

* The unit of communication in chat models (not including the atomic token)
* Used to represent model input and output

---

## Chat History

* A conversation represented as a sequence of messages
* Alternates between user messages and model responses

---

## Tools

* A function associated with a model's input schema
* Requires specific arguments

---

## Tool Calling

* A type of chat model API
* Accepts tool schemas as inputs
* Returns a specific JSON invocation to one of our tools

---

## [Structured Output](https://python.langchain.com/docs/concepts/structured_outputs/)

* A technique to make a chat model respond in a structured format
* Matches any schema we might want to fit

---

## Memory

* Information about a conversation that persists to future conversations

---

## Multimodality

* Working with multiple modes of information
* Could be text, audio, video, and images

---

## Runnable Interface

* Basic class that LangChain components are built on top of

---

## Streaming

* LangChain API for outputting results as they are generated
* As opposed to after the response is completed

---

## Document Loaders

* Load a source as a list of documents

---

## Retrieval

* Can retrieve information from structured or unstructured data
* Comes from a datasource after a query requests retrieval

---

## Text Splitters

* Splits model outputs 

---

## Embedding Models

* Models can represent data such as text or images
* Does this in a vector space

---

## Vector Stores

* Stores vectors
* Allows search over vectors and metadata

---

## Retriever

* Returns documents from a knowledge base
* Does this after a query requtests

---

## Retrieval Augmented Generation (RAG)

* Combines LLMs with external knowledge bases

---

## [Agents](https://python.langchain.com/docs/concepts/agents/)

* Using a LLM to choose a sequence of actions to take
* A model can interact with external resources (tools)

---

## Prompt Templates

* Factoring static parts of a prompt

---

## Output Parsers

* Taking the output of a model and transforming it

---

## Few-shot Prompting

* Providing a few examples of the task in the prompt

---

## Example Selectors

* Selects the most relevant examples from a dataset based on a given input
* Used in few-shot prompting

---

## [Testing](https://python.langchain.com/docs/concepts/testing/)

* Verify a component works

---


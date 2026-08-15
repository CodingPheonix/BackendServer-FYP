# Service Layer

This directory contains the Service Layer of the application. The services are responsible for housing the core business logic, orchestrating workflows between various components (like repositories and RAG pipelines), and ensuring data is properly formatted before hitting the database.

Here is a high-level overview of each service and its primary purpose:

## Core Services

### `chatService` (`chatService.ts`)
**Purpose:** Handles the business logic for user conversations.
- **How it works:** Provides a simplified interface to append messages to the chat history, fetch transcripts, and clear them, abstracting away the underlying database array manipulation (`$push`) done by the repository.

### `runtimeService` (`runtimeService.ts`)
**Purpose:** Orchestrates the lifecycle and persistent state of user sessions.
- **How it works:** It goes beyond simple CRUD by resolving human-readable names (e.g., plant names, disease names) into their corresponding database IDs before initializing or starting a session. It ensures that the session's "working memory" is properly structured and updated in the database.

## RAG (Retrieval-Augmented Generation) Services

### `IngestionService` (`IngestionService.ts`)
**Purpose:** Orchestrates the complex pipeline of adding new documents into the system's knowledge base.
- **How it works:** When a file is uploaded, this service coordinates multiple steps: parsing the raw document (e.g., PDF), summarizing its contents page-by-page to enrich metadata, embedding it into the Vector Database, and finally cleaning up the temporary files from the server.

### `RetrievalService` (`RetrievalService.ts`)
**Purpose:** Orchestrates the search and retrieval pipeline to answer user queries using the knowledge base.
- **How it works:** It takes a raw user query, optimizes it for better search results, retrieves relevant context from the Vector Database, compresses/summarizes that context, and updates the active session so the AI can use it to formulate an answer.

## Domain Services

### `FertilizerService` (`FertilizerService.ts`)
**Purpose:** Manages business logic specific to fertilizers.
- **How it works:** Handles specific formatting requirements before data reaches the repository, such as injecting placeholder images during bulk ingestion or providing a specific method to update a fertilizer's image URL.

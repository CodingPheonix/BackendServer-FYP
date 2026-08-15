# Router Layer

This directory contains the Express routers that define the API endpoints for the application. Each router focuses on a specific domain or feature and delegates the actual business logic to the corresponding services.

Here is a high-level overview of each router and its purpose:

## Core System Routers

### `chatRouter` (`chatRouter.ts`)
**Purpose:** Provides endpoints to manage conversation histories.
- **How it works:** Exposes a `GET` route to fetch the chat history of a specific session and a `DELETE` route to clear it. It acts as the HTTP interface for the chat memory system.

### `sessionRouter` (`sessionRouter.ts`)
**Purpose:** Manages the lifecycle of real-time user sessions.
- **How it works:** Provides endpoints to initialize (`/init`) a session into memory, start (`/start`) a brand new session with initial plant/disease context, and delete (`/`) a session entirely from both the database and the active runtime.

## Domain & Knowledge Routers

### `fertilizerRoutes` (`fertilizerRoutes.ts`)
**Purpose:** Handles standard CRUD operations and specific bulk actions for fertilizers.
- **How it works:** Exposes endpoints to fetch fertilizers (`GET`), ingest multiple fertilizer records at once (`POST /bulk`), and update specific fertilizer images (`PATCH /:id/image`).

### `ingestionRouter` (`ingestionRouter.ts`)
**Purpose:** Serves as the entry point for adding new documents to the RAG knowledge base.
- **How it works:** Uses `multer` to accept file uploads (`POST /`) and delegates the processing of these files (e.g., PDF extraction and embedding) to the ingestion service, categorizing them as either 'fertilizer' or 'disease' data.

### `retrievalRouter` (`retrievalRouter.ts`)
**Purpose:** Provides the search interface for the RAG system.
- **How it works:** Exposes a `POST /` endpoint that takes a user's query along with their session details, and returns compressed, relevant context retrieved from the knowledge base to answer their questions.

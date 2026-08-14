# Backend Server

This is an Express + TypeScript template generated for the backend server.

## Folder Structure
- `src/`: Application source code
  - `GeminiAdapter/`: Integration and controller logic for the Gemini Live API
  - `RAG_pipelines/`: Data ingestion and semantic retrieval pipelines for vector search
  - `model/`: Database models and schemas
  - `repository/`: Data access logic and database operations
  - `router/`: API route definitions
  - `runtime/`: In-memory runtime state and session management
  - `service/`: Core business logic
  - `socket/`: Socket.IO event handlers and connection logic
  - `tests/`: Unit and integration tests
  - `utils/`: Reusable utility functions

## Scripts
- `npm run dev`: Start development server using tsx
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run the compiled JavaScript code
- `npm test`: Run tests using Vitest

## Getting Started
1. Run `npm install` to install dependencies
2. Copy `.env.example` to `.env` and fill in the environment variables
3. Run `npm run dev` to start the server

## Build Instructions
Run `npm run build` to compile the TypeScript code. The output will be located in the `dist` directory.

## Emitting Sockets
The server emits the following Socket.IO events to connected clients during a Live API session:

- **`live_session_started`** (No parameters): Emitted when the AI session successfully connects.
- **`audio_output`** (`ArrayBuffer`): Streams raw PCM audio data (24kHz) from the AI.
- **`text_output`** (`string`): Streams text responses from the AI.
- **`task_update`** (`{ category: string, task: string }`): Emits status updates when the AI executes background tools.
- **`interrupted`** (No parameters): Emitted if the AI's response is interrupted.
- **`session_warning`** (`string`): Warns the client of impending session closure.
- **`error`** (`string`): Emitted when a connection or processing error occurs.

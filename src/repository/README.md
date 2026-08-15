# Repository Layer

This directory contains the Data Access Layer (Repositories) for the application. The repositories act as an intermediary between the application logic (services) and the database (Mongoose models), abstracting away direct database queries.

Here is a high-level overview of each repository and its purpose:

## Core Repositories

### `chatRepository` (`chatRepository.ts`)
**Purpose:** Manages the persistent history of user conversations.
- **How it works:** Instead of standard CRUD, it focuses on appending individual messages to an existing conversation thread using MongoDB's `$push` array operator, creating a new thread if one doesn't exist via `upsert`. It also fetches and clears chat histories based on specific user and session IDs.

### `SessionRepository` (`SessionRepository.ts`)
**Purpose:** Manages the active, real-time context of a user's session.
- **How it works:** It provides methods to create, fetch, and destroy session data uniquely identified by a combination of `userId` and `sessionId`. Crucially, whenever a session is updated, it automatically refreshes the `lastActivityAt` timestamp to track active vs. stale sessions.

## Domain Repositories

### `CropRepository` (`CropRepository.ts`)
**Purpose:** Handles all database interactions related to the catalog of supported plants and crops.
- **How it works:** Provides standard CRUD (Create, Read, Update, Delete) operations and bulk inserts (`insertMany`) for the `Crop` model.

### `DiseaseRepository` (`DiseaseRepository.ts`)
**Purpose:** Manages the knowledge base of plant diseases and deficiencies.
- **How it works:** Alongside standard CRUD operations, it provides specific querying capabilities, such as `findByCropId`, to easily fetch all potential diseases that can affect a specific type of crop.

### `FertilizerRepository` (`FertilizerRepository.ts`)
**Purpose:** Manages the inventory and details of various fertilizers.
- **How it works:** Provides straightforward CRUD operations and bulk insertion capabilities for the `Fertilizer` model, keeping the underlying data structure abstracted from the rest of the app.

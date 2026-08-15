# Database Models

This directory contains the Mongoose models used throughout the application. Here is a high-level overview of each model and its primary purpose:

## Core Models

### `Chat` (`Chat.ts`)
**Purpose:** Stores the persistent chat history between the user and the system (including AI responses and RAG context). 
- It acts as the long-term memory for user conversations, allowing them to view past messages and interactions.

### `Session` (`Session.ts`)
**Purpose:** Manages the real-time, active state of a user's current session. 
- It temporarily holds data needed *during* an interaction, such as the current conversation handle, the crop being analyzed, the identified disease, and recent RAG queries. It acts as the "working memory" during live interactions.

## Domain Models

### `Crop` (`Crop.ts`)
**Purpose:** Acts as the master catalog of all supported plants and crops.
- It stores essential reference data like the crop's name, scientific name, category (e.g., Vegetable, Fruit), and a representative image.

### `Disease` (`Disease.ts`)
**Purpose:** Represents the knowledge base of plant diseases and deficiencies.
- Each disease is linked to a specific `Crop` and contains comprehensive information, including symptoms, severity, prevention methods, and nutrient deficiency details.

### `Fertilizer` (`Fertilizer.ts`)
**Purpose:** Serves as the inventory and reference guide for fertilizers.
- It holds comprehensive details about various fertilizers, including their nutrient composition, safety guidelines (toxicity, storage), and market information (pricing, availability).

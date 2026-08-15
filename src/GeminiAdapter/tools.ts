import { retrievalService } from "../service/RetrievalService.js";
import { Runtime } from "../runtime/Runtime.js";
import { LiveAPIController } from "./LiveAPIController.js";
import { chatService } from "../service/chatService.js";
import { Type, Tool } from "@google/genai";

// Define the tool declarations to be passed to Gemini
export const geminiTools: Tool[] = [
    {
        functionDeclarations: [
            {
                name: "fetch_rag_details",
                description: "Fetches the current RAG (Retrieval-Augmented Generation) details for this session.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        userId: { type: Type.STRING },
                        sessionId: { type: Type.STRING }
                    }
                }
            },
            {
                name: "fetch_plant_details",
                description: "Fetches the details of the plant currently being discussed.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        userId: { type: Type.STRING },
                        sessionId: { type: Type.STRING }
                    }
                }
            },
            {
                name: "fetch_plant_disease",
                description: "Fetches the disease affecting the plant currently being discussed.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        userId: { type: Type.STRING },
                        sessionId: { type: Type.STRING }
                    }
                }
            },
            {
                name: "fetch_userId_sessionId",
                description: "Fetches the current userId and sessionId. Always run this first if you don't know them.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {}
                }
            },
            {
                name: "perform_rag_search",
                description: "Performs a RAG search in the background for a given query. Updates the session data when complete.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        query: { type: Type.STRING, description: "The search query." },
                        userId: { type: Type.STRING },
                        sessionId: { type: Type.STRING }
                    },
                    required: ["query"]
                }
            }
        ]
    }
];

export async function handleToolCall(toolCall: any, controller: LiveAPIController, sessionUserId: string, sessionSessionId: string) {
    const functionResponses: any[] = [];

    for (const fc of toolCall.functionCalls) {
        const { name, id, args } = fc;
        const userId = args?.userId || sessionUserId;
        const sessionId = args?.sessionId || sessionSessionId;

        let result: any = {};

        try {
            let taskText = `Executing ${name}`;
            if (name === "fetch_rag_details") taskText = "Fetching context";
            else if (name === "fetch_plant_details") taskText = "Gathering plant details";
            else if (name === "fetch_plant_disease") taskText = "Checking diseases";
            else if (name === "fetch_userId_sessionId") taskText = "Gathering credentials";
            else if (name === "perform_rag_search") taskText = "Initiating search";

            // send info to client
            controller.emitTaskUpdate(taskText);

            const runtime = await Runtime.getInstance(userId, sessionId);
            console.log(`[Tool Call: ${name}] Current Runtime:`, runtime);

            switch (name) {
                case "fetch_rag_details": {
                    const runtime = await Runtime.getInstance(userId, sessionId);
                    result = runtime.getRagDetails() || { status: "No RAG details found." };
                    break;
                }
                case "fetch_plant_details": {
                    const runtime = await Runtime.getInstance(userId, sessionId);
                    result = runtime.getPlantDetails();
                    break;
                }
                case "fetch_plant_disease": {
                    const runtime = await Runtime.getInstance(userId, sessionId);
                    result = { diseaseName: runtime.getDiseaseName() || "Unknown" };
                    break;
                }
                case "fetch_userId_sessionId": {
                    // Return the injected credentials
                    result = { userId: sessionUserId, sessionId: sessionSessionId };
                    break;
                }
                case "perform_rag_search": {
                    // Respond immediately that search has started
                    result = { status: "Search started in background. Ask the user to kindly be patient while data is fetched." };

                    // Execute the RAG pipeline in the background
                    const { query } = args;
                    if (query) {
                        (async () => {
                            try {
                                await retrievalService.processRetrieval(userId, sessionId, query);

                                // Fetch updated runtime to ensure in-memory state is aligned
                                const updatedRuntime = await Runtime.getInstance(userId, sessionId);
                                
                                // Log the RAG context into the chat history for UI display
                                const ragContext = updatedRuntime.getRagDetails()?.context || "No context found.";
                                const ragMessageContent = `[RAG Retrieval Complete for "${query}"]\n\nContext:\n${ragContext}`;
                                chatService.appendMessage(userId, sessionId, 'rag', ragMessageContent);
                                controller.emitChatMessage('rag', ragMessageContent);

                                // Trigger the text input to the model to act as a signal
                                controller.sendTextInput(`[SYSTEM EVENT]: Background RAG retrieval is complete for the query "${query}". Please check the recent question asked in the conversation and the newly updated RAG context to provide your answer.`);
                            } catch (err) {
                                console.error("Background RAG error:", err);
                                controller.sendTextInput(`[SYSTEM EVENT]: Background data fetch failed for query: "${query}". Please inform the user.`);
                            }
                        })();
                    }
                    break;
                }
                default:
                    result = { error: `Unknown tool: ${name}` };
            }
        } catch (error: any) {
            console.error(`Error executing tool ${name}:`, error);
            result = { error: error.message };
        }

        functionResponses.push({
            name,
            id,
            response: { result }
        });
    }

    controller.sendToolResponse({ functionResponses });
}

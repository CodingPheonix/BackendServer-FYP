import 'dotenv/config';
import { Socket } from "socket.io";
import { GoogleGenAI, Modality } from "@google/genai";
import { registerLiveApiEvents } from "../socket/liveApiSocket.js";
import { geminiTools, handleToolCall } from "./tools.js";
import { Runtime } from "../runtime/Runtime.js";
import { runtimeService } from "../service/runtimeService.js";

export class LiveAPIController {
    private ai: GoogleGenAI;
    private session: any;
    private socket: Socket;
    private userId: string;
    private sessionId: string;

    constructor(socket: Socket) {
        this.socket = socket;
        this.userId = socket.handshake.query.userId as string || 'default-user';
        this.sessionId = socket.handshake.query.sessionId as string || 'default-session';
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    public async startLiveSession() {
        await this.initLiveClient();
    }

    public sendAudioInput(pcmData: ArrayBuffer) {
        if (this.session) {
            const base64Data = Buffer.from(pcmData).toString("base64");
            this.session.sendRealtimeInput({
                audio: {
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Data
                }
            });
        }
    }

    public sendTextInput(text: string) {
        if (this.session) {
            this.session.sendRealtimeInput({
                text: text
            });
        }
    }

    public sendToolResponse(response: any) {
        if (this.session) {
            if (typeof this.session.sendToolResponse === 'function') {
                this.session.sendToolResponse(response);
            } else {
                this.session.send({ toolResponse: response });
            }
        }
    }

    public handleDisconnect() {
        console.log(`Live API Controller: Socket ${this.socket.id} disconnected.`);
        if (this.session) {
            // Note: SDK doesn't currently expose a close method natively on all streams,
            // but usually you can close the generator or close the connection.
            // (we will rely on garbage collection / standard disconnect mechanisms)
        }
    }

    public emitTaskUpdate(task: string) {
        this.socket.emit('task_update', { category: "tool", task });
    }

    async connect() {
        try {
            registerLiveApiEvents(this.socket, this);
        } catch (error) {
            console.error("Failed to setup Live API:", error);
            this.socket.emit('error', 'Failed to connect to AI');
        }
    }

    private async initLiveClient() {
        try {
            const runtime = await Runtime.getInstance(this.userId, this.sessionId);
            const previousSessionHandle = runtime.conversation?.handle;

            const config: any = {
                contextWindowCompression: {
                    slidingWindow: {}
                },
                responseModalities: [Modality.AUDIO],
                tools: geminiTools
            };

            if (previousSessionHandle) {
                config.sessionResumption = { handle: previousSessionHandle };
            }

            this.session = await this.ai.live.connect({
                model: process.env.GOOGLE_LIVE_API as string,
                config: config,
                callbacks: {
                    onopen: function () {
                        console.debug('Opened');
                    },
                    onmessage: (message: any) => this.handleMessage(message),
                    onerror: (err: any) => {
                        console.error("Live API connection error:", err);
                        this.socket.emit('error', 'Live API connection error');
                    },
                    onclose: () => {
                        console.log('Live API connection closed');
                    }
                }
            });

            this.socket.emit('live_session_started');
        } catch (error) {
            console.error("Error creating live client:", error);
            this.socket.emit('error', 'Could not initialize live session');
        }
    }

    private handleMessage(message: any) {
        try {
            if (message.serverContent) {
                const content = message.serverContent.modelTurn;
                if (content) {
                    for (const part of content.parts) {
                        if (part.inlineData && part.inlineData.data) {
                            // Audio from Gemini (24kHz PCM)
                            const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
                            this.socket.emit('audio_output', audioBuffer);
                        }
                        if (part.text) {
                            this.socket.emit('text_output', part.text);
                        }
                    }
                }
                if (message.serverContent.interrupted) {
                    this.socket.emit('interrupted');
                }

                // Handle turnComplete to know when the model is done responding
                if (message.serverContent.turnComplete) {
                }
            }

            if (message.toolCall) {
                handleToolCall(message.toolCall, this, this.userId, this.sessionId);
            }

            // Handle session management signals like GoAway
            if (message.turn && message.turn.goAway) {
                console.debug('GoAway received. Time left:', message.turn.goAway.timeLeft);
                this.socket.emit('session_warning', `Session closing soon. Time left: ${message.turn.goAway.timeLeft}`);
            }

            // Update session handle in runtime and DB if provided by the model
            if (message.sessionResumptionUpdate && message.sessionResumptionUpdate.resumable && message.sessionResumptionUpdate.newHandle) {
                const newHandle = message.sessionResumptionUpdate.newHandle;
                (async () => {
                    try {
                        const runtime = await Runtime.getInstance(this.userId, this.sessionId);
                        // update current runtime
                        runtime.conversation.handle = newHandle;
                        // update data in database
                        await runtimeService.updateSession(this.userId, this.sessionId, {
                            conversation: { handle: newHandle }
                        });
                        console.debug(`Live API handle updated in runtime and DB to: ${newHandle}`);
                    } catch (error) {
                        console.error('Failed to update session handle in runtime/DB', error);
                    }
                })();
            }
        } catch (err) {
            console.error("Live API receive error:", err);
            this.socket.emit('error', 'Live API connection error');
        }
    }
}

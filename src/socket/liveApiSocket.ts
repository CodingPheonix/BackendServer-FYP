import { Socket } from "socket.io";
import { LiveAPIController } from "../GeminiAdapter/LiveAPIController.js";

export const registerLiveApiEvents = (socket: Socket, controller: LiveAPIController) => {
    socket.on('start_live_session', async () => {
        await controller.startLiveSession();
    });

    socket.on('audio_input', (pcmData: ArrayBuffer) => {
        controller.sendAudioInput(pcmData);
    });

    socket.on('disconnect', () => {
        controller.handleDisconnect();
    });
};

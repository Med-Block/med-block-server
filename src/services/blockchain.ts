
import WebSocket from 'ws';

const PEER_ADDRESS = process.env.PEER_ADDRESS;

let ws: WebSocket;

export async function createBlock(data: any) {
    await setupConnection();
    console.log('Creating block...');
    ws.send(JSON.stringify({
        type: 'CREATE_BLOCK',
        data: data
    }));
}

function setupConnection(): Promise<void> {
    if (!PEER_ADDRESS) {
        throw new Error('PEER_ADDRESS is not defined');
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
        return Promise.resolve();
    }
    var result = new Promise<void>((resolve, reject) => {

        ws = new WebSocket(PEER_ADDRESS);

        ws.on('open', () => {
            console.log('Connected to peer');
            resolve();
        });

        ws.on('close', () => {
            console.log('Connection to peer closed');
            setTimeout(async () => {
                console.log('Reconnecting to peer...');
                await setupConnection();
            }, 5000);
        });
    });
    return result;
}
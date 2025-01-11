
import WebSocket from 'ws';

const PEER_ADDRESS = process.env.PEER_ADDRESS;

let ws: WebSocket;

export function createBlock(data: any) {
    setupConnection();
    console.log('Creating block...');
    ws.send(JSON.stringify({
        type: 'CREATE_BLOCK',
        data: data
    }));
}

function setupConnection() {
    if (!PEER_ADDRESS) {
        throw new Error('PEER_ADDRESS is not defined');
    }
    if(ws && ws.readyState === WebSocket.OPEN) {
        return;
    }

    ws = new WebSocket(PEER_ADDRESS);

    ws.on('open', () => {
        console.log('Connected to peer');
    });

    ws.on('close', () => {
        console.log('Connection to peer closed');
        setTimeout(() => {
            console.log('Reconnecting to peer...');
            setupConnection();
        }, 5000);
    });
}
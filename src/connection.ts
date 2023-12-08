export class connection {
    // private static instance: connection;
    private host: string;
    private type: string;
    private websocket_url: string;
    private http_url: string;
    private socket: WebSocket;
    public status: string;
    constructor(connection_type: string, connection_url: string) {
        this.host = connection_url;
        this.type = connection_type;
        this.websocket_url = `ws://${this.host}/ws/chats/inventory/`;
        this.http_url = `http://${this.host}`;
        this.socket = new WebSocket(this.websocket_url);
        this.status = "disconnected";
    }
    
    connect() {
        this.socket = new WebSocket(this.websocket_url);
        this.socket.onopen = () => {
            console.log("connected");
            this.status = "connected";
            // this.socket.close();
        }
    }

    send(data: any) {
        if(this.socket.readyState !== 1) {
            console.error("Socket closed reconnecting in 4 seconds");
            setTimeout(() => {
                this.connect();
            }, 4000);
            return;
        }
        this.socket.send(data);
    }

}


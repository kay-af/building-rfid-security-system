export class AppSocket {
    private server : SocketIO.Server
    private static instance : AppSocket

    public constructor(server: SocketIO.Server) {
        this.server = server
        AppSocket.instance = this
    }

    public static getInstance() : AppSocket {
        return AppSocket.instance
    }

    public getServer() : SocketIO.Server {
        return this.server
    }

    public getRFIDCount() : number {
        var sl = this.server.sockets.adapter.rooms['/rfid']
        if(!sl) return 0
        return sl.length;
    }
}
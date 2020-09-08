export default class RFIDRegistrar {
    private token_queue : Array<number>
    private used_tokens: Array<number>
    private static instance : RFIDRegistrar

    constructor(token_count = 200, starting = 1000) {
        this.token_queue = []
        for(var i=0; i<token_count; i++) this.token_queue[i] = starting + i
        this.used_tokens = []
        RFIDRegistrar.instance = this
    }

    public static getInstance() : RFIDRegistrar {
        if(!RFIDRegistrar.instance) console.log("RFID Registrar not initialized")
        return RFIDRegistrar.instance
    }

    public peek_token(): number | undefined {
        if (this.token_queue.length == 0) {
            console.log("Out of tokens!")
            return undefined
        }
        return this.token_queue[0]
    }

    public grab_next_rfid(): number | undefined {
        if(this.token_queue.length == 0) {
            console.log("Out of tokens!")
            return undefined
        }
        const token = this.token_queue.shift()
        this.used_tokens.push(token as number)
        return token
    }

    public revoke_rfid(rfid: number): void {
        if(this.used_tokens.includes(rfid)) {
            this.used_tokens.splice(this.used_tokens.indexOf(rfid), 1)
            this.token_queue.unshift(rfid)
        } else {
            console.log("RFID Token is not in use!")
        }
    }
}
import Express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import visitor_router from './router/visitor_router'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import SocketIO from 'socket.io'
import visitor_controller from './controllers/visitor_controller'
import RFIDRegistrar from './rfid_registrar'
import Visitor, { VisitorModel } from './models/visitor'
import path from 'path'
import { AppSocket } from './socket'
import DotEnv from 'dotenv'

console.log("Configuring DotEnv!")
DotEnv.config()

var { MONGO_URL, PORT } : any = process.env

if(!MONGO_URL) {
    console.log("[Required key not found] MONGO_URL in DotEnv. Process will exit now!")
    process.exit(0)
}

if(!PORT) {
    console.log("[Key not found] PORT in DotEnv. Setting default PORT = 9000.")
    PORT = 9000
}

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) return console.log(err)

    console.log("Connected to database: " + MONGO_URL)

    // Clear the visitors already in database as the server restarted
    visitor_controller.clearVisitors();

    const app = Express()

    app.use('/admin', Express.static('./public/admin_build'))
    app.use('/visitor', Express.static('./public/static_html_build'))
    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'ejs')
    app.use(cors())
    app.use(cookieParser())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use('/visitor', visitor_router)

    const express_server = app.listen(PORT, () => {
        console.log("Server started at PORT: " + PORT)
    })

    // Socket IO

    const socket_io_server = SocketIO(express_server)
    const app_socket = new AppSocket(socket_io_server)

    socket_io_server.on('frame', (data: any) => {
        socket_io_server.emit('frame', data)
    })

    var cameras: { position: { x: number, y: number, z: number }, cameraId: number, danger?: { cameraId: number, description: string } }[] = []

    const rfid_registrar = new RFIDRegistrar()

    socket_io_server.on('connect', (socket) => {

        // When a camera connects
        if (socket.handshake.query.device === "camera") {

            socket.join('/cameras')

            const position = socket.handshake.query.pos as string
            const id = socket.handshake.query.id
            const [x, y, z] = position.split(',').map(Number.parseFloat)

            socket.on('danger', (data) => {
                console.log('Fire')
                var cam = cameras[id]
                if (cam) {
                    cam.danger = data
                    cameras[id] = cam
                }

                socket_io_server.to('/admins').emit('danger', data)
            })

            socket.on('frame', (data) => {
                socket_io_server.to('/admins').emit('frame', data)
            })

            if (cameras[id]) {
                console.log("Duplicate camera IDs not allowed")
                return socket.disconnect()
            } else {

                const cameraProps = {
                    cameraId: id,
                    position: {
                        x: x,
                        y: y,
                        z: z
                    }
                }

                cameras[id] = cameraProps
                socket_io_server.to('/admins').emit('camera_init', cameraProps)
                console.log("Connected to camera!")

                socket.on('disconnect', data => {
                    console.log('Camera disconnected')
                    delete cameras[id]
                    socket_io_server.to('/admins').emit('camera_revoke', { cameraId: cameraProps.cameraId })
                })
            }
        }
        // When an Admin connects
        else if (socket.handshake.query.device === "admin") {

            if (app_socket.getRFIDCount() === 0) {
                console.log("Admin has connected before RFID initialization. Disconnecting!")
                return socket.disconnect()
            }

            console.log("An admin has connected!")
            socket.join('/admins')

            socket.on('disconnect', () => {
                console.log("An admin has disconnected!")
            })

            Visitor.find({}, (err, docs) => {
                if (err) {
                    socket.disconnect()
                    return console.log("A fatal error occured while fetching visitors list!")
                }

                docs.forEach((doc) => {
                    socket.emit('visitor_init', doc as VisitorModel)
                })
            })

            cameras.forEach(camera => {
                socket.emit('camera_init', camera)
                if (camera.danger) {
                    setTimeout(() => {
                        socket.emit('danger', camera.danger)
                    }, 3000)
                }
            })
        }
        // When a RFID visitor connects
        else if (socket.handshake.query.device === "rfid") {

            if (app_socket.getRFIDCount() > 0) {
                console.log("Multiple RFID Handlers not allowed!")
                return socket.disconnect()
            }

            socket.join('/rfid')
            console.log("RFID handler initialized!")

            socket.on('rfid_location_update', (data) => {
                socket_io_server.to('/admins').emit('location_update', data)
            })

            socket.on('disconnect', () => {
                console.log('RFID Handler disconnected!')
            })
        } else {
            socket.disconnect();
        }
    })
})
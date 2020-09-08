import { Request, Response } from "express";
import { Mongoose } from "mongoose";
import Visitor, { VisitorModel } from '../models/visitor'
import RFIDRegistrar from "../rfid_registrar";
import path from 'path'
import { AppSocket } from "../socket";

export default {
    addVisitor: (req: Request, res: Response) => {

        const { name, age, sex, disabledCheck, description } = req.body

        const rfid_reg = RFIDRegistrar.getInstance()

        const rfid_token = rfid_reg.peek_token()

        if(AppSocket.getInstance().getRFIDCount() === 0) {
            return res.render('visitor_post_add', {
                params: {
                    tokenID: -1,
                    success: false,
                    name: "",
                    error_message: "Server Error! RFID Client not active!"
                }
            })
        }

        if (!rfid_token) return res.render('visitor_post_add', {
            params: {
                tokenID: -1,
                success: false,
                name: "",
                error_message: "Sorry! We ran out of tokens :("
            }
        })

        const model = {
            allocatedRFID: rfid_token,
            details: {
                name: name,
                age: age,
                sex: sex,
                disability: {
                    disabled: disabledCheck !== undefined,
                    description: description
                }
            }
        }

        Visitor.create(model, (err: Error) => {
            if (err) {
                res.sendStatus(400)
                return console.log('Error occured while adding a visitor: ' + err.message)
            }

            // Remove the token now
            rfid_reg.grab_next_rfid()

            var socket_io_server = AppSocket.getInstance().getServer()

            socket_io_server.to('/rfid').emit('register_rfid', {
                rfid: model.allocatedRFID
            })
            
            socket_io_server.to('/admins').emit('visitor_init', model)

            res.render('visitor_post_add', {
                params: {
                    tokenID: rfid_token,
                    success: true,
                    name: name,
                    error_message: "none"
                }
            })
        })
    },

    removeVisitor: (req: Request, res: Response) => {

        const token = Number.parseInt(req.body.token)

        Visitor.findOne({
            allocatedRFID: token
        }, (err, doc) => {
            if (err) {
                res.sendStatus(500);
                return console.log('Error occured while removing a visitor: ' + err.message)
            }

            if (!doc) return res.render('visitor_post_remove', {
                params: {
                    tokenID: -1,
                    success: false,
                    name: "",
                    error_message: "The given token has not been issued!"
                }
            })

            const name = doc.details.name

            doc.remove((err: Error) => {
                if (err) {
                    res.sendStatus(500);
                    return console.log('Error occured while removing a visitor: ' + err.message)
                }

                RFIDRegistrar.getInstance().revoke_rfid(token)

                var socket_io_server = AppSocket.getInstance().getServer()
                socket_io_server.to('/admins').emit('visitor_revoke', {
                    allocatedRFID: token
                })
                socket_io_server.to('/rfid').emit('unregister_rfid', {
                    rfid: token
                })

                console.log(`Visitor removed: ${doc.allocatedRFID}`)

                res.status(200).render('visitor_post_remove', {
                    params: {
                        tokenID: req.body.token,
                        success: true,
                        error_message: "none",
                        name: name
                    }
                })
            })
        })
    },

    serveVisitorAddPage: (req: Request, res: Response) => {
        res.sendFile('visitor_add.html', {
            root: path.join(__dirname, '../../public/static_html_build/')
        })
    },

    serveVisitorRemovePage: (req: Request, res: Response) => {
        res.sendFile('visitor_remove.html', {
            root: path.join(__dirname, '../../public/static_html_build/')
        })
    },

    clearVisitors: () => {
        Visitor.deleteMany({}, (err) => {
            if (err) return console.log("Error while clearing the visitor's data in database!")
            console.log("Cleared previous visitors data!")
        })
    }
}
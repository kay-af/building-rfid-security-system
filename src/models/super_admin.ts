import { Document, Schema, model } from "mongoose";

export interface SuperAdminModel extends Document {
    username: string,
    password: string
}

const SuperAdminSchema = new Schema<SuperAdminModel>({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

export const SuperAdmin = model<SuperAdminModel>("super_admin", SuperAdminSchema)
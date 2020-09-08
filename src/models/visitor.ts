import { Document, Schema, model } from "mongoose";

interface DisablityModel {
    disabled: boolean
    description?: string
}

const DisablitySchema = new Schema({
    disabled: {
        type: Boolean,
        default: false,
        required: true
    },
    description: {
        type: String,
        required: false
    }
})

interface DetailsModel {
    name: string
    age: number
    sex: "male" | "female" | "other"
    disability: DisablityModel
}

const DetailsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    sex: {
        type: String,
        required: true,
        enum: ["male", "female", "other"]
    },
    disability: DisablitySchema
})

export interface VisitorModel extends Document {
    allocatedRFID: number
    details: DetailsModel
}

const VisitorSchema = new Schema({
    allocatedRFID: {
        type: Number,
        required: true,
        unique: true
    },
    details: {
        type: DetailsSchema,
        required: true
    }
})

export default model<VisitorModel>("visitor", VisitorSchema)
import * as mongoose from 'mongoose';

export const PropertySchema = new mongoose.Schema({
    user_id: String,
    name: String,
    address: String,
    type: String,
    description: String,
    image_url: String,
    total_rooms: String,
    occupancy_type: String,
    rent_amount: String,
    rent_frequency: String,
    is_published: Boolean,
});

export interface Property extends mongoose.Document {
    _id?: string,
    user_id: string,
    name: string,
    address: string,
    type: string,
    description: string,
    image_url: string,
    total_rooms: string,
    occupancy_type: string,
    rent_amount: string,
    rent_frequency: string,
    is_published?: Boolean,
}

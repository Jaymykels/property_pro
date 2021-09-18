import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
});

export interface User extends mongoose.Document {
    _id?: string,
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
}

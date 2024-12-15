import mongoose from 'mongoose';

const registeredUserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    isSubscribed: { type: Boolean }, 
});

export default mongoose.model('RegisteredUser', registeredUserSchema);

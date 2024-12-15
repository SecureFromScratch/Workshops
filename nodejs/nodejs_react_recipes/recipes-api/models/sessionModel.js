import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    expiration: { type: Date, required: true },
    isSubscribed: { type: Boolean }, 
});

export default mongoose.model('Session', sessionSchema);

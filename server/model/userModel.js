import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    socketId: {
        type: String,
        required: true
    },
    status: {
        type: String
    },
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    groups: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'group'
        }
    ],
    accessToken: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});



userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


userSchema.method.generateToken = async (email) => {
    const token = jwt.sign(email, process.env.JWT_SCERET, { expiresIn: '2h' });
    return token;
};

const user = mongoose.model('user', userSchema);
export default user;

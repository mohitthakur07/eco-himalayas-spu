import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    qrCodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QRCode',
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['reward', 'redemption'],
    },
}, {
    timestamps: true,
});

export default mongoose.model('Transaction', transactionSchema);


import mongoose, { Schema, models } from "mongoose";

const orderSchema = new Schema(
    {
        status: {
            default: "waiting",
            type: String,
            required: true,
        },
        paymentId: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

const Order = models.Order || mongoose.model("Order", orderSchema);
export default Order;

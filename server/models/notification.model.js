import mongoose from "mongoose";
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bidId: {
      type: Schema.Types.ObjectId,
      ref: "Bid",
      required: true,
    },
    gigId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["bid_request"],
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema); 
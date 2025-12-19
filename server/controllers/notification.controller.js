import Notification from "../models/notification.model.js";
import Bid from "../models/bid.model.js";
import Gig from "../models/gig.model.js";

export const getAllNotifications = async (req, res, next) => {
  try {
    console.log("=== Getting All Notifications ===");
    console.log("User ID:", req.userId);
    
    if (!req.userId) {
      console.log("No user ID found in request");
      return res.status(401).json({ message: "User not authenticated" });
    }

    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate('bidId')
      .populate('gigId');
    
    console.log("Found notifications:", notifications);
    console.log("Number of notifications:", notifications.length);
    
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error in getAllNotifications:", err);
    next(err);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    console.log("Fetching unread notifications for user:", req.userId);
    if (!req.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const notifications = await Notification.find({ userId: req.userId, isRead: false })
      .sort({ createdAt: -1 })
      .populate('bidId')
      .populate('gigId');
    
    console.log("Found unread notifications:", notifications);
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error in getNotifications:", err);
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json("Notification marked as read");
  } catch (err) {
    next(err);
  }
};

export const createBidNotification = async (bidId, gigId) => {
  try {
    console.log("=== Creating Bid Notification ===");
    console.log("Bid ID:", bidId);
    console.log("Gig ID:", gigId);

    const bid = await Bid.findById(bidId);
    const gig = await Gig.findById(gigId);
    
    if (!bid || !gig) {
      console.error("Bid or Gig not found");
      throw new Error("Bid or Gig not found");
    }

    console.log("Found gig:", gig.title);
    console.log("Gig owner ID:", gig.userId);

    const notification = new Notification({
      userId: gig.userId,
      bidId: bid._id,
      gigId: gig._id,
      message: `New bid request for your gig: ${gig.title}`,
      type: "bid_request"
    });

    await notification.save();
    console.log("Notification created successfully:", notification);
  } catch (err) {
    console.error("Error creating notification:", err);
  }
}; 
import Bid from "../models/bid.model.js";
import Gig from "../models/gig.model.js";
import createError from "../utils/createError.js";
import { createBidNotification } from "./notification.controller.js";

export const createBid = async (req, res, next) => {
  if (req.isSeller)
    return next(createError(403, "Sellers can't create a bid!"));

  const newBid = new Bid({
    userId: req.userId,
    gigId: req.body.gigId,
    price: req.body.price,
    desc: req.body.desc,
  });

  try {
    const gig = await Gig.findById(req.body.gigId);
    if (!gig) return next(createError(404, "Gig not found!"));

    const savedBid = await newBid.save();
    console.log("Bid created successfully:", savedBid._id);
    
    // Create notification for the gig owner
    await createBidNotification(savedBid._id, req.body.gigId);
    console.log("Notification created for gig owner:", gig.userId);
    
    res.status(201).json(savedBid);
  } catch (err) {
    console.error("Error in createBid:", err);
    next(err);
  }
};

export const getBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ gigId: req.params.gigId }).populate({
      path: 'userId',
      select: '_id username img country'
    });
    res.status(200).send(bids);
  } catch (err) {
    next(err);
  }
};

export const updateBidStatus = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return next(createError(404, "Bid not found!"));

    const gig = await Gig.findById(bid.gigId);
    if (gig.userId !== req.userId)
      return next(createError(403, "You can only update bids for your gigs!"));

    bid.status = req.body.status;
    await bid.save();
    res.status(200).send(bid);
  } catch (err) {
    next(err);
  }
}; 
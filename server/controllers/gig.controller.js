import Gig from "../models/gig.model.js";
import createError from "../utils/createError.js";

export const createGig = async (req, res, next) => {
  console.log("Creating gig...", {
    userId: req.userId,
    isSeller: req.isSeller,
    body: req.body
  });

  if (!req.isSeller) {
    console.log("User is not a seller");
    return next(createError(403, "Only sellers can create a gig!"));
  }

  // Validate required fields
  if (!req.body.cover) {
    console.log("Missing cover image");
    return next(createError(400, "Cover image is required!"));
  }

  if (!req.body.title || !req.body.desc || !req.body.price) {
    console.log("Missing required fields", {
      title: req.body.title,
      desc: req.body.desc,
      price: req.body.price
    });
    return next(createError(400, "Title, description, and price are required!"));
  }

  const newGig = new Gig({
    userId: req.userId,
    ...req.body,
  });

  try {
    console.log("Saving gig...");
    const savedGig = await newGig.save();
    console.log("Gig saved successfully:", savedGig);
    res.status(201).json(savedGig);
  } catch (err) {
    console.error("Error saving gig:", err);
    next(err);
  }
};

export const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (gig.userId !== req.userId)
      return next(createError(403, "You can delete only your gig!"));

    await Gig.findByIdAndDelete(req.params.id);
    res.status(200).send("Gig has been deleted!");
  } catch (err) {
    next(err);
  }
};

export const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) next(createError(404, "Gig not found!"));
    res.status(200).send(gig);
  } catch (err) {
    next(err);
  }
};

export const getGigs = async (req, res, next) => {
  const q = req.query;
  console.log("Query parameters:", q);
  
  try {
    const filters = {};

    // Handle search query
    if (q.search) {
      filters.$or = [
        { title: { $regex: q.search, $options: "i" } },
        { desc: { $regex: q.search, $options: "i" } },
        { shortTitle: { $regex: q.search, $options: "i" } },
        { shortDesc: { $regex: q.search, $options: "i" } }
      ];
    }

    // Handle category filter
    if (q.cat) {
      filters.cat = q.cat;
    }

    // Handle user filter
    if (q.userId) {
      filters.userId = q.userId;
    }

    // Handle price range
    if (q.min || q.max) {
      filters.price = {};
      if (q.min) filters.price.$gte = parseInt(q.min) || 0;
      if (q.max) filters.price.$lte = parseInt(q.max) || Number.MAX_SAFE_INTEGER;
    }

    console.log("Applied filters:", JSON.stringify(filters, null, 2));

    // Get all gigs with filters and sort
    const gigs = await Gig.find(filters)
      .sort(q.sort ? { [q.sort]: -1 } : { createdAt: -1 });

    console.log(`Found ${gigs.length} gigs`);
    res.status(200).send(gigs);
  } catch (err) {
    console.error("Error fetching gigs:", err);
    next(err);
  }
};

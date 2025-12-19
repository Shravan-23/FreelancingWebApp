import mongoose from "mongoose";
import Gig from "../models/gig.model.js";
import dotenv from "dotenv";

dotenv.config();

const categoryMapping = {
  "design": "design",
  "web": "web_development",
  "animation": "animation",
  "music": "music",
  "Design": "design",
  "Web Development": "web_development",
  "Animation": "animation",
  "Music": "music"
};

async function migrateCategoriesInGigs() {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB!");

    const gigs = await Gig.find({});
    console.log(`Found ${gigs.length} gigs to update`);

    for (const gig of gigs) {
      const oldCategory = gig.cat;
      const newCategory = categoryMapping[oldCategory];

      if (newCategory && oldCategory !== newCategory) {
        gig.cat = newCategory;
        await gig.save();
        console.log(`Updated gig ${gig._id} category from "${oldCategory}" to "${newCategory}"`);
      }
    }

    console.log("Category migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

migrateCategoriesInGigs(); 
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { required } = require("joi");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  image: {
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    },
    filename: {
      type: String,
      default: "listingimage",
    },
  },

  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",

    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref:"User",

  },

  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required:true
    }
  }


});


listingSchema.post("findOneAndDelete", async (listing) => {
  if(listing) {
      await Review.deleteMany({_id: {$in: listing.reviews}});

  }

});

module.exports = mongoose.model("Listing", listingSchema);

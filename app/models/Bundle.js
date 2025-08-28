import mongoose from "mongoose";

const bundleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot be more than 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    templateIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Template",
        required: true,
      },
    ],
    bundlePrice: {
      type: Number,
      required: [true, "Bundle price is required"],
      min: [0, "Price cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    originalTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

bundleSchema.virtual("savingsAmount").get(function () {
  return Math.max(0, (this.originalTotal || 0) - (this.bundlePrice || 0));
});

bundleSchema.virtual("savingsPercent").get(function () {
  const original = this.originalTotal || 0;
  if (!original) return 0;
  const saved = Math.max(0, original - (this.bundlePrice || 0));
  return Math.round((saved / original) * 100);
});

bundleSchema.statics.getActiveBundles = function () {
  return this.find({ isActive: true })
    .sort({ createdAt: -1 })
    .populate("templateIds");
};

const Bundle = mongoose.models.Bundle || mongoose.model("Bundle", bundleSchema);

export default Bundle;

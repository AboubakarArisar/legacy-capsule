import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      // no longer required to allow bundle orders
    },
    bundleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bundle",
    },
    templateIdsPurchased: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Template",
      },
    ],
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "usd",
      enum: ["usd", "eur", "gbp", "cad"],
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled", "failed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    downloadUrl: {
      type: String,
    },
    downloadExpiresAt: {
      type: Date,
    },
    customerEmail: {
      type: String,
    },
    customerName: {
      type: String,
    },
    notes: {
      type: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for common queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order total
orderSchema.virtual("total").get(function () {
  return this.amount;
});

// Virtual for formatted amount
orderSchema.virtual("formattedAmount").get(function () {
  return `$${this.amount.toFixed(2)}`;
});

// Method to mark as paid
orderSchema.methods.markAsPaid = function (paymentIntentId) {
  this.status = "completed";
  this.paymentStatus = "paid";
  this.stripePaymentIntentId = paymentIntentId;
  return this.save();
};

// Method to mark as failed
orderSchema.methods.markAsFailed = function () {
  this.status = "failed";
  this.paymentStatus = "failed";
  return this.save();
};

// Method to generate download URL
orderSchema.methods.generateDownloadUrl = function () {
  // Set download URL and expiration (24 hours from now)
  this.downloadUrl = `/api/downloads/${this._id}`;
  this.downloadExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return this.save();
};

// Static method to get orders by user
orderSchema.statics.findByUserId = function (userId) {
  return this.find({ userId }).populate("templateId").sort({ createdAt: -1 });
};

// Static method to get orders by Stripe session ID
orderSchema.statics.findByStripeSessionId = function (sessionId) {
  return this.findOne({ stripeSessionId: sessionId });
};

// Static method to get revenue statistics
orderSchema.statics.getRevenueStats = function (startDate, endDate) {
  const matchStage = {
    status: "completed",
    paymentStatus: "paid",
  };

  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: "$amount" },
      },
    },
  ]);
};

// Static method to get top selling templates
orderSchema.statics.getTopSellingTemplates = function (limit = 10) {
  return this.aggregate([
    { $match: { status: "completed", paymentStatus: "paid" } },
    {
      $group: {
        _id: "$templateId",
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$amount" },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "templates",
        localField: "_id",
        foreignField: "_id",
        as: "template",
      },
    },
    { $unwind: "$template" },
  ]);
};

// Prevent duplicate model compilation
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;

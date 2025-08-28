import mongoose from "mongoose";

const customRequestSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
    },
    TemplateDescription: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const CustomRequest =
  mongoose.models.CustomRequest ||
  mongoose.model("CustomRequest", customRequestSchema);

export default CustomRequest;

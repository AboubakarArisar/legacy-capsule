import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'leaving-a-memory',
      'birthday-gift',
      'wedding-memories',
      'family-memory-book',
      'family-recipe-collection',
      'life-story-journal',
      'baby-first-year',
      'memorial-tribute',
      'school-year-memory'
    ]
  },
  features: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  // Simple URL fields
  pdfUrl: {
    type: String,
    required: [true, 'PDF URL is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  // Download tracking
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Static method to get active templates
templateSchema.statics.getActiveTemplates = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to get templates by category
templateSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};

// Static method to search templates
templateSchema.statics.search = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).sort({ createdAt: -1 });
};

// Method to increment download count
templateSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  return this.save();
};

// Prevent duplicate model compilation
const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);

export default Template;
 
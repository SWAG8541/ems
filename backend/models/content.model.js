const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  contentType: { type: String, required: true }, // e.g., 'page', 'post', 'product'
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  featuredImage: { type: String },
  tags: [{ type: String }],
  metadata: {
    description: { type: String },
    keywords: [{ type: String }]
  }
}, { timestamps: true });

// Create index for faster searches
ContentSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Content', ContentSchema);

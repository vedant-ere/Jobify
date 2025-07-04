import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      remote: { type: Boolean, default: false },
    },
    description: {
      type: String,
      required: true,
    },
    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: "INR" },
    },
    source: {
      name: { type: String, required: true }, // "Indeed", "LinkedIn"
      url: { type: String, required: true }, // Original job URL
      scrapedAt: { type: Date, default: Date.now },
    },
    isActive: { type: Boolean, default: true },
    postedDate: Date,
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

// INDEXING STRATEGY
// 1. Text search index (most important for job matching)
jobSchema.index({ 
    title: 'text', 
    description: 'text', 
    skills: 'text' 
});

// 2. Compound index for location-based filtering
jobSchema.index({ 
    'location.city': 1, 
    'location.state': 1, 
    'location.remote': 1 
});

// 3. Skills array index for skill-based matching
jobSchema.index({ skills: 1 });

// 4. Active jobs with recent posts (for homepage display)
jobSchema.index({ 
    isActive: 1, 
    postedDate: -1 
});

// 5. TTL index for automatic cleanup
jobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 6. Prevent duplicate jobs from same source
jobSchema.index({ 
    'source.url': 1 
}, { unique: true });

export default mongoose.model('Job', jobSchema);
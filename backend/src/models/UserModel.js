import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const skillSchema = new mongoose.Schema({
    skillName : {
        type : String,
        required : true,
        trim : true,
        lowercase : true,
    },
    proficiency : {
        type: Number,
        min : 1,
        max : 5,
        required : true
    },
    category : {
        type : String,
        enum : ['technical', 'non-technical' , 'tool', 'industry', 'cloud'],
        default : "technical"
    },
    verified : {
        type : Boolean,
        default : false
    }
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profile: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      title: { type: String, trim: true },
      experience: { type: Number, min: 0 },
      location: {
        city: String,
        state: String,
        country: String,
        remote: { type: Boolean, default: false },
      },
    },
    skills: [skillSchema],
    preferences: {
      jobTypes: {
        type: [String],
        enum: ["full-time", "part-time", "contract", "internship", "remote"],
        default: ["full-time"],
      },
      salaryRange: {
        min: { type: Number },
        max: { type: Number },
      },
      industries: [String],
      companySize: {
        type: [String],
        enum: ["startup", "small", "medium", "large", "enterprise"],
      },
    },
    jobHistory: [
      {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
        action: {
          type: String,
          enum: ["viewed", "saved", "applied", "rejected", "hidden"],
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    try{
        const salt = await bcrypt.genSalt(10);
        this.password =  await bcrypt.hash(this.password, salt);
        next();
    }
    catch(error){
        next(error)
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

const User =  mongoose.model("User", userSchema);
export default User;

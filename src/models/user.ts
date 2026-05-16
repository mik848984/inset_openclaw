import mongoose, { Schema, models } from 'mongoose';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    modelsBalance: {
      type: Number,
      default: 10_000,
      required: true,
      set: function (value: number) {
        return value < 0 ? 0 : value;
      },
    },
    simpleModelsBalance: {
      type: Number,
      default: 10_000,
      required: true,
      set: function (value: number) {
        return value < 0 ? 0 : value;
      },
    },
    premiumModelsBalance: {
      type: Number,
      default: 0,
      required: true,
      set: function (value: number) {
        return value < 0 ? 0 : value;
      },
    },
    imageGenerationBalance: {
      type: Number,
      default: 20,
      required: true,
      set: function (value: number) {
        return value < 0 ? 0 : value;
      },
    },
    webSearchBalance: {
      type: Number,
      default: 3,
      required: true,
      set: function (value: number) {
        return value < 0 ? 0 : value;
      },
    },
  },
  { timestamps: true },
);

const User = models.User || mongoose.model('User', userSchema);
export default User;

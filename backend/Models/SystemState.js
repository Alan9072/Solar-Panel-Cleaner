import mongoose from 'mongoose';

const SystemStateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'system',
    },
    state: {
      type: String,
      enum: ['ON', 'OFF'],
      required: true,
      default: 'OFF',
    },
  },
  { timestamps: true }
);

const SystemState = mongoose.model('SystemState', SystemStateSchema);

export default SystemState;

import { Schema, models, model, Document, Model } from 'mongoose';

interface IRpgSchema extends Document, Rpg {}

const rpgSchema = new Schema({
  serverId: {
    type: String,
    required: true
  },
  categoryId: {
    type: String,
    required: true
  },
  masterId: {
    type: String,
    required: true
  },
  replyId: {
    type: String,
    required: true
  },
  type: {
    type: Number,
    required: true
  },
  full: {
    type: Boolean,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  system: {
    type: String,
    required: true
  },
  style: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  slots: {
    type: String,
    required: true
  },
  briefing: {
    type: String,
    required: true
  },
  rules: {
    type: String,
    required: true
  },
  imageLink: {
    type: String,
    required: true
  }
});
const RpgSchema: Model<IRpgSchema> =
  models.rpg || model<IRpgSchema>('Rpgs', rpgSchema);

export { IRpgSchema, RpgSchema };

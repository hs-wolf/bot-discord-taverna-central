import { Schema, models, model, Document, Model } from 'mongoose';

interface ITableSchema extends Document, Table {}

const tableSchema = new Schema({
  serverId: {
    type: String,
    required: true
  },
  masterId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    required: true
  },
  imageLink: {
    type: String,
    required: true
  },
  roleId: {
    type: String,
    required: true
  },
  spectatorRoleId: {
    type: String,
    required: true
  },
  categoryChannelId: {
    type: String,
    required: true
  },
  shieldChannelId: {
    type: String,
    required: true
  },
  shieldMessageId: {
    type: String,
    required: true
  },
  spectatorAllowed: {
    type: Boolean,
    required: true
  },
  activityScore: {
    type: Number,
    required: true
  },
  lastRpgDate: {
    type: Date,
    required: true
  }
});
const TableSchema: Model<ITableSchema> =
  models.campaign || model<ITableSchema>('Tables', tableSchema);

export { ITableSchema, TableSchema };

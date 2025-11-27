import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EventStatus } from '../../common/enums/event-status.enum';

export class Reply {
  @Prop({ type: Types.ObjectId, ref: 'Ngo', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ type: [Reply], default: [] })
  replies: Reply[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop()
  image?: string;

  @Prop({ default: EventStatus.PENDING, enum: EventStatus })
  status: EventStatus;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likedBy: Types.ObjectId[];

  @Prop({ type: [Comment], default: [] })
  comments: Comment[];

  @Prop({ type: Types.ObjectId, ref: 'Ngo', required: true })
  createdBy: Types.ObjectId;

  @Prop({ required: true })
  creatorEmail: string;

  @Prop({ required: true })
  creatorName: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  followers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  participants: Types.ObjectId[];
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Indexes for performance
EventSchema.index({ status: 1 });
EventSchema.index({ date: 1 });
EventSchema.index({ location: 1 });
EventSchema.index({ createdBy: 1 });
EventSchema.index({ likes: -1 });
EventSchema.index({ status: 1, date: 1 });

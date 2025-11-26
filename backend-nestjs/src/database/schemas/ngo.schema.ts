import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';
import { NgoStatus } from '../../common/enums/ngo-status.enum';

@Schema({ timestamps: true })
export class Ngo extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, trim: true })
  organization: string;

  @Prop({ default: UserRole.NGO, enum: UserRole })
  role: UserRole;

  @Prop({ default: NgoStatus.ACTIVE, enum: NgoStatus })
  status: NgoStatus;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  website?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ select: false })
  emailVerificationToken?: string;

  @Prop({ select: false })
  passwordResetToken?: string;

  @Prop({ select: false })
  passwordResetExpires?: Date;
}

export const NgoSchema = SchemaFactory.createForClass(Ngo);

// Indexes
NgoSchema.index({ email: 1 });
NgoSchema.index({ status: 1 });
NgoSchema.index({ organization: 1 });
NgoSchema.index({ createdAt: -1 });

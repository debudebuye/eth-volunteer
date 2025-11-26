import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event } from '../database/schemas/event.schema';
import { EventStatus } from '../common/enums/event-status.enum';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    ngoId: string,
    imagePath?: string,
  ): Promise<Event> {
    // Validate date is in future
    const eventDate = new Date(createEventDto.date);
    if (eventDate < new Date()) {
      throw new BadRequestException('Event date must be in the future');
    }

    const event = new this.eventModel({
      ...createEventDto,
      image: imagePath,
      status: EventStatus.PENDING,
      createdBy: ngoId,
    });

    return event.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().populate('createdBy', 'name organization').exec();
  }

  async findApproved(): Promise<Event[]> {
    return this.eventModel
      .find({ status: EventStatus.APPROVED })
      .populate('createdBy', 'name organization')
      .sort({ date: 1 })
      .exec();
  }

  async findPending(): Promise<Event[]> {
    return this.eventModel
      .find({ status: EventStatus.PENDING })
      .populate('createdBy', 'name organization')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findRejected(): Promise<Event[]> {
    return this.eventModel
      .find({ status: EventStatus.REJECTED })
      .populate('createdBy', 'name organization')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Event> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid event ID');
    }

    const event = await this.eventModel
      .findById(id)
      .populate('createdBy', 'name organization email')
      .exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findByNgo(ngoId: string): Promise<Event[]> {
    return this.eventModel
      .find({ createdBy: ngoId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByNgoWithDetails(ngoId: string): Promise<Event[]> {
    return this.eventModel
      .find({ createdBy: ngoId })
      .populate('participants', 'name email')
      .populate('followers', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByLocation(location: string): Promise<Event[]> {
    if (!location) {
      throw new BadRequestException('Location parameter is required');
    }

    return this.eventModel
      .find({
        location: { $regex: location, $options: 'i' },
        status: EventStatus.APPROVED,
      })
      .populate('createdBy', 'name organization')
      .sort({ date: 1 })
      .exec();
  }

  async findFollowedByUser(userId: string): Promise<Event[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.eventModel
      .find({ followers: userId, status: EventStatus.APPROVED })
      .populate('createdBy', 'name organization')
      .sort({ date: 1 })
      .exec();
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    ngoId: string,
  ): Promise<Event> {
    const event = await this.findOne(id);

    // Check ownership
    if (event.createdBy._id.toString() !== ngoId) {
      throw new ForbiddenException('You are not authorized to update this event');
    }

    // Validate date if provided
    if (updateEventDto.date) {
      const eventDate = new Date(updateEventDto.date);
      if (eventDate < new Date()) {
        throw new BadRequestException('Event date must be in the future');
      }
    }

    Object.assign(event, updateEventDto);
    return event.save();
  }

  async remove(id: string, ngoId: string): Promise<void> {
    const event = await this.findOne(id);

    // Check ownership
    if (event.createdBy._id.toString() !== ngoId) {
      throw new ForbiddenException('You are not authorized to delete this event');
    }

    await this.eventModel.findByIdAndDelete(id).exec();
  }

  async approve(id: string): Promise<Event> {
    const event = await this.findOne(id);
    event.status = EventStatus.APPROVED;
    return event.save();
  }

  async reject(id: string): Promise<Event> {
    const event = await this.findOne(id);
    event.status = EventStatus.REJECTED;
    return event.save();
  }

  async moveToPending(id: string): Promise<Event> {
    const event = await this.findOne(id);
    event.status = EventStatus.PENDING;
    return event.save();
  }

  async like(eventId: string, userId: string): Promise<Event> {
    const event = await this.findOne(eventId);

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const userObjectId = new Types.ObjectId(userId);

    // Check if already liked
    if (event.likedBy.some((id) => id.toString() === userId)) {
      throw new BadRequestException('User has already liked this event');
    }

    event.likedBy.push(userObjectId);
    event.likes = event.likedBy.length;
    return event.save();
  }

  async unlike(eventId: string, userId: string): Promise<Event> {
    const event = await this.findOne(eventId);

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Check if not liked
    if (!event.likedBy.some((id) => id.toString() === userId)) {
      throw new BadRequestException('User has not liked this event');
    }

    event.likedBy = event.likedBy.filter((id) => id.toString() !== userId);
    event.likes = event.likedBy.length;
    return event.save();
  }

  async follow(eventId: string, userId: string): Promise<Event> {
    const event = await this.findOne(eventId);

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const userObjectId = new Types.ObjectId(userId);

    // Check if already following
    if (!event.followers.some((id) => id.toString() === userId)) {
      event.followers.push(userObjectId);
      await event.save();
    }

    return event;
  }

  async addComment(
    eventId: string,
    userId: string,
    text: string,
  ): Promise<Event> {
    const event = await this.findOne(eventId);

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    event.comments.push({
      userId: new Types.ObjectId(userId),
      text,
      replies: [],
      createdAt: new Date(),
    } as any);

    return event.save();
  }

  async getComments(eventId: string) {
    const event = await this.eventModel
      .findById(eventId)
      .populate('comments.userId', 'name email')
      .populate('comments.replies.userId', 'name organization')
      .exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event.comments;
  }

  async addReply(
    eventId: string,
    commentId: string,
    ngoId: string,
    text: string,
  ): Promise<Event> {
    const event = await this.findOne(eventId);

    const comment = event.comments.find(
      (c: any) => c._id.toString() === commentId,
    );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    (comment as any).replies.push({
      userId: new Types.ObjectId(ngoId),
      text,
      createdAt: new Date(),
    });

    return event.save();
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { LikeEventDto } from './dto/like-event.dto';
import { AddCommentDto, AddReplyDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Events')
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('create')
  @Roles(UserRole.NGO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create event (NGO only)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `event-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imagePath = file ? `/uploads/${file.filename}` : undefined;
    const event = await this.eventsService.create(
      createEventDto,
      user.userId,
      imagePath,
    );
    return {
      message: 'Event created successfully! Pending admin approval.',
      event,
    };
  }

  @Get('approved')
  @Public()
  @ApiOperation({ summary: 'Get all approved events (public)' })
  async findApproved() {
    const events = await this.eventsService.findApproved();
    return { events };
  }

  @Get('pending')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending events (Admin only)' })
  async findPending() {
    const events = await this.eventsService.findPending();
    return { events };
  }

  @Get('rejected')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get rejected events (Admin only)' })
  async findRejected() {
    const events = await this.eventsService.findRejected();
    return { events };
  }

  @Get('events')
  @Roles(UserRole.NGO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get NGO events (NGO only)' })
  async findByNgo(@CurrentUser() user: any) {
    const events = await this.eventsService.findByNgo(user.userId);
    return { events };
  }

  @Get('track')
  @Roles(UserRole.NGO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get NGO events with details (NGO only)' })
  async findByNgoWithDetails(@CurrentUser() user: any) {
    const events = await this.eventsService.findByNgoWithDetails(user.userId);
    return { events };
  }

  @Get('by-location')
  @Public()
  @ApiOperation({ summary: 'Get events by location (public)' })
  async findByLocation(@Query('location') location: string) {
    const events = await this.eventsService.findByLocation(location);
    return { events };
  }

  @Get('following')
  @Public()
  @ApiOperation({ summary: 'Get followed events by user' })
  async findFollowed(@Query('userId') userId: string) {
    const events = await this.eventsService.findFollowedByUser(userId);
    return { events };
  }

  @Get(':eventId/comments')
  @Public()
  @ApiOperation({ summary: 'Get event comments' })
  async getComments(@Param('eventId') eventId: string) {
    const comments = await this.eventsService.getComments(eventId);
    return { comments };
  }

  @Get(':eventId')
  @Public()
  @ApiOperation({ summary: 'Get event by ID (public)' })
  async findOne(@Param('eventId') id: string) {
    const event = await this.eventsService.findOne(id);
    return { event };
  }

  @Put('update/:eventId')
  @Roles(UserRole.NGO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event (NGO only)' })
  async update(
    @Param('eventId') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: any,
  ) {
    const event = await this.eventsService.update(id, updateEventDto, user.userId);
    return { message: 'Event updated successfully', event };
  }

  @Delete('delete/:eventId')
  @Roles(UserRole.NGO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete event (NGO only)' })
  async remove(@Param('eventId') id: string, @CurrentUser() user: any) {
    await this.eventsService.remove(id, user.userId);
    return { message: 'Event deleted successfully' };
  }

  @Put('approve/:id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve event (Admin only)' })
  async approve(@Param('id') id: string) {
    const event = await this.eventsService.approve(id);
    return { message: 'Event approved successfully', event };
  }

  @Put('reject/:id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject event (Admin only)' })
  async reject(@Param('id') id: string) {
    const event = await this.eventsService.reject(id);
    return { message: 'Event rejected successfully', event };
  }

  @Put('disapprove/:id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Move approved event back to pending (Admin only)' })
  async disapprove(@Param('id') id: string) {
    const event = await this.eventsService.moveToPending(id);
    return { message: 'Event moved to pending successfully', event };
  }

  @Put('unreject/:id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Move rejected event back to pending (Admin only)' })
  async unreject(@Param('id') id: string) {
    const event = await this.eventsService.moveToPending(id);
    return { message: 'Event moved to pending successfully', event };
  }

  @Post('likes')
  @Public()
  @ApiOperation({ summary: 'Like event' })
  async like(@Body() likeEventDto: LikeEventDto) {
    const event = await this.eventsService.like(
      likeEventDto.eventId,
      likeEventDto.userId,
    );
    return { message: 'Event liked successfully', event };
  }

  @Post('unlike')
  @Public()
  @ApiOperation({ summary: 'Unlike event' })
  async unlike(@Body() likeEventDto: LikeEventDto) {
    const event = await this.eventsService.unlike(
      likeEventDto.eventId,
      likeEventDto.userId,
    );
    return { message: 'Event unliked successfully', event };
  }

  @Post('follow')
  @Public()
  @ApiOperation({ summary: 'Follow event' })
  async follow(@Body() likeEventDto: LikeEventDto) {
    const event = await this.eventsService.follow(
      likeEventDto.eventId,
      likeEventDto.userId,
    );
    return { message: 'Followed successfully', event };
  }

  @Post('comment')
  @Public()
  @ApiOperation({ summary: 'Add comment to event' })
  async addComment(@Body() addCommentDto: AddCommentDto) {
    const event = await this.eventsService.addComment(
      addCommentDto.eventId,
      addCommentDto.userId,
      addCommentDto.text,
    );
    return { message: 'Comment added successfully', event };
  }

  @Post(':eventId/comments/:commentId/reply')
  @Roles(UserRole.NGO)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reply to comment (NGO only)' })
  async addReply(
    @Param('eventId') eventId: string,
    @Param('commentId') commentId: string,
    @Body() addReplyDto: AddReplyDto,
    @CurrentUser() user: any,
  ) {
    const event = await this.eventsService.addReply(
      eventId,
      commentId,
      user.userId,
      addReplyDto.text,
    );
    return { message: 'Reply added successfully', event };
  }
}

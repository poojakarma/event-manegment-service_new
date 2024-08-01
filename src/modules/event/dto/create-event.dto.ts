import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
  Min,
  IsLatitude,
  IsLongitude,
  IsDateString,
  IsObject,
  ValidateIf,
  ValidateNested,
  IsArray,
  IsDefined,
  ArrayMinSize,
  ArrayMaxSize,
  Validate,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  EventTypes,
  Frequency,
  MeetingDetails,
  RecurrencePattern,
} from 'src/common/utils/types';
import { ERROR_MESSAGES } from 'src/common/utils/constants.util';
import { EndsWithZConstraint } from 'src/common/pipes/event-validation.pipe';

export class MeetingDetailsDto {
  @ApiProperty({ description: 'Meeting ID', example: 94292617 })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Meeting url',
    example: 'https://example.com/meeting',
  })
  @IsString()
  @IsNotEmpty()
  // @Validate(UrlValidator)
  url: string;

  @ApiProperty({ description: 'Meeting password', example: 'xxxxxx' })
  @IsString()
  password: string;

  @ApiProperty({
    type: String,
    description: 'providerGenerated',
    default: false,
  })
  providerGenerated: boolean;
}

export class EndCondition {
  @ApiProperty({
    type: String,
    description: 'Type of end condition',
    example: 'endDate',
  })
  @IsString()
  @IsNotEmpty()
  type: 'endDate' | 'occurrences';

  @ApiProperty({
    type: String,
    description: 'Value of end condition',
    example: '2024-03-18T10:00:00Z | 5',
  })
  @ValidateIf((o) => o.type === 'endDate')
  @Validate(EndsWithZConstraint)
  @IsDateString({ strict: true, strictSeparator: true })
  @IsNotEmpty()
  value: string;
}

export class RecurrencePatternDto {
  @ApiProperty({
    enum: Frequency,
    description: 'Frequency',
    example: 'daily',
  })
  @IsEnum(Frequency, {
    message: 'Frequency must be one of: daily, weekly',
  })
  @IsNotEmpty()
  frequency: string;

  @ApiProperty({
    type: Number,
    description: 'Interval',
    example: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  interval: number;

  @ApiProperty({
    type: [String],
    description: 'Days of Week',
    example: [1, 3, 5],
  })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  daysOfWeek: number[];

  // @ApiProperty({
  //   type: Number,
  //   description: 'Day of Month',
  //   example: 1,
  // })
  // @IsInt()
  // @IsOptional()
  // dayOfMonth: number;

  @ApiProperty({
    type: EndCondition,
    description: 'End Condition',
    example: {
      type: 'endDate',
      value: '2024-03-18T10:00:00Z',
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => EndCondition)
  endCondition: EndCondition;
}

/**
 * All Datetime properties
 * should be in ISO 8601 format (e.g., '2024-03-18T10:00:00Z').
 */

export class CreateEventDto {
  // @IsUUID()
  // eventID: string;

  @ApiProperty({
    type: String,
    description: 'title',
    example: 'Sample Event',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    type: String,
    description: 'Short Description',
    example: 'This is a sample event',
  })
  @IsString()
  shortDescription: string;

  @ApiProperty({
    type: String,
    description: 'Description',
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    enum: EventTypes,
    description: 'Event Type',
    example: 'online',
  })
  @IsEnum(EventTypes, {
    message: 'Event Type must be one of: online, offline',
  })
  @IsString()
  @IsNotEmpty()
  eventType: string; // offline

  @ApiProperty({
    type: String,
    description: 'isRestricted', // true for private, false for public
    example: true,
  })
  @IsBoolean()
  isRestricted: boolean;

  @ApiProperty({
    type: String,
    description: 'autoEnroll',
    example: true,
  })
  autoEnroll: boolean;

  @ApiProperty({
    type: String,
    description: 'Start Datetime',
    example: '2024-03-18T10:00:00',
  })
  @Validate(EndsWithZConstraint)
  @IsDateString({ strict: true, strictSeparator: true })
  startDatetime: string;

  @ApiProperty({
    type: String,
    description: 'End Datetime',
    example: '2024-03-18T10:00:00',
  })
  @Validate(EndsWithZConstraint)
  @IsDateString({ strict: true, strictSeparator: true })
  endDatetime: string;

  @ApiProperty({
    type: String,
    description: 'Location',
    example: 'Event Location',
  })
  @ValidateIf((o) => o.eventType === EventTypes.offline)
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    type: Number,
    description: 'Latitude',
    example: 18.508345134886994,
  })
  @ValidateIf((o) => o.eventType === EventTypes.offline)
  @IsLongitude()
  @IsOptional()
  longitude: number;

  @ApiProperty({
    type: Number,
    description: 'Latitude',
    example: 18.508345134886994,
  })
  @ValidateIf((o) => o.eventType === EventTypes.offline)
  @IsLatitude()
  @IsOptional()
  latitude: number;

  @ApiProperty({
    type: String,
    description: 'Online Provider',
    example: 'Zoom',
  })
  @ValidateIf((o) => o.eventType === EventTypes.online)
  @IsString()
  @IsNotEmpty()
  @IsIn(['Zoom', 'GoogleMeet', 'MicrosoftTeams']) // Supported providers
  onlineProvider: string;

  @ApiProperty({
    type: Boolean,
    description: 'isMeetingNew',
    example: false,
  })
  @ValidateIf((o) => o.eventType === EventTypes.online)
  @IsNotEmpty()
  isMeetingNew: boolean;

  @ApiProperty({
    type: MeetingDetailsDto,
    description: 'Online Meeting Details',
    example: {
      url: 'https://example.com/meeting',
      id: '123-456-789',
      password: 'xxxxxxx',
    },
  })
  @IsObject()
  @ValidateIf((o) => o.isMeetingNew === false)
  @ValidateIf((o) => o.eventType === 'online')
  @ValidateNested({ each: true })
  @Type(() => MeetingDetailsDto)
  meetingDetails: MeetingDetails;
  // TODO: meet url validation

  @ApiProperty({
    type: Number,
    description: 'Max Attendees',
    example: 100,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  maxAttendees: number;

  @ApiProperty({
    type: Object,
    description: 'Attendees',
    example: {
      attendees: [
        'eff008a8-2573-466d-b877-fddf6a4fc13e',
        'e9fec05a-d6ab-44be-bfa4-eaeef2ef8fe9',
      ],
    },
  })
  @ValidateIf((o) => o.isRestricted === true && o.autoEnroll)
  @IsDefined({ message: ERROR_MESSAGES.ATTENDEES_REQUIRED })
  @IsArray()
  @Type(() => String)
  @ArrayMaxSize(200)
  @IsUUID('4', { each: true })
  @IsOptional()
  attendees: string[];

  @ApiProperty({
    type: Object,
    description: 'Recordings',
    example: { url: 'https://example.com/recording' },
  })
  @IsObject()
  @IsOptional()
  recordings: any;

  @ApiProperty({
    type: String,
    description: 'Status',
    example: 'live',
  })
  @IsEnum(['live'], {
    //, 'draft', 'archived'], {
    // TODO: message: 'Status must be one of: live, draft, archived',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    type: String,
    description: 'createdBy',
    example: 'eff008a8-2573-466d-b877-fddf6a4fc13e',
  })
  createdBy: string;

  @ApiProperty({
    type: String,
    description: 'updatedBy',
    example: 'eff008a8-2573-466d-b877-fddf6a4fc13e',
  })
  updatedBy: string;

  @ApiProperty({
    type: String,
    description: 'idealTime',
    example: 120,
  })
  @IsOptional()
  idealTime: number;

  @ApiProperty({
    type: String,
    description: 'registrationStartDate',
    example: '2024-03-18T10:00:00',
  })
  @ValidateIf((o) => o.isRestricted === false)
  @Validate(EndsWithZConstraint)
  @IsDateString({ strict: true, strictSeparator: true })
  @IsOptional()
  registrationStartDate: string;

  @ApiProperty({
    type: String,
    description: 'registrationEndDate',
    example: '2024-03-18T10:00:00',
  })
  @ValidateIf((o) => o.isRestricted === false)
  @Validate(EndsWithZConstraint)
  @IsDateString({ strict: true, strictSeparator: true })
  @IsOptional()
  registrationEndDate: string;

  @ApiProperty({
    type: String,
    description: 'isRecurring',
    example: true,
  })
  @IsBoolean()
  isRecurring: boolean;

  @ApiProperty({
    type: RecurrencePatternDto,
    description: 'recurrencePattern',
    example: { frequency: 'daily', interval: 1 },
  })
  @IsObject()
  @ValidateIf((o) => o.isRecurring === true)
  @ValidateNested({ each: true })
  @Type(() => RecurrencePatternDto)
  recurrencePattern: RecurrencePatternDto;

  @ApiProperty({
    type: Object,
    description: 'Event meta data',
    example: '',
  })
  @IsObject()
  @IsOptional()
  metaData: any;
}

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../database/schemas/user.schema';
import { Ngo } from '../database/schemas/ngo.schema';
import { Admin } from '../database/schemas/admin.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterNgoDto } from './dto/register-ngo.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Ngo.name) private ngoModel: Model<Ngo>,
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, password, ...rest } = registerUserDto;

    // Check if user exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      ...rest,
    });

    // Generate token
    const token = this.generateToken(user._id.toString(), email, UserRole.USER);

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
        },
        token,
      },
    };
  }

  async registerNgo(registerNgoDto: RegisterNgoDto) {
    const { email, password, ...rest } = registerNgoDto;

    // Check if NGO exists
    const existingNgo = await this.ngoModel.findOne({ email });
    if (existingNgo) {
      throw new ConflictException('NGO with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create NGO
    const ngo = await this.ngoModel.create({
      email,
      password: hashedPassword,
      role: UserRole.NGO,
      ...rest,
    });

    // Generate token
    const token = this.generateToken(ngo._id.toString(), email, UserRole.NGO);

    return {
      success: true,
      message: 'NGO registered successfully',
      data: {
        ngo: {
          id: ngo._id,
          name: ngo.name,
          email: ngo.email,
          organization: ngo.organization,
          role: ngo.role,
          status: ngo.status,
        },
        token,
      },
    };
  }

  async loginUser(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with password
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if blocked
    if (user.isBlocked) {
      throw new UnauthorizedException('Your account has been blocked');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user._id.toString(), email, UserRole.USER);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
        },
        token,
      },
    };
  }

  async loginNgo(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find NGO with password
    const ngo = await this.ngoModel.findOne({ email }).select('+password');
    if (!ngo) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if blocked
    if (ngo.status === 'blocked') {
      throw new UnauthorizedException('Your account has been blocked');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, ngo.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(ngo._id.toString(), email, UserRole.NGO);

    return {
      success: true,
      message: 'Login successful',
      data: {
        ngo: {
          id: ngo._id,
          name: ngo.name,
          email: ngo.email,
          organization: ngo.organization,
          role: ngo.role,
          status: ngo.status,
        },
        token,
      },
    };
  }

  async loginAdmin(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find admin with password
    const admin = await this.adminModel.findOne({ email }).select('+password');
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if active
    if (!admin.isActive) {
      throw new UnauthorizedException('Your account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(
      admin._id.toString(),
      email,
      UserRole.ADMIN,
    );

    return {
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        token,
      },
    };
  }

  private generateToken(userId: string, email: string, role: UserRole): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}

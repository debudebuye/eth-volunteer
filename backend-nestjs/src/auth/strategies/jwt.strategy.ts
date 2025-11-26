import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../database/schemas/user.schema';
import { Ngo } from '../../database/schemas/ngo.schema';
import { Admin } from '../../database/schemas/admin.schema';
import { UserRole } from '../../common/enums/user-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Ngo.name) private ngoModel: Model<Ngo>,
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'default-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const { sub, role } = payload;

    let user;

    switch (role) {
      case UserRole.USER:
        user = await this.userModel.findById(sub);
        if (user?.isBlocked) {
          throw new UnauthorizedException('Your account has been blocked');
        }
        break;
      case UserRole.NGO:
        user = await this.ngoModel.findById(sub);
        if (user?.status === 'blocked') {
          throw new UnauthorizedException('Your account has been blocked');
        }
        break;
      case UserRole.ADMIN:
        user = await this.adminModel.findById(sub);
        if (!user?.isActive) {
          throw new UnauthorizedException('Your account is inactive');
        }
        break;
      default:
        throw new UnauthorizedException('Invalid user role');
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

function extractToken(request: any): string | undefined {
  const header = request.headers?.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return request.cookies?.access_token;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractToken(request);
    if (!token) throw new UnauthorizedException('Not authenticated');
    try {
      request.user = await this.jwtService.verifyAsync(token);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

/** Attaches req.user when a valid token is present, but never rejects. */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractToken(request);
    if (token) {
      try {
        request.user = await this.jwtService.verifyAsync(token);
      } catch {
        /* guest */
      }
    }
    return true;
  }
}

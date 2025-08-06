import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to make authentication optional
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If there's an error or no user, just return null (no authentication)
    // This allows the request to proceed without authentication
    if (err || !user) {
      return null;
    }

    // If user exists, return it
    return user;
  }

  // Override canActivate to always return true (allow request to proceed)
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Call parent canActivate
      const result = await super.canActivate(context);
      return true; // Always allow request to proceed
    } catch (error) {
      return true; // Still allow request to proceed even on error
    }
  }
}

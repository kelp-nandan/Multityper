import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { SessionUser } from "../session-user";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SessionUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: SessionUser }>();
    return request.user;
  },
);

import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Reads the cart token from the `x-cart-token` header. The customer frontend
 * generates this UUID once (localStorage) and sends it on every cart call so
 * guest sessions are stable across page loads.
 */
export const CartToken = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  const token = req.headers['x-cart-token'];
  if (!token || typeof token !== 'string') {
    throw new BadRequestException('Missing x-cart-token header');
  }
  return token;
});

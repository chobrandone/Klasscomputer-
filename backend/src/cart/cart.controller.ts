import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: JwtPayload) {
    return this.cartService.getCart(user.sub);
  }

  @Post('add')
  add(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: { productId: string; quantity?: number; variantSelection?: Record<string, string> },
  ) {
    return this.cartService.add(
      user.sub,
      body.productId,
      body.quantity || 1,
      body.variantSelection,
    );
  }

  @Patch('update')
  update(
    @CurrentUser() user: JwtPayload,
    @Body() body: { itemId: string; quantity: number },
  ) {
    return this.cartService.updateQuantity(user.sub, body.itemId, body.quantity);
  }

  @Post('merge')
  merge(@CurrentUser() user: JwtPayload, @Body() body: { items: any[] }) {
    return this.cartService.merge(user.sub, body.items);
  }

  @Delete('remove/:itemId')
  remove(@CurrentUser() user: JwtPayload, @Param('itemId') itemId: string) {
    return this.cartService.remove(user.sub, itemId);
  }

  @Delete('clear')
  clear(@CurrentUser() user: JwtPayload) {
    return this.cartService.clear(user.sub);
  }
}

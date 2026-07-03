import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard, OptionalAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OrdersService, PlaceOrderDto } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  place(@Body() dto: PlaceOrderDto, @CurrentUser() user?: JwtPayload) {
    if (user && !dto.email) dto.email = user.email;
    return this.ordersService.place(dto, user?.sub);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  myOrders(@CurrentUser() user: JwtPayload) {
    return this.ordersService.myOrders(user.sub);
  }

  @Get('track')
  track(@Query('orderNumber') orderNumber: string, @Query('email') email?: string) {
    return this.ordersService.track(orderNumber, email);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminList(@Query() query: any) {
    return this.ordersService.adminList(query);
  }

  @Post(':id/confirm-payment')
  @UseGuards(OptionalAuthGuard)
  confirmPayment(@Param('id') id: string) {
    return this.ordersService.confirmPayment(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.ordersService.findOne(id, user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: any; trackingNumber?: string },
  ) {
    return this.ordersService.updateStatus(id, body.status, body.trackingNumber);
  }
}

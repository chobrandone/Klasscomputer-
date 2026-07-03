import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  listCustomers(@Query('search') search?: string) {
    return this.usersService.listCustomers(search);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.usersService.updateProfile(user.sub, body);
  }

  @Get('me/addresses')
  listAddresses(@CurrentUser() user: JwtPayload) {
    return this.usersService.listAddresses(user.sub);
  }

  @Post('me/addresses')
  addAddress(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.usersService.addAddress(user.sub, body);
  }

  @Patch('me/addresses/:id')
  updateAddress(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.usersService.updateAddress(user.sub, id, body);
  }

  @Delete('me/addresses/:id')
  removeAddress(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.removeAddress(user.sub, id);
  }

  @Get(':id')
  @Roles('admin')
  getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}

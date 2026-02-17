import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SystemService } from '../services/system.service';
import { SystemSetupDto } from '../dto/system-setup.dto';

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Post('setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bootstrap the system with the first organization and admin' })
  @ApiResponse({ status: 200, description: 'System setup successful' })
  async setup(@Body() setupDto: SystemSetupDto) {
    return this.systemService.bootstrap(setupDto);
  }
}

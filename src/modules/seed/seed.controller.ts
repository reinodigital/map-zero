import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { AuthDecorator } from '../auth/decorators/auth.decorator';
import { SecurityRoles } from 'src/enums';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('/territories-cr')
  @AuthDecorator(SecurityRoles.SUPER_ADMIN)
  createAddressCR() {
    // return 'Todos los territorios de CR ya fueron creados anteriormente.';
    return this.seedService.createTerritoriesObjects();
  }

  @Post('/cabys-list')
  @AuthDecorator(SecurityRoles.SUPER_ADMIN)
  createCabys() {
    // return 'Todos los Cabys ya fueron creados anteriormente.';
    return this.seedService.createCabysList();
  }

  @Post('/activities-list')
  @AuthDecorator(SecurityRoles.SUPER_ADMIN)
  createEconomicActivities() {
    return this.seedService.createEconomicActivities();
  }
}

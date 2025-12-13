import { Controller } from '@nestjs/common';
import { SeedService} from './seeder.service';
// import { CategorySeedService } from './category.seeder.service';
// import { ServiceSeedService } from './service.seeder.service';

@Controller('seeder')
export class SeederController {
  constructor(
    private readonly seederService: SeedService,
    // private readonly categorySeederService: CategorySeedService,
    // private readonly serviceSeederService: ServiceSeedService
    ) {}
}

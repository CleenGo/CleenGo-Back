import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { User } from 'src/user/entities/user.entity';
import { Review } from './entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Provider } from 'src/provider/entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, User, Provider])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}

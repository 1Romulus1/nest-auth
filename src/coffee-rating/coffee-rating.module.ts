import { Module } from '@nestjs/common';
import { CoffesModule } from 'src/coffes/coffes.module'
import { CoffeeRatingService } from './coffee-rating.service';

@Module({
  imports: [CoffesModule],
  providers: [CoffeeRatingService]
})
export class CoffeeRatingModule {}

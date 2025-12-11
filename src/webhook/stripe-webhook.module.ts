import { Module } from '@nestjs/common';
import { StripeWebhookController } from './app.controller';
import { StripeServiceService } from './stripe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from 'src/provider/entities/provider.entity';
import { Suscription } from 'src/suscription/entities/suscription.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Provider, Suscription])],
    controllers: [StripeWebhookController],
    providers: [StripeServiceService],
})
export class StripeWebhookModule { }

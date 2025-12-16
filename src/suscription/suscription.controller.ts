import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { SuscriptionService } from './suscription.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('subscription')
export class SuscriptionController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover',
  });

  constructor(private readonly subscriptionService: SuscriptionService) {}

  // ================================
  // 1️⃣ CREAR CHECKOUT SESSION (Swagger / Front)
  // ================================
  @Post('create-checkout-session')
  async createCheckout(@Body() body: CreateCheckoutDto) {
    const { providerId } = body;

    if (!providerId) {
      throw new BadRequestException('providerId is required');
    }

    return this.subscriptionService.createCheckoutSession(providerId);
  }

  // ================================
  // 2️⃣ WEBHOOK STRIPE (PAGO ÚNICO)
  // ================================
  @Post('webhook')
  async stripeWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    console.log('🚨 Webhook hit');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body, // ⚠️ BODY CRUDO (BUFFER)
        signature,
        'whsec_c3634c0d9576a57a95796b7e42b1a7c8969da1746a52bed333e467b297d60d68',
      );
    } catch (err: any) {
      console.log('❌ Webhook error:', err.message);
      return { received: false };
    }

    console.log('👉 Evento recibido:', event.type);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('👉 Metadata:', paymentIntent.metadata);

      const providerId = paymentIntent.metadata?.providerId;

      if (!providerId) {
        console.log('❌ providerId no vino en metadata');
        return { received: true };
      }

      await this.subscriptionService.activatePremium(providerId);
      console.log('✅ Premium activado para provider:', providerId);
    }

    return { received: true };
  }
}

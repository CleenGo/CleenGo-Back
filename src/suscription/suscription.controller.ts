import { Controller, Post, Req, Headers, Body, BadRequestException } from '@nestjs/common';
import { SuscriptionService } from './suscription.service';
import Stripe from 'stripe';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('subscription')
export class SuscriptionController {
  constructor(private readonly subscriptionService: SuscriptionService) {}

/*   @Post('create-checkout-session')
  async createCheckout(@Req() req) {
    const providerId = req.user.id; // usuario logueado
    return this.subscriptionService.createCheckoutSession(providerId);
  } */

@Post('create-checkout-session')
  async createCheckout(@Body() body: CreateCheckoutDto) {
    const { providerId } = body;
    if (!providerId) throw new BadRequestException('providerId is required');
    return this.subscriptionService.createCheckoutSession(providerId);
  }

  @Post('webhook')
  async stripeWebhook(@Req() req, @Headers('stripe-signature') signature: string) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-11-17.clover' });
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.log('Webhook error:', err.message);
      throw err;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.subscriptionService.confirmPayment(session);
    }

    return { received: true };
  }
}

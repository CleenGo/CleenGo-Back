import {
  Controller,
  Post,
  Get,
  Query,
  Req,
  Res,
  Headers,
  Body,
  BadRequestException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { SuscriptionService } from './suscription.service';
import Stripe from 'stripe';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('subscription')
export class SuscriptionController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover',
  });

  constructor(private readonly subscriptionService: SuscriptionService) {}

  @Post('create-checkout-session')
  async createCheckout(@Body() body: CreateCheckoutDto) {
    const { providerId } = body;
    if (!providerId) throw new BadRequestException('providerId is required');
    return this.subscriptionService.createCheckoutSession(providerId);
  }

  @Get('verify-session')
  async verifySession(@Query('session_id') sessionId: string) {
    if (!sessionId) {
      throw new BadRequestException('session_id is required');
    }

    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      console.log('📋 Verificando sesión:', {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
      });

      if (session.payment_status === 'paid') {
        const email = session.customer_email;
        if (!email) {
          throw new BadRequestException('No email in session');
        }

        const provider =
          await this.subscriptionService.findProviderByEmail(email);
        if (!provider) {
          throw new NotFoundException('Provider not found');
        }

        const subscription =
          await this.subscriptionService.findSubscriptionByProviderId(
            provider.id,
          );

        return {
          success: true,
          paymentStatus: session.payment_status,
          subscription: {
            isActive: subscription?.isActive || false,
            paymentStatus: subscription?.paymentStatus || false,
            plan: subscription?.plan?.name || null,
          },
        };
      }

      return {
        success: false,
        paymentStatus: session.payment_status,
        message: 'Payment not completed',
      };
    } catch (error) {
      console.error('❌ Error verifying session:', error);
      throw new BadRequestException('Error verifying payment session');
    }
  }

  @Post('webhook')
  async stripeWebhook(
    @Req() req: any,
    @Res() res: any,
    @Headers('stripe-signature') signature: string,
  ) {
    console.log('🎯 Body type:', typeof req.body);
    console.log('🎯 Is Buffer?', Buffer.isBuffer(req.body));

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err: any) {
      console.error('========================================');
      console.error('❌ ERROR DE VERIFICACIÓN');
      console.error('Mensaje:', err.message);
      console.error('========================================');
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('✅ Evento verificado:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      try {
        await this.subscriptionService.confirmPayment(session);
        console.log('✅ Pago confirmado en BD');
      } catch (error) {
        console.error('❌ Error al confirmar pago:', error);
        return res.status(500).send('Error processing payment');
      }
    }

    return res.status(200).json({ received: true });
  }

  @Get('provider/:providerId')
  async getProviderSubscription(@Param('providerId') providerId: string) {
    if (!providerId) {
      throw new BadRequestException('providerId is required');
    }

    const subscription =
      await this.subscriptionService.findSubscriptionByProviderId(providerId);

    if (!subscription) {
      return null; // No error, solo null si no existe
    }

    return {
      id: subscription.id,
      paymentStatus: subscription.paymentStatus,
      isActive: subscription.isActive,
      startDate: subscription.startDate,
      plan: subscription.plan
        ? {
            id: subscription.plan.id,
            name: subscription.plan.name,
            price: subscription.plan.price,
            description: subscription.plan.description,
          }
        : null,
      provider: {
        id: subscription.provider.id,
        name: subscription.provider.name,
        email: subscription.provider.email,
      },
    };
  }
}

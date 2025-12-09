import {
    Controller,
    Post,
    Headers,
    Req,
    Res,
    HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { StripeServiceService } from './stripe.service';

@Controller('stripe')
export class StripeWebhookController {
    private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-11-17.clover',
    });

    constructor(private readonly stripeService: StripeServiceService) { }

    @Post('webhook')
    async handleWebhook(
        @Req() req: Request,
        @Res() res: Response,
        @Headers('stripe-signature') signature: string,
    ) {
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(
                req['rawBody'],
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!,
            );
        } catch (err) {
            console.log('⚠️ Webhook signature error:', err.message);
            return res.status(HttpStatus.BAD_REQUEST).send(`Webhook error`);
        }

        switch (event.type) {
            case 'checkout.session.completed':
                await this.stripeService.handleCheckoutCompleted(
                    event.data.object as Stripe.Checkout.Session,
                );
                break;

            case 'customer.subscription.deleted':
                await this.stripeService.handleSubscriptionCancelled(
                    event.data.object as Stripe.Subscription,
                );
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.status(200).send('OK');
    }
}

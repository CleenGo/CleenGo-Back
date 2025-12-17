import { Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suscription } from './entities/suscription.entity';
import { Provider } from 'src/provider/entities/provider.entity';
import { Plan } from 'src/suscription-plan/entities/suscription-plan.entity';

@Injectable()
export class SuscriptionService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-11-17.clover',
  });

  constructor(
    @InjectRepository(Suscription)
    private subscriptionRepo: Repository<Suscription>,

    @InjectRepository(Provider)
    private providerRepo: Repository<Provider>,

    @InjectRepository(Plan)
    private planRepo: Repository<Plan>,
  ) {}

  async createCheckoutSession(providerId: string) {
    const provider = await this.providerRepo.findOne({
      where: { id: providerId },
      relations: ['suscription'],
    });
    if (!provider) throw new NotFoundException('Provider not found');

    const plan = await this.planRepo.findOne({ where: { name: 'Premium' } });
    if (!plan) throw new NotFoundException('Plan not found');

    // Crear registro de Suscription si no existe
    let subscription = provider.suscription;
    if (!subscription) {
      subscription = this.subscriptionRepo.create({
        provider,
        plan,
        paymentStatus: false,
        isActive: false,
        startDate: new Date(),
      });
      await this.subscriptionRepo.save(subscription);
    }

    // Crear Checkout Session de Stripe (pago único)
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment', // pago único
      payment_method_types: ['card'],
      customer_email: provider.email, // agregamos email del provider
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!, // tu ID del producto de Stripe
          quantity: 1,
        },
      ],
      // success_url: process.env.FRONT_URL + '/success',
      // cancel_url: process.env.FRONT_URL + '/cancel',
      success_url: `${process.env.FRONT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONT_URL}/cancel`,
    });

    return { url: session.url };
  }

  async confirmPayment(session: Stripe.Checkout.Session) {
    // Primero buscamos al provider por email
    const email = session.customer_email;
    if (!email) return;

    const provider = await this.providerRepo.findOne({ where: { email } });
    if (!provider || !provider.id) return;

    // Luego buscamos la suscripción usando el id del provider
    const subscription = await this.subscriptionRepo.findOne({
      where: { provider: { id: provider.id } },
      relations: ['provider'],
    });
    if (!subscription) return;

    subscription.paymentStatus = true;
    subscription.isActive = true;
    await this.subscriptionRepo.save(subscription);
  }

  async findProviderByEmail(email: string) {
    return this.providerRepo.findOne({
      where: { email },
      relations: ['suscription'],
    });
  }

  async findSubscriptionByProviderId(providerId: string) {
    return this.subscriptionRepo.findOne({
      where: { provider: { id: providerId } },
      relations: ['provider', 'plan'],
    });
  }
}

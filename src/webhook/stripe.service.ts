import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from 'src/provider/entities/provider.entity';
import { Suscription } from 'src/suscription/entities/suscription.entity';

@Injectable()
export class StripeServiceService {
    constructor(
        @InjectRepository(Provider)
        private providerRepo: Repository<Provider>,

        @InjectRepository(Suscription)
        private suscriptionRepo: Repository<Suscription>,
    ) { }


    // ✔ Cuando Stripe confirma el pago
    async handleCheckoutCompleted(session) {
        const providerId = session.metadata.providerId;
        const planId = session.metadata.planId; // lo mandamos desde frontend

        const provider = await this.providerRepo.findOne({
            where: { id: providerId },
            relations: ['suscription'],
        });

        if (!provider) {
            console.log("❌ Provider no encontrado");
            return;
        }

        // Si ya tenía suscripción, la desactivo
        if (provider.suscription) {
            provider.suscription.isActive = false;
            await this.suscriptionRepo.save(provider.suscription);
        }

        // ✔ Crear nueva suscripción usando SOLO los campos reales
        const newSub = this.suscriptionRepo.create({
            provider: provider,
            plan: { id: planId } as any,
            startDate: new Date(),
            paymentStatus: true,
            isActive: true,
        });

        await this.suscriptionRepo.save(newSub);

        provider.suscription = newSub;
        await this.providerRepo.save(provider);

        console.log('✔️ Suscripción creada sin campos extra');
    }

    // ✔ Cuando Stripe cancela el pago mensual
    async handleSubscriptionCancelled(subscription) {
        console.log("⚠️ Recibida cancelación, pero tu entidad NO tiene campo para guardarla");

        // Si querés manejar algo, podés buscar el provider por metadata
        // subscription.metadata.providerId
        // pero como tu entidad NO tiene estatus, no podemos guardar nada
    }
}
/* 
desdeel front hay que mandar estos datos
metadata: {
    providerId: providerId,
    planId: planId
} */
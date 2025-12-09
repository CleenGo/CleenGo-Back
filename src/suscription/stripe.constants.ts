export const STRIPE_PRICE_IDS = {
    BASIC: 'price_1SLFS0RW4rItui38v9fYj4ws',      // Plan Basic (5 servicios)
    STANDARD: 'price_1SLFStRW4rItui38FVl0KaN7',   // Plan Standard (10 servicios)
    PREMIUM: 'price_1SLFTPRW4rItui38wqgyrGCA',    // Plan Premium (15 servicios)
};

export const SUBSCRIPTION_PLANS = {
    BASIC: {
        name: 'Basic',
        monthlyServices: 5,
        price: 5000,
        stripePriceId: STRIPE_PRICE_IDS.BASIC,
    },
    PREMIUM: {
        name: 'Premium',
        monthlyServices: 15,
        price: 12000,
        stripePriceId: STRIPE_PRICE_IDS.PREMIUM,
    },
};
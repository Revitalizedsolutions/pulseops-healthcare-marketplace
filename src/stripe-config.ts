export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SaLQXaqEokIvWU',
    priceId: 'price_1RfAjqCYiOjDQFAWyn1yDPwy',
    name: 'BASE PCM MONTHLY SUBSCRIPTION',
    description: 'BASE PCM PATIENTS',
    mode: 'subscription',
    price: 25.00
  },
  {
    id: 'prod_SaLN7inn42D718',
    priceId: 'price_1RfAgqCYiOjDQFAW7feAjBMN',
    name: 'BASE RTM MONTHLY SUBSCRIPTION',
    description: 'BASE MONTHLY SUBSCRIPTION FOR RTM PATIENTS',
    mode: 'subscription',
    price: 20.00
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}
import Stripe from 'stripe';
import { env } from './env.config.js';

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export default stripe;

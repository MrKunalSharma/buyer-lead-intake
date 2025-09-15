import { z } from 'zod';

export const buyerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: z.enum(['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other']),
  propertyType: z.enum(['Apartment', 'Villa', 'Plot', 'Office', 'Retail']),
  bhk: z.enum(['Studio', 'One', 'Two', 'Three', 'Four']).optional(),
  purpose: z.enum(['Buy', 'Rent']),
budgetMin: z.union([
  z.string().regex(/^\d+$/).transform(val => parseInt(val)),
  z.literal(''),
  z.undefined()
]).optional(),
budgetMax: z.union([
  z.string().regex(/^\d+$/).transform(val => parseInt(val)),
  z.literal(''),
  z.undefined()
]).optional(),
  timeline: z.enum(['ZeroToThree', 'ThreeToSix', 'MoreThanSix', 'Exploring']),
  source: z.enum(['Website', 'Referral', 'WalkIn', 'Call', 'Other']),
  status: z.enum(['NEW', 'QUALIFIED', 'CONTACTED', 'VISITED', 'NEGOTIATION', 'CONVERTED', 'DROPPED']).default('NEW'),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional().default([]),
}).refine((data) => {
  // BHK required only for Apartment/Villa
  if (['Apartment', 'Villa'].includes(data.propertyType)) {
    return !!data.bhk;
  }
  return true;
}, {
  message: 'BHK is required for Apartment and Villa',
  path: ['bhk'],
}).refine((data) => {
  // Budget validation
  if (data.budgetMin && data.budgetMax) {
    return Number(data.budgetMax) >= Number(data.budgetMin);
  }
  return true;
}, {
  message: 'Budget Max must be greater than or equal to Budget Min',
  path: ['budgetMax'],
});

export type BuyerInput = z.infer<typeof buyerSchema>;

// Display mappings
export const displayMappings = {
  city: {
    Chandigarh: 'Chandigarh',
    Mohali: 'Mohali',
    Zirakpur: 'Zirakpur',
    Panchkula: 'Panchkula',
    Other: 'Other'
  },
  propertyType: {
    Apartment: 'Apartment',
    Villa: 'Villa',
    Plot: 'Plot',
    Office: 'Office',
    Retail: 'Retail'
  },
  bhk: {
    Studio: 'Studio',
    One: '1 BHK',
    Two: '2 BHK',
    Three: '3 BHK',
    Four: '4 BHK'
  },
  timeline: {
    ZeroToThree: '0-3 months',
    ThreeToSix: '3-6 months',
    MoreThanSix: '6+ months',
    Exploring: 'Just Exploring'
  },
  status: {
    NEW: 'New',
    QUALIFIED: 'Qualified',
    CONTACTED: 'Contacted',
    VISITED: 'Site Visited',
    NEGOTIATION: 'In Negotiation',
    CONVERTED: 'Converted',
    DROPPED: 'Dropped'
  },
  source: {
    Website: 'Website',
    Referral: 'Referral',
    WalkIn: 'Walk-in',
    Call: 'Phone Call',
    Other: 'Other'
  },
  purpose: {
    Buy: 'Buy',
    Rent: 'Rent'
  }
};
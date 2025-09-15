import { buyerSchema } from '@/lib/validations/buyer';

describe('Buyer Validation Tests', () => {
  describe('Basic Validation', () => {
    it('should validate a complete valid buyer object', () => {
      const validBuyer = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: 'Two',
        purpose: 'Buy',
        budgetMin: '5000000',  // Try as string
        budgetMax: '8000000',  // Try as string
        timeline: 'ZeroToThree',
        source: 'Website',
        status: 'NEW',
        notes: 'Looking for 2BHK',
        tags: ['urgent', 'verified'],
      };

      const result = buyerSchema.safeParse(validBuyer);
      if (!result.success) {
        console.log('Validation failed:', JSON.stringify(result.error.errors, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone number', () => {
      const invalidBuyer = {
        fullName: 'John Doe',
        phone: '123', // Too short
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        timeline: 'Exploring',
        source: 'Website',
      };

      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const invalidBuyer = {
        fullName: 'John Doe',
        email: 'not-an-email', // Invalid email
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        timeline: 'Exploring',
        source: 'Website',
      };

      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should reject name less than 2 characters', () => {
      const invalidBuyer = {
        fullName: 'A', // Too short
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot',
        purpose: 'Buy',
        timeline: 'Exploring',
        source: 'Website',
      };

      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should accept buyer without optional fields', () => {
      const minimalBuyer = {
        fullName: 'Jane Doe',
        phone: '9876543210',
        city: 'Mohali',
        propertyType: 'Office',
        purpose: 'Rent',
        timeline: 'ThreeToSix',
        source: 'Referral',
      };

      const result = buyerSchema.safeParse(minimalBuyer);
      expect(result.success).toBe(true);
    });
  });

  describe('Budget Validation', () => {
    it('should handle budget values correctly', () => {
      const buyerWithBudget = {
        fullName: 'Test User',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Villa',
        bhk: 'Four',
        purpose: 'Buy',
        budgetMin: '10000000',  // Try as string
        budgetMax: '15000000',  // Try as string
        timeline: 'ZeroToThree',
        source: 'Website',
      };

      const result = buyerSchema.safeParse(buyerWithBudget);
      if (!result.success) {
        console.log('Budget test failed:', JSON.stringify(result.error.errors, null, 2));
      }
      expect(result.success).toBe(true);
    });
  });
});
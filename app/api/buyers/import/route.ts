import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { buyerSchema } from '@/lib/validations/buyer';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 });
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1);

    if (rows.length > 200) {
      return NextResponse.json({ error: 'Maximum 200 rows allowed' }, { status: 400 });
    }

    const errors: any[] = [];
    const validBuyers: any[] = [];

    // Process each row
    rows.forEach((row, index) => {
      const values = row.split(',').map(v => v.trim());
      const buyerData: any = {};

      headers.forEach((header, i) => {
        const value = values[i] || '';
        
        // Map CSV headers to schema fields
        switch(header) {
          case 'fullName':
            buyerData.fullName = value;
            break;
          case 'email':
            buyerData.email = value || undefined;
            break;
          case 'phone':
            buyerData.phone = value;
            break;
          case 'city':
            buyerData.city = value;
            break;
          case 'propertyType':
            buyerData.propertyType = value;
            break;
          case 'bhk':
            buyerData.bhk = value || undefined;
            break;
          case 'purpose':
            buyerData.purpose = value;
            break;
          case 'budgetMin':
            buyerData.budgetMin = value ? parseInt(value) : undefined;
            break;
          case 'budgetMax':
            buyerData.budgetMax = value ? parseInt(value) : undefined;
            break;
          case 'timeline':
            // Map display values to enum values
            const timelineMap: any = {
              '0-3 months': 'ZeroToThree',
              '3-6 months': 'ThreeToSix',
              '6+ months': 'MoreThanSix',
              'Just Exploring': 'Exploring'
            };
            buyerData.timeline = timelineMap[value] || value;
            break;
          case 'source':
            // Map display values to enum values
            const sourceMap: any = {
              'Website': 'Website',
              'Referral': 'Referral',
              'Walk-in': 'WalkIn',
              'Phone Call': 'Call',
              'Other': 'Other'
            };
            buyerData.source = sourceMap[value] || value;
            break;
          case 'notes':
            buyerData.notes = value || undefined;
            break;
          case 'tags':
            buyerData.tags = value ? value.split(';').map(t => t.trim()) : [];
            break;
          case 'status':
            // Map display values to enum values
            const statusMap: any = {
              'New': 'NEW',
              'Qualified': 'QUALIFIED',
              'Contacted': 'CONTACTED',
              'Site Visited': 'VISITED',
              'In Negotiation': 'NEGOTIATION',
              'Converted': 'CONVERTED',
              'Dropped': 'DROPPED'
            };
            buyerData.status = statusMap[value] || value || 'NEW';
            break;
        }
      });

      // Validate the data
      try {
        const validated = buyerSchema.parse(buyerData);
        validBuyers.push({ ...validated, ownerId: user.id });
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            row: index + 2, // +2 because we skip header and index starts at 0
           errors: (error as any).errors.map((e: any) => ({
              field: e.path.join('.'),
              message: e.message
            }))
          });
        }
      }
    });

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors,
        validCount: validBuyers.length,
        totalCount: rows.length
      }, { status: 400 });
    }

    // Insert all valid buyers in a transaction
    const created = await prisma.$transaction(async (tx: any) => {
      const buyers = [];
      for (const buyerData of validBuyers) {
        const buyer = await tx.buyer.create({
          data: buyerData
        });
        
        // Create history entry
        await tx.buyerHistory.create({
          data: {
            buyerId: buyer.id,
            changedBy: user.id,
            diff: { action: 'created', source: 'csv_import' }
          }
        });
        
        buyers.push(buyer);
      }
      return buyers;
    });

    return NextResponse.json({
      success: true,
      imported: created.length,
      totalCount: rows.length
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
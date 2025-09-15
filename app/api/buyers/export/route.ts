import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { displayMappings } from '@/lib/validations/buyer';
import { any } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') as any;
    const propertyType = searchParams.get('propertyType') as any;
    const status = searchParams.get('status') as any;
    const timeline = searchParams.get('timeline') as any;

    const where: any = {
      AND: []
    };

    if (search) {
      where.AND.push({
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      });
    }

    if (city) where.AND.push({ city });
    if (propertyType) where.AND.push({ propertyType });
    if (status) where.AND.push({ status });
    if (timeline) where.AND.push({ timeline });

    const buyers = await prisma.buyer.findMany({
      where: where.AND.length > 0 ? where : undefined,
      orderBy: { updatedAt: 'desc' },
    });

    // Convert to CSV format
    const headers = ['fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 'notes', 'tags', 'status'];
    
    const rows = buyers.map((buyer: any) => [
      buyer.fullName,
      buyer.email || '',
      buyer.phone,
      buyer.city,
      buyer.propertyType,
      buyer.bhk || '',
      buyer.purpose,
      buyer.budgetMin || '',
      buyer.budgetMax || '',
(displayMappings.timeline as any)[buyer.timeline],
(displayMappings.source as any)[buyer.source],
buyer.notes || '',
buyer.tags.join(', '),
(displayMappings.status as any)[buyer.status],
    ]);

const csv = [headers, ...rows].map(row => row.map((cell: any) => 
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    ).join(',')).join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=buyers-${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buyerSchema } from '@/lib/validations/buyer';
import { getCurrentUser } from '@/lib/auth';
import { rateLimit } from '@/lib/utils/rate-limit';
import { z } from 'zod';

// GET - Get single buyer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buyer = await prisma.buyer.findUnique({
      where: { id: params.id },
      include: {
        owner: { select: { name: true, email: true } },
        history: {
          orderBy: { changedAt: 'desc' },
          take: 5,
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error('GET /api/buyers/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update buyer
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const { success } = rateLimit.limit(user.id);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const { updatedAt: clientUpdatedAt, ...data } = body;

    // Convert budget strings to numbers if needed
    if (data.budgetMin === '') data.budgetMin = undefined;
    if (data.budgetMax === '') data.budgetMax = undefined;
    if (data.budgetMin) data.budgetMin = parseInt(data.budgetMin);
    if (data.budgetMax) data.budgetMax = parseInt(data.budgetMax);

    const validated = buyerSchema.parse(data);

    // Check ownership and concurrency
    const existing = await prisma.buyer.findUnique({
      where: { id: params.id },
      select: { ownerId: true, updatedAt: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    if (existing.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check for concurrent updates
    if (clientUpdatedAt && new Date(clientUpdatedAt) < existing.updatedAt) {
      return NextResponse.json(
        { error: 'Record has been modified by another user. Please refresh and try again.' },
        { status: 409 }
      );
    }

    // Get old data for history
    const oldData = await prisma.buyer.findUnique({ where: { id: params.id } });

    const buyer = await prisma.buyer.update({
      where: { id: params.id },
      data: validated as any,
    });

    // Create history entry
    const changes: any = {};
    Object.keys(validated).forEach((key) => {
      if (oldData && oldData[key as keyof typeof oldData] !== validated[key as keyof typeof validated]) {
        changes[key] = {
          old: oldData[key as keyof typeof oldData],
          new: validated[key as keyof typeof validated],
        };
      }
    });

    if (Object.keys(changes).length > 0) {
      await prisma.buyerHistory.create({
        data: {
          buyerId: buyer.id,
          changedBy: user.id,
          diff: { action: 'updated', changes },
        },
      });
    }

    return NextResponse.json(buyer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: (error as any).errors }, { status: 400 });
    }
    console.error('PUT /api/buyers/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete buyer
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buyer = await prisma.buyer.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    });

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    if (buyer.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.buyer.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/buyers/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
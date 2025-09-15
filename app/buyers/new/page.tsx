'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { buyerSchema, type BuyerInput, displayMappings } from '@/lib/validations/buyer';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBuyerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BuyerInput>({
   resolver: zodResolver(buyerSchema) as any,
    defaultValues: {
      status: 'NEW',
      tags: [],
    },
  });

  const propertyType = watch('propertyType');

  const onSubmit = async (data: BuyerInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tags,
          budgetMin: data.budgetMin ? parseInt(data.budgetMin as any) : undefined,
          budgetMax: data.budgetMax ? parseInt(data.budgetMax as any) : undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create buyer');
      }

      toast.success('Buyer created successfully!');
      router.push('/buyers');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create buyer');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/buyers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Buyers
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Add New Buyer Lead</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="10-15 digits"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* City */}
            <div>
              <Label htmlFor="city">City *</Label>
              <Select
                id="city"
                {...register('city')}
                className={errors.city ? 'border-red-500' : ''}
              >
                <option value="">Select City</option>
                {Object.entries(displayMappings.city).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </Select>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            {/* Property Type */}
            <div>
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select
                id="propertyType"
                {...register('propertyType')}
                className={errors.propertyType ? 'border-red-500' : ''}
              >
                <option value="">Select Type</option>
                {Object.entries(displayMappings.propertyType).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </Select>
              {errors.propertyType && (
                <p className="mt-1 text-sm text-red-600">{errors.propertyType.message}</p>
              )}
            </div>

            {/* BHK - Conditional */}
            {['Apartment', 'Villa'].includes(propertyType) && (
              <div>
                <Label htmlFor="bhk">BHK *</Label>
                <Select
                  id="bhk"
                  {...register('bhk')}
                  className={errors.bhk ? 'border-red-500' : ''}
                >
                  <option value="">Select BHK</option>
                  {Object.entries(displayMappings.bhk).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </Select>
                {errors.bhk && (
                  <p className="mt-1 text-sm text-red-600">{errors.bhk.message}</p>
                )}
              </div>
            )}

            {/* Purpose */}
            <div>
              <Label htmlFor="purpose">Purpose *</Label>
              <Select
                id="purpose"
                {...register('purpose')}
                className={errors.purpose ? 'border-red-500' : ''}
              >
                <option value="">Select Purpose</option>
                {Object.entries(displayMappings.purpose).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </Select>
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
              )}
            </div>

            {/* Budget Min */}
            <div>
              <Label htmlFor="budgetMin">Budget Min (₹)</Label>
              <Input
                id="budgetMin"
                type="number"
                {...register('budgetMin')}
                placeholder="Optional"
                className={errors.budgetMin ? 'border-red-500' : ''}
              />
              {errors.budgetMin && (
                <p className="mt-1 text-sm text-red-600">{errors.budgetMin.message}</p>
              )}
            </div>

            {/* Budget Max */}
            <div>
              <Label htmlFor="budgetMax">Budget Max (₹)</Label>
              <Input
                id="budgetMax"
                type="number"
                {...register('budgetMax')}
                placeholder="Optional"
                className={errors.budgetMax ? 'border-red-500' : ''}
              />
              {errors.budgetMax && (
                <p className="mt-1 text-sm text-red-600">{errors.budgetMax.message}</p>
              )}
            </div>

            {/* Timeline */}
            <div>
              <Label htmlFor="timeline">Timeline *</Label>
              <Select
                id="timeline"
                {...register('timeline')}
                className={errors.timeline ? 'border-red-500' : ''}
              >
                <option value="">Select Timeline</option>
                {Object.entries(displayMappings.timeline).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </Select>
              {errors.timeline && (
                <p className="mt-1 text-sm text-red-600">{errors.timeline.message}</p>
              )}
            </div>

            {/* Source */}
            <div>
              <Label htmlFor="source">Source *</Label>
              <Select
                id="source"
                {...register('source')}
                className={errors.source ? 'border-red-500' : ''}
              >
                <option value="">Select Source</option>
                {Object.entries(displayMappings.source).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </Select>
              {errors.source && (
                <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                {...register('status')}
                className={errors.status ? 'border-red-500' : ''}
              >
                {Object.entries(displayMappings.status).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Additional notes (max 1000 characters)"
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag and press Enter"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-400 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/buyers">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Buyer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
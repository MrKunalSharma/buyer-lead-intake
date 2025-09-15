'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { buyerSchema, type BuyerInput, displayMappings } from '@/lib/validations/buyer';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, History } from 'lucide-react';
import Link from 'next/link';

export default function EditBuyerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [buyer, setBuyer] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BuyerInput>({
   resolver: zodResolver(buyerSchema) as any,
  });

  const propertyType = watch('propertyType');

  useEffect(() => {
    fetchBuyer();
  }, [params.id]);

  const fetchBuyer = async () => {
    try {
      const res = await fetch(`/api/buyers/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch buyer');
      
      const data = await res.json();
      setBuyer(data);
      setTags(data.tags || []);
      setUpdatedAt(data.updatedAt);
      
      reset({
        fullName: data.fullName,
        email: data.email || '',
        phone: data.phone,
        city: data.city,
        propertyType: data.propertyType,
        bhk: data.bhk,
        purpose: data.purpose,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        timeline: data.timeline,
        source: data.source,
        status: data.status,
        notes: data.notes || '',
      });
    } catch (error) {
      toast.error('Failed to load buyer');
      router.push('/buyers');
    }
  };

  const onSubmit = async (data: BuyerInput) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/buyers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tags,
          budgetMin: data.budgetMin ? parseInt(data.budgetMin as any) : undefined,
          budgetMax: data.budgetMax ? parseInt(data.budgetMax as any) : undefined,
          updatedAt,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        if (res.status === 409) {
          toast.error(error.error);
          fetchBuyer(); // Refresh data
          return;
        }
        throw new Error(error.error || 'Failed to update buyer');
      }

      toast.success('Buyer updated successfully!');
      fetchBuyer(); // Refresh to get new updatedAt
    } catch (error: any) {
      toast.error(error.message || 'Failed to update buyer');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this buyer?')) return;
    
    try {
      const res = await fetch(`/api/buyers/${params.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete buyer');
      
      toast.success('Buyer deleted successfully!');
      router.push('/buyers');
    } catch (error) {
      toast.error('Failed to delete buyer');
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

  if (!buyer) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link href="/buyers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Buyers
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Edit Buyer Lead</h1>
            <p className="text-sm text-gray-500 mt-1">
              Created by: {buyer.owner.name || buyer.owner.email} • 
              Last updated: {new Date(buyer.updatedAt).toLocaleString()}
            </p>
          </div>
          <Button onClick={handleDelete} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Edit Form */}
          <div className="lg:col-span-2">
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
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <History className="h-5 w-5 mr-2" />
                History
              </h3>
              {buyer.history && buyer.history.length > 0 ? (
                <div className="space-y-4">
                                    {buyer.history.map((entry: any) => (
                    <div key={entry.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                      <div className="text-sm text-gray-500">
                        {new Date(entry.changedAt).toLocaleString()}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {entry.user.name || entry.user.email}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {entry.diff.action === 'created' ? (
                          'Created this lead'
                        ) : (
                          <div>
                            {Object.entries(entry.diff.changes || {}).map(([field, change]: [string, any]) => (
                              <div key={field}>
                                <span className="font-medium">{field}:</span>{' '}
                                {change.old || 'empty'} → {change.new || 'empty'}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No history available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
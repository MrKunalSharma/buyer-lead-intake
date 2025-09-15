'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ImportBuyersPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        toast.error('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setErrors([]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    setErrors([]);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/buyers/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          toast.error(`Validation failed: ${data.errors.length} errors found`);
        } else {
          throw new Error(data.error || 'Import failed');
        }
      } else {
        setResult(data);
        toast.success(`Successfully imported ${data.imported} buyers!`);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/buyers');
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'fullName',
      'email',
      'phone',
      'city',
      'propertyType',
      'bhk',
      'purpose',
      'budgetMin',
      'budgetMax',
      'timeline',
      'source',
      'notes',
      'tags',
      'status'
    ];

    const sampleData = [
      [
        'John Doe',
        'john@example.com',
        '9876543210',
        'Chandigarh',
        'Apartment',
        'Two',
        'Buy',
        '5000000',
        '8000000',
        '0-3 months',
        'Website',
        'Looking for 2BHK in good location',
        'urgent;verified',
        'New'
      ],
      [
        'Jane Smith',
        'jane@example.com',
        '9876543211',
        'Mohali',
        'Villa',
        'Four',
        'Buy',
        '10000000',
        '15000000',
        '3-6 months',
        'Referral',
        'Prefers gated community',
        'premium;referral',
        'Qualified'
      ]
    ];

    const csv = [headers, ...sampleData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buyers-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/buyers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Buyers
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Import Buyers</h1>
          <p className="text-gray-600 mt-2">
            Upload a CSV file to bulk import buyer leads (max 200 rows)
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Download the template CSV file to see the required format</li>
            <li>Fill in your buyer data following the template structure</li>
            <li>Ensure all required fields are filled correctly</li>
            <li>For tags, separate multiple tags with semicolons (;)</li>
            <li>Upload your CSV file (maximum 200 rows allowed)</li>
          </ol>
          <Button onClick={downloadTemplate} variant="outline" className="mt-4">
            <FileText className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        {/* Upload Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Upload File</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">CSV File</Label>
              <input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{file.name}</span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setErrors([]);
                    setResult(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Buyers
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-green-900">Import Successful!</h3>
            </div>
            <p className="mt-2 text-sm text-green-700">
              Successfully imported {result.imported} out of {result.totalCount} rows.
            </p>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-red-900">Validation Errors</h3>
            </div>
            <div className="space-y-3">
              {errors.map((error, index) => (
                <div key={index} className="bg-white p-3 rounded border border-red-200">
                  <p className="text-sm font-medium text-red-900">Row {error.row}:</p>
                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                    {error.errors.map((e: any, i: number) => (
                      <li key={i}>
                        {e.field}: {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
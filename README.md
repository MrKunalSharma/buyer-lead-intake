# Buyer Lead Intake Application

A comprehensive real estate buyer lead management system built with Next.js, TypeScript, and Prisma.

## Features Implemented ✅

### Core Features
- **CRUD Operations**: Create, Read, Update, Delete buyer leads
- **Authentication**: Simple cookie-based auth with magic link simulation
- **Validation**: Client and server-side validation using Zod
- **Pagination**: Server-side pagination with 10 records per page
- **Search & Filters**: Real-time search with debouncing, filter by city, property type, status, timeline
- **CSV Import/Export**: 
  - Import up to 200 leads with validation
  - Export filtered data to CSV
- **History Tracking**: Track all changes made to buyer records
- **Ownership**: Users can only edit/delete their own leads
- **Rate Limiting**: Prevent abuse with request rate limiting

### Additional Features
- **Tag Management**: Add/remove tags for buyer categorization
- **Conditional BHK Field**: BHK only required for Apartments/Villas
- **Budget Validation**: Ensures max budget ≥ min budget
- **Optimistic UI Updates**: Smooth user experience
- **Accessibility**: Basic keyboard navigation and ARIA labels
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful messages when no data
- **Responsive Design**: Works on mobile and desktop

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Forms**: React Hook Form

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd buyer-lead-intake
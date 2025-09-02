# Rating System Integration Guide

## Overview
Your mental health platform now has a comprehensive rating system that allows patients to rate their completed sessions with doctors across multiple categories.

## Components Created

### 1. RatingComponent.tsx
**Purpose**: Form for patients to rate completed meetings
**Location**: `frontend/src/components/RatingComponent.tsx`
**Features**:
- 5-star overall rating
- Category ratings (Communication, Professionalism, Knowledge, Satisfaction)
- Written comments
- Recommendation checkbox
- Anonymous submission option

### 2. DoctorRatings.tsx
**Purpose**: Display doctor rating statistics and reviews
**Location**: `frontend/src/components/DoctorRatings.tsx`
**Features**:
- Overall rating display
- Rating distribution charts
- Category averages
- Recent reviews
- Recommendation percentages

### 3. PendingRatings.tsx
**Purpose**: Show patients their unrated completed sessions
**Location**: `frontend/src/components/PendingRatings.tsx`
**Features**:
- List of completed sessions needing rating
- Quick access to rating form
- Session details and completion time

## Backend Components

### 1. ratingController.ts
**Purpose**: Handle rating statistics and data
**Location**: `backend/src/controllers/ratingController.ts`
**Endpoints**:
- `GET /api/ratings/doctor/:doctorId` - Get doctor rating statistics
- `GET /api/ratings/pending` - Get patient's pending ratings

### 2. ratingRoutes.ts
**Purpose**: Rating API routes
**Location**: `backend/src/routes/ratingRoutes.ts`
**Routes**: Configured rating endpoints with authentication

## Existing Backend Integration

### Rating Function (Already Exists)
**Location**: `backend/src/controllers/meeting.controller.ts`
**Function**: `rateMeeting`
**Endpoint**: `POST /api/meetings/:meetingId/rate`

This function already handles:
- Overall rating (1-5 stars)
- Category ratings (communication, professionalism, knowledge, satisfaction)
- Written comments
- Recommendation flag
- Anonymous submissions

## Integration Steps

### 1. Add Rating Routes to Main App
Add to your main app.ts or index.ts:

```typescript
import ratingRoutes from './routes/ratingRoutes';
app.use('/api/ratings', ratingRoutes);
```

### 2. Patient Dashboard Integration
Add to patient dashboard:

```jsx
import PendingRatings from '../components/PendingRatings';

// In your patient dashboard component
<PendingRatings />
```

### 3. Doctor Profile Integration
Add to doctor profile pages:

```jsx
import DoctorRatings from '../components/DoctorRatings';

// In doctor profile component
<DoctorRatings doctorId={doctorId} />
```

### 4. Post-Meeting Integration
After meeting completion, redirect to rating:

```jsx
import RatingComponent from '../components/RatingComponent';

// In meeting completion flow
<RatingComponent 
  meetingId={completedMeetingId}
  doctorName={doctorName}
  onRatingSubmitted={() => navigate('/dashboard')}
/>
```

## Database Schema (Already Exists)
Your Rating table already includes:
- `id`, `meetingId`, `patientId`, `doctorId`
- `rating` (overall 1-5)
- `communicationRating`, `professionalismRating`, `knowledgeRating`, `overallSatisfaction`
- `comment`, `wouldRecommend`, `isAnonymous`
- `createdAt`, `updatedAt`

## Testing the System

### 1. Complete a Meeting
- Book and complete a meeting as a patient
- Ensure meeting status is set to 'completed'

### 2. Rate the Meeting
- Check pending ratings appear in PendingRatings component
- Submit a rating with various categories
- Verify rating saves to database

### 3. View Doctor Ratings
- Check doctor profile shows rating statistics
- Verify rating distribution and averages are calculated correctly

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/meetings/:meetingId/rate` | Submit meeting rating (existing) |
| GET | `/api/ratings/doctor/:doctorId` | Get doctor rating statistics |
| GET | `/api/ratings/pending` | Get patient's pending ratings |

## Key Features

### 🌟 Multi-Category Ratings
- Overall experience (1-5 stars)
- Communication skills
- Professionalism
- Medical knowledge
- Overall satisfaction

### 🔒 Privacy Options
- Anonymous rating submission
- Public reviews with patient name
- Comment moderation capability

### 📊 Analytics
- Rating distribution charts
- Category averages
- Recommendation percentages
- Total rating counts

### 🎯 User Experience
- Intuitive star rating interface
- Pending ratings notifications
- Easy-to-read doctor profiles
- Responsive design

## Next Steps

1. **Integrate Components**: Add the components to your existing dashboard and profile pages
2. **Test Workflow**: Complete a full meeting → rating → display cycle
3. **Customize Styling**: Adjust colors and styles to match your brand
4. **Add Notifications**: Consider email reminders for pending ratings
5. **Moderation**: Implement review moderation if needed

Your rating system is now ready to enhance patient engagement and provide valuable feedback for healthcare providers! 🎉

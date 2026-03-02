# HailForge AI - FlutterFlow Project Structure

## Project Overview

**Project Name:** Forge AI
**Version:** 1.0
**Last Updated:** 2026-03-02

---

## Screens

### 1. Splash Screen
- App logo/branding
- Auto-navigate to Login after 2 seconds

### 2. Login Screen
- Email input
- Password input
- Login button (connects to Supabase)
- Link to Signup
- Forgot password option

### 3. Signup Screen
- Full Name input
- Email input
- Password input (min 8 chars)
- Role dropdown (Technician, Shop Owner, Adjuster)
- Signup button (creates user + profile in Supabase)
- Link to Login

### 4. Home Screen
- Header with app name
- Quick actions:
  - Button: "Start New Job"
  - Button: "View Jobs"
  - Button: "My Profile"
- Recent jobs preview (last 3 jobs)
- User greeting with name

### 5. New Job Screen
- VIN input (17 chars)
- Button: "Decode VIN" (calls NHTSA API)
- VIN decode results display
- Customer Name input
- Customer Phone input
- Vehicle input (auto-filled from VIN decode)
- Location input
- Notes input
- Button: "Save Job" (inserts to Supabase jobs table)
- Button: "Cancel"

### 6. Photo Upload Screen (NEW)
- Header: "Photo Analysis"
- Subtitle: "Upload photos of hail damage"
- File upload button (accepts images)
- Preview of uploaded image(s)
- Button: "Analyze with AI"
- Loading indicator
- AI Results display:
  - Dent count
  - Average dent size
  - High-payout areas
  - Repair estimate
- Button: "Use in Current Job"
- Button: "Cancel"

### 7. Job List Screen
- Header: "My Jobs"
- Filter dropdown (All, Pending, Completed)
- List of job cards
- Each card shows:
  - VIN
  - Vehicle
  - Customer
  - Status badge
  - Date
- Button: "Back to Home"

### 8. Job Details Screen
- Header with back button
- VIN
- Customer info
- Vehicle info
- Location
- Notes
- Status
- Photo gallery (if photos uploaded)
- AI Analysis results (if available)
- Button: "Update Status"
- Button: "Delete Job"

### 9. Profile Screen
- Header with back button
- User name
- Role
- Email
- Shop name
- Phone
- Form to update profile
- Button: "Update Profile"
- Button: "Logout"

---

## Data Collections

### Jobs Collection
| Field | Type | Required | Supabase Field |
|-------|------|----------|----------------|
| id | Number | Yes | id (auto) |
| user_id | Number | Yes | user_id |
| vin | Text | No | vin |
| customer_name | Text | Yes | customer_name |
| customer_phone | Text | No | customer_phone |
| vehicle | Text | Yes | vehicle |
| location | Text | No | location |
| notes | Text | No | notes |
| status | Text | Yes | status |
| created_at | Date/Time | Yes | created_at |
| updated_at | Date/Time | No | updated_at |
| photo_urls | Text | No | photo_urls (JSON array) |
| ai_analysis | Text | No | ai_analysis (JSON) |

### Profiles Collection
| Field | Type | Required | Supabase Field |
|-------|------|----------|----------------|
| id | Number | Yes | id (auto) |
| full_name | Text | No | full_name |
| role | Text | No | role |
| email | Text | No | email |
| shop_name | Text | No | shop_name |
| phone | Text | No | phone |
| created_at | Date/Time | Yes | created_at |

---

## API Integrations

### 1. Supabase Authentication
- **Sign Up with Email**
- **Sign In with Email**
- **Sign Out**

### 2. Supabase Jobs
- **List Records** (filter by user_id)
- **Create Record**
- **Update Record**
- **Delete Record**

### 3. Supabase Profiles
- **List Records** (filter by id)
- **Create Record**
- **Update Record**

### 4. NHTSA VIN Decode
- **GET** `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{{VIN}}?format=json`

### 5. Mock AI Analysis (HailBot)
- **POST** `https://hailforge-ai-mock-api.example.com/analyze`
- Returns JSON with:
  - dent_count: number
  - average_size_cm: number
  - high_payout_areas: array
  - estimate_percentage: number
  - repair_estimate: number

---

## Navigation Flow

```
Splash
  ↓
Login/Signup
  ↓
Home
  ↓
  ├─→ New Job
  │    ↓
  │    ├─→ Photo Upload (if photos)
  │    ↓
  │    └─→ Job List
  │
  ├─→ Job List
  │    ↓
  │    └─→ Job Details
  │
  └─→ Profile
```

---

## Key Features

### 1. VIN Decode
- Input: 17-character VIN
- Action: Call NHTSA API
- Output: Model year, make, model, trim, engine
- Auto-fill vehicle field

### 2. Photo Upload
- Accept images (JPG, PNG)
- Preview uploaded images
- Limit: 10 photos per job

### 3. AI Analysis (Mock)
- Call mock API
- Returns dent count, size, estimate
- Display results in Job Details

### 4. Job Status Management
- Status options: pending, in_progress, completed
- Update status via Job Details screen

### 5. Profile Management
- Update name, shop, phone
- Role-based access (technician, shop_owner, adjuster)

---

## Supabase Credentials

```
URL: https://pnplxodtpkasiwguugbj.supabase.co
Anon Key: sb_publishable_pRnfgV2V8E9Zrf9rqvqQ8A_ESBRSW7T
```

---

## RLS Policies

All tables have Row Level Security:
- Users can only see their own jobs
- Users can only see their own profile
- Users can create their own jobs
- Users can update their own jobs

---

## Dependencies

- Supabase JS SDK (included in FlutterFlow)
- No external API keys needed (except mock AI for demo)

---

## Design System

### Colors
- Primary: #3B82F6 (Blue)
- Secondary: #10B981 (Green)
- Background: #F3F4F6 (Light Gray)
- Surface: #FFFFFF (White)
- Text: #1F2937 (Dark Gray)
- Error: #EF4444 (Red)
- Warning: #F59E0B (Amber)

### Typography
- Headings: Inter, bold
- Body: Inter, regular
- Small: Inter, light

### Spacing
- Small: 8px
- Medium: 16px
- Large: 24px
- Extra Large: 32px

---

## Mock AI API Response

```json
{
  "dent_count": 24,
  "average_size_cm": 1.8,
  "high_payout_areas": ["hood", "roof", "trunk"],
  "estimate_percentage": 68,
  "repair_estimate": 4500,
  "estimated_payout": 67500,
  "detailed_areas": [
    {"area": "hood", "count": 8, "avg_size": 2.1},
    {"area": "roof", "count": 12, "avg_size": 1.5},
    {"area": "trunk", "count": 4, "avg_size": 2.0},
    {"area": "doors", "count": 0, "avg_size": 0}
  ]
}
```

---

## Future Enhancements

- Real AI integration (Gemini API)
- Photo upload to Supabase Storage
- Export reports (PDF)
- Email notifications
- Offline support
- Push notifications
- Multi-language support (Spanish)
- Photo filters for better analysis
- Video analysis
- Comparison with repair estimates
- Insurance claim integration

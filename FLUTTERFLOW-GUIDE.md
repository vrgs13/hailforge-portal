# FlutterFlow + Supabase Integration Guide

## Overview

This guide walks you through connecting your FlutterFlow app "Forge AI" to the HailForge Supabase backend.

## Prerequisites

- FlutterFlow project "Forge AI" created ✅
- Supabase project "Hail Forge AI App" created ✅
- Tables `jobs` and `profiles` created in Supabase ✅
- RLS policies enabled ✅

---

## Step 1: Connect Supabase to FlutterFlow

### 1.1 Open FlutterFlow Project

1. Open FlutterFlow web dashboard
2. Select project "Forge AI"
3. Wait for project to load

### 1.2 Add Supabase Data Source

1. Go to **Project Settings** (gear icon)
2. Click **Data** in left sidebar
3. Click **+ Add Data Source**
4. Select **Supabase**
5. Click **Connect to Supabase**

### 1.3 Enter Supabase Credentials

Enter the following credentials:

```
Supabase URL: https://pnplxodtpkasiwguugbj.supabase.co
Supabase Anon Key: sb_publishable_pRnfgV2V8E9Zrf9rqvqQ8A_ESBRSW7T
```

**Important:**
- Use the **Anon key**, not the Service Role key
- Service Role key gives full access (should never be exposed)

### 1.4 Test Connection

1. Click **Test Connection**
2. If successful, you'll see a green checkmark
3. Click **Continue**

---

## Step 2: Create FlutterFlow Collections

### 2.1 Create "Jobs" Collection

1. In FlutterFlow Data section, click **+ Add Collection**
2. Name it: **Jobs**
3. Click **Create Collection**

### 2.2 Add Fields to Jobs Collection

Add these fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| id | Number | Yes | Auto-increment ID |
| user_id | Number | Yes | User's ID |
| vin | Text | No | Vehicle Identification Number |
| customer_name | Text | Yes | Customer name |
| customer_phone | Text | No | Customer phone |
| vehicle | Text | Yes | Vehicle description |
| location | Text | No | Job location |
| notes | Text | No | Notes |
| status | Text | Yes | Job status (default: pending) |
| created_at | Date/Time | Yes | Created timestamp |
| updated_at | Date/Time | No | Updated timestamp |

**Mapping to Supabase:**
- Map to Supabase table: `jobs`
- Auto-sync: ✅ (recommended)

### 2.3 Create "Profiles" Collection

1. Click **+ Add Collection**
2. Name it: **Profiles**
3. Click **Create Collection**

### 2.4 Add Fields to Profiles Collection

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| id | Number | Yes | Auto-increment ID |
| full_name | Text | No | User's full name |
| role | Text | No | User role |
| email | Text | No | User email |
| shop_name | Text | No | Shop name |
| phone | Text | No | Phone number |
| created_at | Date/Time | Yes | Created timestamp |

**Mapping to Supabase:**
- Map to Supabase table: `profiles`
- Auto-sync: ✅ (recommended)

---

## Step 3: Configure Authentication

### 3.1 Enable Email Authentication

1. Go to **Project Settings** → **Authentication**
2. Click **+ Add Provider**
3. Select **Email**
4. Configure:
   - **Enable Email Auth:** ✅
   - **Confirm Email:** ✅ (recommended for security)
   - **Require Email Verification:** ✅ (optional)
   - **Enable Sign Up:** ✅
   - **Enable Login:** ✅

5. Click **Save**

### 3.2 Create Login Screen

1. Create a new page called **Login**
2. Add:
   - Text input: Email
   - Text input: Password
   - Button: Login
   - Button: Sign Up (link to Signup page)

### 3.3 Create Signup Screen

1. Create a new page called **Signup**
2. Add:
   - Text input: Full Name
   - Text input: Email
   - Text input: Password
   - Dropdown: Role (Technician, Shop Owner, Adjuster)
   - Button: Create Account
   - Button: Login (link to Login page)

### 3.4 Configure Login Button Action

1. Select the Login button
2. Go to **Actions** → **API** → **Supabase**
3. Select action: **Sign In with Email**
4. Configure:
   - **Email:** From Email input
   - **Password:** From Password input
5. Click **Save**

### 3.5 Configure Signup Button Action

1. Select the Signup button
2. Go to **Actions** → **API** → **Supabase**
3. Select action: **Sign Up with Email**
4. Configure:
   - **Email:** From Email input
   - **Password:** From Password input
   - **Data (JSON):**
     ```json
     {
       "full_name": "{{FullNameInput.text}}",
       "role": "{{RoleDropdown.value}}"
     }
     ```
5. After signup, create profile automatically:
   - Action: **Supabase → Create Record**
   - Collection: **Profiles**
   - Fields:
     - `id`: From user ID (use Supabase expression)
     - `full_name`: From FullNameInput.text
     - `role`: From RoleDropdown.value
     - `email`: From Email input
6. Click **Save**

---

## Step 4: Create Home Screen with Jobs

### 4.1 Create Home Page

1. Create a new page called **Home**
2. Add:
   - Header with app title
   - Button: "Start New Job"
   - Button: "View Jobs"
   - List: Job cards (initially empty)

### 4.2 Create "Start New Job" Page

1. Create a new page called **NewJob**
2. Add form fields:
   - Text input: VIN (17 characters)
   - Button: "Decode VIN" (calls NHTSA API)
   - Text input: Customer Name
   - Text input: Customer Phone
   - Text input: Vehicle (Year Make Model)
   - Text input: Location
   - Text area: Notes
   - Button: "Save Job"

### 4.3 Create Job List Page

1. Create a new page called **JobsList**
2. Add:
   - Header with title
   - List of job cards
   - Button: "Back to Home"

---

## Step 5: Implement Logic

### 5.1 Decode VIN Button Action

1. Select the "Decode VIN" button
2. Go to **Actions** → **API** → **HTTP Request**
3. Configure:
   - **URL:** `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{{VINInput.text}}?format=json`
   - **Method:** GET
4. On success:
   - Parse JSON response
   - Extract: Model Year, Make, Model, Trim, Engine
   - Fill Vehicle input field

### 5.2 Save Job Action

1. Select the "Save Job" button
2. Go to **Actions** → **API** → **Supabase**
3. Select action: **Create Record**
4. Configure:
   - **Collection:** Jobs
   - **Fields:**
     - `user_id`: From current user ID (use Supabase expression)
     - `vin`: From VINInput.text
     - `customer_name`: From CustomerNameInput.text
     - `customer_phone`: From CustomerPhoneInput.text
     - `vehicle`: From VehicleInput.text
     - `location`: From LocationInput.text
     - `notes`: From NotesInput.text
     - `status`: "pending"
5. After success:
   - Show success message
   - Navigate to JobsList page
   - Clear form

### 5.3 Load Jobs Action

1. On JobsList page load:
   - Action: **Supabase → List Records**
   - **Collection:** Jobs
   - **Filter:** `user_id` = current user ID
   - **Sort:** created_at (descending)
   - Display results in list

---

## Step 6: Handle Shadow DOM Limitation

### Important Notes

FlutterFlow uses Shadow DOM, which blocks programmatic field typing. **You will need to manually type in forms.**

### Workarounds

1. **Design larger touch targets**
   - Make inputs larger
   - Add clear labels

2. **Pre-fill where possible**
   - Auto-fill VIN if scanned
   - Auto-fill vehicle name if VIN decoded
   - User still needs to type manually

3. **Add helpful tooltips**
   - Explain what to type in each field
   - Show character limits (e.g., "17 characters for VIN")

4. **Test on physical device**
   - Use iPhone 16 Pro Max for testing
   - Ensure touch targets are large enough

---

## Step 7: Testing

### Test User Flow

1. **Sign Up**
   - Open app
   - Click "Sign Up"
   - Enter: Test User, test@test.com, password123
   - Select role: Technician
   - Click "Create Account"
   - Check email for verification (if enabled)

2. **Login**
   - Click "Login"
   - Enter credentials
   - Click "Login"
   - Should see Home screen

3. **Create Job**
   - Click "Start New Job"
   - Enter VIN: `1HGCM82633A004352`
   - Click "Decode VIN"
   - Verify vehicle info appears
   - Enter customer name: "John Doe"
   - Enter phone: "512-555-1234"
   - Enter vehicle: "2023 Honda Civic"
   - Enter location: "Austin, TX"
   - Add notes: "Hail damage - front hood"
   - Click "Save Job"

4. **View Jobs**
   - Click "View Jobs"
   - Verify job appears in list
   - Check status shows "Pending"
   - Click job to view details

5. **Logout**
   - Click logout button
   - Should return to Login screen

---

## Step 8: Publish App

### 8.1 Test on iOS (TestFlight)

1. Go to **Publish** → **TestFlight**
2. Configure:
   - **Build Type:** TestFlight (internal/public)
   - **Testers:** Add emails
3. Click **Build**
4. Wait for build to complete (5-10 minutes)
5. Install TestFlight build on iPhone
6. Test all flows

### 8.2 Test on Android

1. Go to **Publish** → **Android APK**
2. Click **Generate APK**
3. Download APK
4. Install on Android device
5. Test all flows

### 8.3 Publish to App Stores

1. **Apple App Store:**
   - Go to **Publish** → **App Store**
   - Fill in app details
   - Submit for review

2. **Google Play Store:**
   - Go to **Publish** → **Google Play**
   - Fill in app details
   - Submit for review

---

## Common Issues & Solutions

### Issue: Supabase connection fails

**Solution:**
- Verify credentials in FlutterFlow
- Check Supabase project status
- Ensure RLS policies are enabled

### Issue: Authentication not working

**Solution:**
- Check email authentication is enabled
- Verify email confirmation is not required (or check inbox)
- Check browser console for errors

### Issue: Can't save jobs

**Solution:**
- Check user_id field
- Verify RLS policies allow insert
- Check field names match exactly

### Issue: Shadow DOM blocks field typing

**Solution:**
- This is a FlutterFlow limitation
- Design larger touch targets
- Add clear instructions
- Consider using native Flutter for critical forms

### Issue: NHTSA API returns errors

**Solution:**
- Verify VIN is 17 characters
- Check NHTSA API status
- Handle errors gracefully in UI

---

## Next Steps After Integration

1. **Customize UI**
   - Add branding
   - Customize colors
   - Add logo

2. **Add more features**
   - Job status updates
   - Photo upload for AI estimating
   - Export reports
   - Email notifications

3. **Optimize performance**
   - Add loading states
   - Implement pagination for jobs list
   - Add offline support

4. **Monitor usage**
   - Check Supabase usage dashboard
   - Monitor errors in FlutterFlow logs
   - Gather user feedback

---

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **FlutterFlow Docs:** https://docs.flutterflow.io
- **NHTSA API:** https://vpic.nhtsa.dot.gov/api
- **HailForge Portal:** https://vrgs13.github.io/hailforge-portal/

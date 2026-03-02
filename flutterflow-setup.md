# Hail Forge AI - FlutterFlow Setup Guide

## Supabase Connection (Manual Steps)

### Step 1: Get Supabase Credentials
1. Go to: https://supabase.com/dashboard/project/pnplxodtpkasiwguugbj/settings/api
2. Copy **Project URL** and **Anon Key**
3. URLs:
   - URL: `https://pnplxodtpkasiwguugbj.supabase.co`
   - Anon Key: `sb_publishable_pRnfgV2V8E9Zrf9rqvqQ8A_ESBRSW7T`

### Step 2: Create Supabase Tables (Already Done ✅)
Tables already exist:
- `jobs` (id, user_id, vin, customer_name, customer_phone, vehicle, location, notes, status, created_at)
- `profiles` (id, email, full_name, role, shop_name, phone)

### Step 3: Add RLS Policies (Already Done ✅)
Row Level Security is already enabled on both tables.

### Step 4: Connect FlutterFlow to Supabase
1. Open FlutterFlow project: "Forge AI"
2. Go to **Settings** → **Add Firebase/Supabase**
3. Select **Supabase**
4. Enter credentials:
   - Project URL: `https://pnplxodtpkasiwguugbj.supabase.co`
   - Anon Key: `sb_publishable_pRnfgV2V8E9Zrf9rqvqQ8A_ESBRSW7T`
5. Click **Connect**
6. Select tables to connect:
   - ✅ Select `jobs`
   - ✅ Select `profiles`
7. Click **Finish**

### Step 5: Create Auth
1. In FlutterFlow, go to **Settings** → **Authentication**
2. Select **Supabase**
3. Click **Add Provider** → **Email/Password**
4. Click **Create**
5. Test login/signup

---

## App Features to Build

### 1. VIN Decode (Reuse Portal Code)
**Location:** `portal/app.js` → `decodeVIN()` function (lines 230-284)

**Use same NHTSA API:**
```
https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{VIN}?format=json
```

**FlutterFlow Implementation:**
1. Add Text Input for VIN
2. Add Button "Decode VIN"
3. Use **FlutterFlow API** to call NHTSA endpoint
4. Display results in Text area

---

### 2. Photo Upload with AI Dent Analysis

#### Option A: Use FlutterFlow's Built-in ML Kit
1. Go to **Add Element** → **Media** → **Image Picker**
2. Add **Image Picker** component
3. Go to **Add Element** → **Media** → **Image**
4. Bind the selected image to the display
5. Add **ML Kit** → **Image Labeling** widget
6. Configure to detect objects (cars, dents, damage)

#### Option B: Custom AI API (Recommended)
Use OpenAI Vision API or Google Cloud Vision for better accuracy.

**Example Implementation:**
```javascript
// In FlutterFlow Custom Code
async function analyzeImage(imageBase64) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer YOUR_OPENAI_API_KEY`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Count and estimate the size of dents in this hail damage photo. Return JSON format: {"dent_count": number, "estimated_size_cm": number, "severity": "low/medium/high"}' },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

---

### 3. Job Tracking Screen

**Supabase Query:**
```
SELECT * FROM jobs
WHERE user_id = '{currentUser.id}'
ORDER BY created_at DESC
```

**In FlutterFlow:**
1. Add **Supabase Query** widget
2. Select table: `jobs`
3. Filter: `user_id` = `currentUser.id`
4. Order: `created_at DESC`
5. Bind to List widget

---

### 4. Create Job Screen

**Supabase Insert:**
```javascript
// FlutterFlow Custom Code
async function createJob(vin, customer, phone, vehicle, location, notes) {
  const response = await supabaseClient
    .from('jobs')
    .insert({
      user_id: currentUser.id,
      vin: vin.toUpperCase(),
      customer_name: customer,
      customer_phone: phone,
      vehicle: vehicle,
      location: location,
      notes: notes,
      status: 'pending'
    })
    .select()
    .single();

  if (response.error) {
    console.error('Error creating job:', response.error);
    return false;
  }

  return true;
}
```

---

## App Structure

```
Hail Forge AI App
├── Landing Page
│   ├── Logo
│   ├── Tagline: "Revolutionize Your Estimating"
│   ├── Buttons: Login / Sign Up
│   └── Features: Track Effortlessly, Analyze Intelligently, Maximize Profits
├── Auth Pages
│   ├── Login
│   └── Sign Up
├── Main App
│   ├── Dashboard (Job List)
│   ├── New Job
│   │   ├── VIN Input + Decode Button
│   │   ├── Customer Info
│   │   ├── Vehicle Info
│   │   ├── Photo Upload + AI Analysis
│   │   └── Notes
│   └── Profile
└── Job Detail
    ├── VIN
    ├── Vehicle
    ├── Customer
    ├── Photos
    ├── Notes
    └── Status
```

---

## Deployment Steps

### Step 1: Build for iOS
1. Go to **Build** → **iOS**
2. Click **Build App**
3. Wait for build to complete
4. Download `.ipa` file

### Step 2: Build for Android
1. Go to **Build** → **Android**
2. Click **Build App**
3. Wait for build to complete
4. Download `.apk` file

### Step 3: Test
1. Install on iPhone simulator
2. Test login/signup
3. Test VIN decode
4. Test photo upload
5. Test job creation

### Step 4: App Store Submission
**iOS:**
1. Go to **Build** → **iOS**
2. Click **App Store**
3. Fill in app details
4. Upload binary

**Android:**
1. Go to **Build** → **Android**
2. Click **Play Store**
3. Fill in app details
4. Upload APK

---

## Photo Upload with AI Analysis (Detailed)

### FlutterFlow Implementation

#### Widget 1: Image Picker
- **Widget:** Image Picker
- **On Image Selected:** Call `analyzeImage()`

#### Widget 2: Image Display
- **Widget:** Image
- **Source:** Selected Image from Picker

#### Widget 3: Analysis Button
- **Widget:** Button
- **On Click:** Call `analyzeImage()`

#### Widget 4: Analysis Result
- **Widget:** Text
- **Text:** `{{analysisResult}}`

### Custom Code (FlutterFlow Code Editor)

```javascript
import 'dart:convert';

async function analyzeImage(imageData) {
  // Convert FlutterFlow image to base64
  const base64Image = 'data:image/jpeg;base64,' + imageData;

  // Call OpenAI Vision API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-your-openai-api-key'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this hail damage photo. Count the number of dents and estimate their size in cm. Return JSON only: {"dent_count": number, "estimated_size_cm": number, "severity": "low/medium/high"}' },
            { type: 'image_url', image_url: { url: base64Image } }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error('AI analysis failed');
  }

  const data = await response.json();
  const resultText = data.choices[0].message.content;

  // Parse JSON response
  try {
    const result = JSON.parse(resultText);
    return `Dent Count: ${result.dent_count}\nEstimated Size: ${result.estimated_size_cm} cm\nSeverity: ${result.severity}`;
  } catch (e) {
    return resultText;
  }
}
```

### Alternative: Use Google Cloud Vision

If you prefer Google, use this API:

```javascript
async function analyzeImage(imageData) {
  const base64Image = imageData.split(',')[1]; // Remove data:image/jpeg;base64, prefix

  const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=YOUR_GOOGLE_CLOUD_VISION_API_KEY', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            { type: 'OBJECT_LOCALIZATION' },
            { type: 'DETECT_LABELS' }
          ]
        }
      ]
    })
  });

  const data = await response.json();
  // Parse and display results
  return data.responses[0].labelAnnotations;
}
```

---

## Testing Checklist

- [ ] Login/Signup works
- [ ] VIN decode shows correct vehicle info
- [ ] Photo upload displays image
- [ ] AI analysis returns results
- [ ] Job creates in Supabase
- [ ] Job list shows in dashboard
- [ ] Logout works

---

## Next Steps (When You Return)

1. Build the app structure in FlutterFlow
2. Add VIN decode feature
3. Add photo upload with AI analysis
4. Connect to Supabase
5. Test and deploy

**Estimated Time:** 2-3 hours to complete basic version

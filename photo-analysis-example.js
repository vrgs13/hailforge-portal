// Photo Upload with AI Dent Analysis - Example Implementation

/**
 * Analyze hail damage photo using OpenAI Vision API
 * @param {string} imageData - Base64 encoded image (with data URL prefix)
 * @returns {Promise<Object>} - Analysis result with dent count, size, and severity
 */
async function analyzeHailDamage(imageData) {
  try {
    // Remove data URL prefix if present
    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this hail damage photo. Count the number of dents and estimate their size in cm. Also assess the severity: low (small dents < 2cm), medium (2-5cm), or high (5cm+). Return ONLY valid JSON format:
{
  "dent_count": number,
  "estimated_size_cm": number,
  "severity": "low|medium|high",
  "description": "brief description of damage"
}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'AI analysis failed');
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content.trim();

    // Parse JSON response
    const result = JSON.parse(resultText);

    return {
      success: true,
      data: result,
      rawText: resultText
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      rawText: null
    };
  }
}

/**
 * Upload photo to Supabase Storage (optional - for storing images)
 * @param {string} imageData - Base64 encoded image
 * @param {string} userId - Current user ID
 * @param {string} jobId - Job ID (if updating existing job)
 * @returns {Promise<Object>} - Upload result
 */
async function uploadPhoto(imageData, userId, jobId = null) {
  try {
    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const timestamp = Date.now();
    const fileName = jobId
      ? `jobs/${jobId}/photos/${timestamp}.jpg`
      : `temp/${userId}/photo_${timestamp}.jpg`;

    const { data, error } = await supabase.storage
      .from('hail-forge-photos')
      .upload(fileName, base64Image, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('hail-forge-photos')
      .getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrl,
      fileName: fileName
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get job photos from Supabase Storage
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} - Array of photo URLs
 */
async function getJobPhotos(jobId) {
  try {
    const { data, error } = await supabase
      .storage
      .from('hail-forge-photos')
      .list(`jobs/${jobId}/photos`);

    if (error) throw error;

    const urls = data.map(photo => {
      const { data: { publicUrl } } = supabase.storage
        .from('hail-forge-photos')
        .getPublicUrl(`jobs/${jobId}/photos/${photo.name}`);
      return publicUrl;
    });

    return {
      success: true,
      urls: urls
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      urls: []
    };
  }
}

// ==================== UI Component Code ====================

/**
 * HTML for photo upload component
 */
const photoUploadComponent = `
<div class="photo-upload-section">
  <h3>Photo Analysis</h3>

  <!-- Upload Button -->
  <div class="upload-area">
    <input type="file" id="photo-input" accept="image/*" capture="environment">
    <button id="analyze-btn" class="btn btn-primary">Analyze Photo</button>
  </div>

  <!-- Image Preview -->
  <div id="image-preview" class="image-preview hidden">
    <img id="preview-img" src="" alt="Hail Damage Photo">
  </div>

  <!-- Analysis Results -->
  <div id="analysis-results" class="analysis-results hidden">
    <h4>Analysis Results</h4>
    <div id="results-content"></div>
  </div>

  <!-- Loading State -->
  <div id="loading" class="loading hidden">
    <div class="spinner"></div>
    <p>Analyzing photo with AI...</p>
  </div>
</div>
`;

/**
 * CSS for photo upload component
 */
const photoUploadStyles = `
.photo-upload-section {
  margin: 20px 0;
  padding: 20px;
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--surface-light);
}

.photo-upload-section h3 {
  margin-bottom: 15px;
  color: var(--primary);
}

.upload-area {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.upload-area input[type="file"] {
  flex: 1;
  padding: 12px;
  background: var(--background);
  border: 1px solid var(--surface-light);
  border-radius: 8px;
  color: var(--text);
}

.image-preview {
  margin: 15px 0;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  border: 1px solid var(--surface-light);
}

.analysis-results {
  margin: 15px 0;
  padding: 15px;
  background: var(--background);
  border-radius: 8px;
  border: 1px solid var(--surface-light);
}

.analysis-results h4 {
  margin-bottom: 10px;
  color: var(--text-muted);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--surface-light);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.hidden {
  display: none !important;
}
`;

/**
 * JavaScript for photo upload component
 */
const photoUploadScript = `
// Initialize photo upload
document.addEventListener('DOMContentLoaded', function() {
  const photoInput = document.getElementById('photo-input');
  const analyzeBtn = document.getElementById('analyze-btn');
  const previewImg = document.getElementById('preview-img');
  const imagePreview = document.getElementById('image-preview');
  const resultsContent = document.getElementById('results-content');
  const analysisResults = document.getElementById('analysis-results');
  const loading = document.getElementById('loading');

  let currentImageData = null;

  // Handle photo selection
  photoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        currentImageData = event.target.result;
        previewImg.src = currentImageData;
        imagePreview.classList.remove('hidden');
        resultsContent.innerHTML = '';
        analysisResults.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  // Analyze photo
  analyzeBtn.addEventListener('click', async function() {
    if (!currentImageData) {
      alert('Please select a photo first');
      return;
    }

    // Show loading
    loading.classList.remove('hidden');
    analyzeBtn.disabled = true;

    try {
      const result = await analyzeHailDamage(currentImageData);

      loading.classList.add('hidden');
      analyzeBtn.disabled = false;

      if (result.success) {
        // Display results
        const { dent_count, estimated_size_cm, severity, description } = result.data;

        resultsContent.innerHTML = \`
          <div class="result-item">
            <strong>Dent Count:</strong> <span class="count">\${dent_count}</span>
          </div>
          <div class="result-item">
            <strong>Estimated Size:</strong> <span class="size">\${estimated_size_cm} cm</span>
          </div>
          <div class="result-item">
            <strong>Severity:</strong> <span class="severity severity-\${severity}">\${severity.toUpperCase()}</span>
          </div>
          <div class="result-item">
            <strong>Description:</strong> \${description}
          </div>
        \`;

        analysisResults.classList.remove('hidden');
      } else {
        alert('Analysis failed: ' + result.error);
      }

    } catch (error) {
      loading.classList.add('hidden');
      analyzeBtn.disabled = false;
      alert('Error analyzing photo: ' + error.message);
    }
  });
});
`;

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeHailDamage,
    uploadPhoto,
    getJobPhotos
  };
}

// Initialize if running in browser
if (typeof window !== 'undefined') {
  window.analyzeHailDamage = analyzeHailDamage;
  window.uploadPhoto = uploadPhoto;
  window.getJobPhotos = getJobPhotos;
}
`;

/**
 * Supabase Storage Setup Instructions
 */
const supabaseStorageSetup = `
# Supabase Storage Setup for Photos

## Step 1: Create Storage Bucket

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/pnplxodtpkasiwguugbj
2. Click **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Enter bucket name: \`hail-forge-photos\`
5. Set privacy: **Public**
6. Click **Create bucket**

## Step 2: Add RLS Policies

### Bucket Policies

```sql
-- Allow users to upload photos to their own jobs
CREATE POLICY "Users can upload photos to their own jobs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hail-forge-photos'
  AND auth.uid()::text = (SELECT user_id FROM jobs WHERE jobs.id = (storage.foldername(name))[1])
);

-- Allow users to read photos from their own jobs
CREATE POLICY "Users can read photos from their own jobs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'hail-forge-photos'
  AND auth.uid()::text = (SELECT user_id FROM jobs WHERE jobs.id = (storage.foldername(name))[1])
);

-- Allow admins to manage all photos
CREATE POLICY "Admins can manage all photos"
ON storage.objects FOR ALL
TO authenticated
USING (
  auth.uid()::text IN (SELECT id FROM profiles WHERE role = 'shop_owner')
);
```

## Step 3: Test Upload

1. Open your app
2. Create a job
3. Upload a photo
4. Verify it appears in Storage bucket
5. Check the public URL

## Step 4: Use in Code

\`\`\`javascript
// Upload photo
const result = await uploadPhoto(imageData, userId, jobId);

if (result.success) {
  console.log('Photo uploaded:', result.url);
} else {
  console.error('Upload failed:', result.error);
}
\`\`\`

## Storage Structure

\`\`\`
hail-forge-photos/
├── jobs/
│   ├── {job_id}/
│   │   ├── photos/
│   │   │   ├── {timestamp1}.jpg
│   │   │   └── {timestamp2}.jpg
│   └── {another_job_id}/
│       └── photos/
└── temp/
    └── {user_id}/
        └── photo_{timestamp}.jpg
\`\`\`
`;

// Export for documentation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    photoUploadComponent,
    photoUploadStyles,
    photoUploadScript,
    supabaseStorageSetup
  };
}

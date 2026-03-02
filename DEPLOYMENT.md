# HailForge Portal - Deployment Guide

## Quick Deploy to Netlify (Recommended)

### Option 1: Drag & Drop (Easiest)

1. **Create Netlify account**
   - Go to: https://netlify.com
   - Sign up with GitHub or email

2. **Deploy via Drag & Drop**
   - In Netlify dashboard, click "Add new site" → "Import an existing project"
   - Select "Drag and drop your site folder here"
   - Select the `hailforge-portal` folder from your workspace
   - Click "Deploy site"

3. **Get your site URL**
   - Netlify will give you a URL like: `https://hailforge-portal.netlify.app`
   - This is your temporary URL

4. **Add Custom Domain**
   - In Netlify dashboard, go to "Site settings" → "Domain management"
   - Click "Add custom domain"
   - Enter: `hailforgeai.com`
   - Netlify will show you DNS records to add to GoDaddy

5. **Update DNS at GoDaddy**
   - Login to GoDaddy
   - Go to DNS management
   - Add A record:
     - **Name:** @
     - **Type:** A
     - **Value:** [Netlify provides this]
     - **TTL:** Auto

6. **Wait for SSL**
   - Netlify will automatically set up SSL (HTTPS)
   - Takes 1-5 minutes

7. **Test**
   - Visit: https://hailforgeai.com
   - Should show your portal

---

### Option 2: Netlify CLI (For Developers)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   cd hailforge-portal
   netlify deploy --prod
   ```

4. **Add custom domain**
   ```bash
   netlify domains:add hailforgeai.com
   ```

---

## Alternative: Vercel Deployment

### Option 1: Vercel Dashboard

1. **Create Vercel account**
   - Go to: https://vercel.com
   - Sign up with GitHub

2. **Import project**
   - Click "Add New..." → "Project"
   - Select the `hailforge-portal` folder
   - Click "Deploy"

3. **Add custom domain**
   - Go to "Settings" → "Domains"
   - Add `hailforgeai.com`
   - Update DNS at GoDaddy (CNAME record)

---

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd hailforge-portal
vercel --prod

# Add custom domain
vercel domains add hailforgeai.com
```

---

## GitHub Pages (Free Alternative)

1. **Create repository**
   ```bash
   cd hailforge-portal
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/vrgs13/hailforge-portal.git
   git push -u origin main
   ```

2. **Enable Pages**
   - Go to GitHub repo → Settings → Pages
   - Source: Deploy from branch → `main` / `root`
   - Click "Save"

3. **Wait for deployment**
   - GitHub will give you URL: `https://vrgs13.github.io/hailforge-portal/`

4. **Add custom domain**
   - Go to repo → Settings → Pages
   - Custom domain: `hailforgeai.com`
   - Update DNS at GoDaddy (CNAME record)

---

## Testing After Deployment

### Checklist
- [ ] Portal loads at https://hailforgeai.com
- [ ] Login page works
- [ ] Signup page works
- [ ] Dashboard shows "No jobs yet"
- [ ] Create new job works
- [ ] VIN decode works (NHTSA API)
- [ ] Jobs list updates
- [ ] Logout works
- [ ] Mobile responsive (test on iPhone)

### Test User Flow
1. Open portal
2. Click "Sign Up"
3. Create account (email: test@hailforgeai.com, password: test123)
4. Create a test job with VIN: `1HGCM82633A004352`
5. Check if job appears in jobs list
6. Logout and login again
7. Verify job is still there
8. Delete job
9. Logout completely

---

## Troubleshooting

### Common Issues

**Issue: Portal doesn't load**
- Check if Netlify/Vercel deployment is complete
- Clear browser cache
- Try incognito mode

**Issue: Login fails**
- Check Supabase connection in `app.js`
- Verify Supabase credentials in portal
- Check Supabase project status in dashboard
- Ensure RLS policies are enabled

**Issue: VIN decode doesn't work**
- Check NHTSA API is accessible
- Verify VIN is 17 characters
- Check browser console for errors
- Test with different VIN

**Issue: Custom domain shows 404**
- Verify DNS records are correct
- Wait 5-10 minutes for DNS propagation
- Check if SSL certificate is issued
- Try clearing DNS cache on your device

**Issue: Mobile layout broken**
- Check viewport meta tag in `index.html`
- Test on different devices
- Check CSS responsive breakpoints

---

## Environment Variables (Optional)

If you need to configure environment variables later:

### Netlify
1. Go to Site settings → Environment variables
2. Add variables if needed:
   - `SUPABASE_URL` (if you move from inline config)
   - `SUPABASE_ANON_KEY` (if you move from inline config)

### Vercel
1. Go to Project settings → Environment variables
2. Add variables

### GitHub Pages
- No environment variables needed
- Variables must be in code (current setup)

---

## Current Configuration

### Files
- `index.html` - Main page
- `styles.css` - Styles
- `app.js` - Application logic
- `logo.png` - Logo (if missing, text will show)

### External Dependencies
- Supabase JS SDK: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- Font Awesome (optional, not currently used)

### APIs Used
- Supabase (authentication + database)
- NHTSA VIN Decode API (free, no key needed)

---

## Security Notes

1. **Never commit Supabase keys to public repo**
   - Current setup: Keys are inline in `app.js`
   - If deploying to GitHub Pages, consider:
     - Using environment variables
     - Or keep keys private (not recommended for public site)

2. **Enable Email Confirmation**
   - Go to Supabase Dashboard → Authentication → Providers → Email
   - Enable "Confirm email" to prevent spam accounts

3. **Rate Limiting**
   - Consider adding rate limiting to Supabase
   - Monitor usage in Supabase dashboard

4. **HTTPS**
   - Netlify/Vercel provide free SSL
   - Ensure all API calls use HTTPS

---

## Next Steps After Deployment

1. **Update links**
   - Change portal URL in marketing materials
   - Update website if it links to portal

2. **Monitor**
   - Check Netlify/Vercel analytics
   - Monitor Supabase usage
   - Check for errors in browser console

3. **Backup**
   - Keep code in Git
   - Backup database regularly (Supabase has built-in backups)

4. **Update**
   - Keep dependencies updated
   - Fix bugs as they appear
   - Add features based on user feedback

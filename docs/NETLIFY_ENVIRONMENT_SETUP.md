# 🚀 Netlify Environment Variables Setup

## 🚨 CRITICAL: Environment Variables Required

The deployment is failing because **Supabase environment variables are missing**. You must configure these in the Netlify dashboard.

## 📋 Required Environment Variables

### **In Netlify Dashboard:**

1. **Go to**: Site Settings → Environment Variables
2. **Add these variables**:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://eekajmfvqntbloqgizwk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVla2FqbWZ2cW50YmxvcWdpendrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMjk5NTIsImV4cCI6MjA2MTgwNTk1Mn0.HfR6KwhaWCRcrlavKiY0XUo_SXX2epQNrCV4sya2kl4

# Build Configuration (OPTIONAL - already in netlify.toml)
NODE_VERSION=20
NODE_ENV=production
GENERATE_SOURCEMAP=false
CI=true
NODE_OPTIONS=--max-old-space-size=4096
```

## 🔧 How to Add Environment Variables

### **Method 1: Netlify Dashboard (Recommended)**

1. **Login to Netlify**: https://app.netlify.com
2. **Select your site**: MMU E-Learning
3. **Go to**: Site Settings → Environment Variables
4. **Click**: "Add a variable"
5. **Add each variable**:
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://eekajmfvqntbloqgizwk.supabase.co`
   - Scopes: All scopes
6. **Repeat for**: `VITE_SUPABASE_ANON_KEY`

### **Method 2: Netlify CLI (Alternative)**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Set environment variables
netlify env:set VITE_SUPABASE_URL "https://eekajmfvqntbloqgizwk.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your_anon_key_here"
```

## 🚨 Current Issues Fixed

### **1. Supabase Error:**
```
Uncaught Error: supabaseUrl is required.
```
**Fix**: Add `VITE_SUPABASE_URL` environment variable

### **2. CSP Script Blocking:**
```
Refused to load script 'https://cdn.gpteng.co/gptengineer.js'
```
**Fix**: Updated CSP to allow `cdn.gpteng.co`

### **3. Asset 404 Errors:**
```
GET /assets/index.js net::ERR_ABORTED 404
```
**Fix**: Removed hardcoded asset preload links

### **4. MIME Type Issues:**
```
MIME type ('text/html') is not a supported stylesheet MIME type
```
**Fix**: Removed problematic preload headers

## 🔄 Deployment Steps

### **After Adding Environment Variables:**

1. **Trigger Redeploy**:
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

2. **Monitor Build**:
   - Watch build logs for success
   - Check for environment variable detection

3. **Verify Site**:
   - Test site loading
   - Check browser console for errors
   - Verify Supabase connection

## 🎯 Expected Results

### **After Environment Variables Added:**
- ✅ **Supabase connects** - No more "supabaseUrl required" error
- ✅ **Assets load** - CSS and JS files serve correctly
- ✅ **Scripts allowed** - CSP permits necessary external scripts
- ✅ **Site functional** - Full application works

### **Build Log Should Show:**
```
✓ Environment variables detected:
  - VITE_SUPABASE_URL: https://eekajmfvqntbloqgizwk.supabase.co
  - VITE_SUPABASE_ANON_KEY: [REDACTED]
✓ Build completed successfully
✓ Site deployed
```

## 🔍 Troubleshooting

### **If Site Still Doesn't Load:**

1. **Check Environment Variables**:
   ```bash
   # In Netlify build logs, look for:
   "Environment variables:"
   ```

2. **Clear Browser Cache**:
   - Hard refresh (Ctrl+F5)
   - Clear site data

3. **Check Network Tab**:
   - Verify assets load with 200 status
   - Check for remaining 404 errors

4. **Verify Supabase Connection**:
   - Check browser console
   - Look for authentication errors

## 📞 Support

If issues persist after adding environment variables:

1. **Check build logs** in Netlify dashboard
2. **Verify environment variables** are set correctly
3. **Test locally** with same environment variables
4. **Contact support** with specific error messages

---

**⚠️ IMPORTANT**: The site will not work until environment variables are added to Netlify dashboard!

**Next Step**: Add environment variables → Trigger redeploy → Test site

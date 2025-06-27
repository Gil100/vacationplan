# 🚀 GitHub Pages Deployment Guide

This guide will help you deploy your Hebrew vacation planning website to GitHub Pages.

## 📋 Prerequisites

- [x] Repository pushed to GitHub: https://github.com/Gil100/vacationplan
- [x] Vite configured for GitHub Pages (base: '/vacationplan/')
- [x] GitHub Actions workflow file created
- [x] Production build tested locally

## 🔧 Step-by-Step Deployment

### Step 1: Enable GitHub Pages

1. **Go to your repository settings**
   - Navigate to: https://github.com/Gil100/vacationplan/settings

2. **Find the Pages section**
   - In the left sidebar, scroll down and click on **"Pages"**

3. **Configure the source**
   - Under "Source", select **"GitHub Actions"** 
   - This will use our custom workflow file instead of the basic Jekyll deployment

### Step 2: Verify Repository Settings

1. **Ensure repository is public**
   - GitHub Pages is free for public repositories
   - If private, you need GitHub Pro/Team plan

2. **Check branch protection**
   - Our workflow triggers on pushes to `main` branch
   - Make sure `main` is your default branch

### Step 3: Trigger First Deployment

#### Option A: Push New Changes
```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

#### Option B: Manual Trigger
1. Go to **Actions** tab in your repository
2. Click on **"Deploy Hebrew Vacation Planner to GitHub Pages"**
3. Click **"Run workflow"** button
4. Select `main` branch and click **"Run workflow"**

### Step 4: Monitor Deployment

1. **Check Actions tab**
   - Go to: https://github.com/Gil100/vacationplan/actions
   - You should see the workflow running

2. **Wait for completion**
   - Build process takes ~2-3 minutes
   - Green checkmark = successful deployment
   - Red X = failed deployment (check logs)

### Step 5: Access Your Website

Once deployment succeeds, your website will be available at:

**🌐 https://gil100.github.io/vacationplan/**

## 🎯 Expected Results

After successful deployment, you should see:

- **Hero Section**: Full-screen gradient with Hebrew content
- **Social Proof**: Customer testimonials and statistics
- **Responsive Design**: Works on mobile and desktop
- **Hebrew RTL Support**: Proper right-to-left layout
- **Interactive Elements**: Working buttons and animations

## 🔍 Troubleshooting

### Common Issues

#### 1. Workflow Fails During Build
**Symptom**: Red X in Actions tab, build errors in logs
**Solution**: 
- Check the TypeScript errors in the logs
- Fix any compilation issues locally first
- Test with `npm run build` before pushing

#### 2. Page Shows 404 Error
**Symptom**: GitHub Pages URL shows "404 Page Not Found"
**Solutions**:
- Wait 5-10 minutes after first deployment
- Check if Pages is enabled in repository settings
- Verify the correct URL: https://gil100.github.io/vacationplan/

#### 3. Assets Not Loading Correctly
**Symptom**: Page loads but styling/images are broken
**Solutions**:
- Verify base path in `vite.config.ts` is set to `/vacationplan/`
- Check if all imports use relative paths
- Test production build locally with `npm run preview`

#### 4. Hebrew Fonts Not Loading
**Symptom**: Hebrew text shows in fallback fonts
**Solutions**:
- Check if Google Fonts are accessible
- Verify font loading in production build
- Test with different browsers

### Debug Steps

1. **Check Actions Logs**
   ```
   GitHub Repository → Actions Tab → Latest Workflow → Build Job
   ```

2. **Test Locally**
   ```bash
   npm run build
   npm run preview
   ```

3. **Verify Configuration**
   - Base path: `/vacationplan/`
   - Workflow file: `.github/workflows/deploy.yml`
   - Build output: `dist/` directory

## 🎨 Customization

### Custom Domain (Optional)

1. **Add CNAME file**
   ```bash
   echo "yourdomain.com" > public/CNAME
   ```

2. **Configure DNS**
   - Add CNAME record pointing to `gil100.github.io`
   - Add A records for GitHub Pages IPs

3. **Enable HTTPS**
   - GitHub automatically provides SSL certificates
   - May take 24-48 hours to activate

### Performance Monitoring

Add analytics to track usage:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## 📊 Success Metrics

Your deployment is successful when:

- [ ] Website loads at GitHub Pages URL
- [ ] Hebrew text displays correctly (RTL)
- [ ] All interactive elements work
- [ ] Mobile responsive design functions
- [ ] Loading times are under 3 seconds
- [ ] No console errors in browser

## 🔄 Automatic Updates

The workflow is configured to automatically deploy when you:

1. Push changes to the `main` branch
2. Merge pull requests into `main`
3. Manually trigger the workflow

Every push will:
- Install dependencies
- Build the production version
- Deploy to GitHub Pages
- Update the live website

## 📞 Support

If you encounter issues:

1. Check the **Actions** tab for detailed error logs
2. Compare with working configuration in this repository
3. Test the build process locally before pushing
4. Ensure all dependencies are properly installed

---

🎉 **Congratulations!** Your Hebrew vacation planning website should now be live on GitHub Pages!
# Google Login Setup Guide

## Prerequisites
- Supabase Project (create at https://app.supabase.com)
- Google Cloud Project with OAuth 2.0 credentials

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Go to "APIs & Services" > "OAuth consent screen"
4. Configure the OAuth consent screen (External/Internal)
5. Go to "APIs & Services" > "Credentials"
6. Click "Create Credentials" > "OAuth client ID"
7. Choose "Web application"
8. Add authorized redirect URIs:
   ```
   http://localhost:8080/
   http://localhost:8080/chat
   https://your-domain.com/
   https://your-domain.com/chat
   ```
9. Copy the Client ID and Client Secret

## Step 2: Configure Supabase OAuth Provider

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to "Authentication" > "Providers"
4. Find "Google" and click to expand
5. Enable the provider
6. Paste your Google OAuth Client ID and Client Secret
7. Click "Save"

## Step 3: Configure Frontend Environment Variables

1. Copy `.env.example` to `.env` in `lexa-frontend` folder:
   ```bash
   cp lexa-frontend/.env.example lexa-frontend/.env
   ```

2. Update `lexa-frontend/.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

   To find these values:
   - Go to Supabase Dashboard
   - Select your project
   - Go to "Settings" > "API"
   - Copy the Project URL and Anon Public Key

## Step 4: Test Google Login

1. Start the frontend:
   ```bash
   cd lexa-frontend
   npm run dev
   ```

2. Open http://localhost:8080
3. Click "Continue with Google"
4. You should be redirected to Google sign-in

## Troubleshooting

### Error: "Supabase credentials not configured"
- Check that `.env` file exists in `lexa-frontend` folder
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- Restart the dev server after updating `.env`

### Error: "Google sign in failed"
- Verify Google OAuth credentials are added to Supabase
- Check that authorized redirect URIs include your app URL
- Ensure Google provider is enabled in Supabase Authentication > Providers

### Error: "Invalid OAuth client"
- Verify Client ID and Client Secret are correct in Supabase
- Check that the Google Cloud project has OAuth 2.0 credentials
- Ensure OAuth consent screen is configured

### Redirect URI mismatch
- Add all possible URLs to Google Cloud authorized redirect URIs
- Update the `redirectTo` URL in code if needed
- Must match exactly (including protocol and trailing slash)

## Security Notes

- Never commit `.env` file to version control
- Keep Client Secret secure
- Use HTTPS in production
- Rotate credentials regularly

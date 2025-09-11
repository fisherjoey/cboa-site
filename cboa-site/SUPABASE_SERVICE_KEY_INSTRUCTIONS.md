# Important: Get Your Service Role Key

To complete the backend setup, you need to get your Service Role Key from Supabase:

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon) in the left sidebar
3. Click on **API** under Configuration
4. Find the **service_role** key (this is different from the anon key)
5. Copy it and replace `your_service_role_key_here` in `.env.local`

⚠️ **IMPORTANT**: 
- The service_role key has FULL access to your database
- Never expose it in client-side code
- Only use it in Netlify Functions (server-side)
- Make sure to add it to Netlify's environment variables as well

## Add to Netlify Dashboard:
1. Go to your site in Netlify
2. Site Settings → Environment Variables
3. Add these three variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = https://qrfbkxqhwvftuzotecit.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (the key you provided)
   - `SUPABASE_SERVICE_ROLE_KEY` = (the service role key from Supabase dashboard)
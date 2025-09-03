# Getting Your Supabase API Keys

## Quick Access Link
Go to: https://supabase.com/dashboard/project/xigzapsughpuqjxttsra/settings/api

## What You Need:

### 1. Project URL (Already Set)
```
NEXT_PUBLIC_SUPABASE_URL=https://xigzapsughpuqjxttsra.supabase.co
```

### 2. Anon Public Key
- Location: Under "Project API keys" → "anon public"
- This is safe to expose in frontend code
- Copy and add to `.env` as:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

### 3. Service Role Key
- Location: Under "Project API keys" → "service_role" (click reveal)
- ⚠️ KEEP THIS SECRET - Never expose in frontend
- Copy and add to `.env` as:
```
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

## Update Your .env File
After getting the keys, update `/Users/florian/Desktop/dev/brand-app/.env` with the actual values.

## Test the Setup
Once keys are added, the authentication system will be fully functional!
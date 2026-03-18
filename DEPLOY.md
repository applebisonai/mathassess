# MathAssess Deployment Guide
## How to get your app live — step by step

---

## Step 1: Set up your Supabase database

1. Go to **https://supabase.com** and open your MathAssess project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase-schema.sql` (in this project folder)
5. Copy ALL the text and paste it into the SQL editor
6. Click **Run** (the green button)
7. You should see "Success. No rows returned" — that means it worked!

---

## Step 2: Get your Supabase API keys

1. In your Supabase project, click **Settings** (gear icon, bottom left)
2. Click **API**
3. You'll see two things you need:
   - **Project URL** — looks like `https://xxxxx.supabase.co`
   - **anon public key** — a long string starting with `eyJ...`
4. Copy both of these — you'll need them in Step 4

---

## Step 3: Create your first teacher account

1. In Supabase, click **Authentication** in the left sidebar
2. Click **Users**
3. Click **Invite user** (or **Add user**)
4. Enter your email: **aaatrainnominimum@gmail.com**
5. Set a password
6. Click **Create user**

---

## Step 4: Set up your .env.local file

1. In the project folder, find the file called `.env.local.example`
2. Make a COPY of it and name the copy `.env.local` (no ".example")
3. Open `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://pirqtrtktsqaifnlwiaq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
```

**IMPORTANT:** Never share this file or commit it to GitHub. The .gitignore already protects it.

---

## Step 5: Push to GitHub

Open Terminal (Mac) or Command Prompt (Windows) in the project folder and run:

```bash
git init
git add .
git commit -m "Initial commit: MathAssess platform"
git branch -M main
git remote add origin https://github.com/applebisonai/mathassess.git
git push -u origin main
```

(You'll need to create a repository called `mathassess` on GitHub.com first)

---

## Step 6: Deploy to Vercel

1. Go to **https://vercel.com** and log in with GitHub
2. Click **Add New Project**
3. Find and select your `mathassess` repository
4. **BEFORE clicking Deploy**, click **Environment Variables**
5. Add both environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
6. Click **Deploy**
7. Wait ~2 minutes — Vercel will build and deploy your app
8. You'll get a live URL like `mathassess.vercel.app`

---

## Step 7: Test it!

1. Open your live URL
2. Log in with the teacher account you created in Step 3
3. Add a student
4. Try running a Schedule 2A assessment

---

## Ongoing: How to update the app

Whenever we make changes to the code, you just run:
```bash
git add .
git commit -m "Description of what changed"
git push
```

Vercel automatically detects the push and redeploys in about 2 minutes. No extra steps!

---

## Cost reminder

| Service | Current cost |
|---------|-------------|
| Supabase | $0/month |
| Vercel | $0/month |
| GitHub | $0/month |
| Total | **$0/month** |

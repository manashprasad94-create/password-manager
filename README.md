# 🔐 KeyVault — Encrypted Password Manager

A personal password manager built with React, Vite, Tailwind CSS, and Supabase. All passwords are encrypted locally in your browser using AES-256 before being stored in the database — meaning even if the database is breached, your passwords are safe.

---

## ✨ Features

- 🔐 AES-256 encrypted password storage (zero-knowledge)
- 🔢 6-digit PIN vault lock (PIN never stored on any server)
- 🔍 Search by site name, username or tags
- 🏷️ Categories & tags for organization
- 💪 Live password strength meter
- ⚙️ Built-in password generator
- 🕐 Last changed timestamp tracking
- 📋 Copy to clipboard (auto-clears after 30 seconds)
- 👁️ Reveal password (auto-hides after 15 seconds)
- 📱 Works on mobile — add to home screen for app-like experience

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Database + Auth | Supabase (PostgreSQL) |
| Encryption | crypto-js (AES-256) |
| Routing | React Router DOM |
| Icons | Lucide React |
| Hosting | Vercel (free) |

---

## 📋 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org) v18 or higher
- npm (comes with Node.js)
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deployment only)

---

## 🚀 Getting Started

### Step 1 — Clone the repository

```bash
git clone https://github.com/YOURUSERNAME/password-manager.git
cd password-manager
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Set your region to the one closest to you
3. Once the project is ready, go to the **SQL Editor** in the left sidebar
4. Click **New Query**, paste the SQL below, and click **Run**:

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Create the main vault table
create table vault_entries (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references auth.users(id) on delete cascade not null,
  site_name           text not null,
  site_url            text,
  username            text not null,
  encrypted_password  text not null,
  iv                  text not null,
  category            text default 'Other',
  tags                text[] default '{}',
  strength_score      int default 0,
  last_changed        timestamptz default now(),
  created_at          timestamptz default now()
);

-- Auto-update last_changed when password is edited
create or replace function update_last_changed()
returns trigger as $$
begin
  if new.encrypted_password <> old.encrypted_password then
    new.last_changed = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_last_changed
before update on vault_entries
for each row execute function update_last_changed();

-- Row Level Security
alter table vault_entries enable row level security;

create policy "Users can only access their own entries"
on vault_entries
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

5. Go to **Authentication → Providers → Email** and turn **OFF** "Confirm email" for easier local testing
6. Go to **Project Settings → API** and copy:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon / public key** (the long JWT string)

### Step 4 — Set up environment variables

Create a `.env` file in the root of the project:

```bash
cp .env.example .env
```

Or create it manually and add:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

> ⚠️ Never commit your `.env` file to GitHub. It is already listed in `.gitignore`.

### Step 5 — Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗂️ Project Structure

```
password-manager/
├── src/
│   ├── pages/
│   │   ├── Login.jsx           # Email/password login screen
│   │   ├── PinVerify.jsx       # 6-digit PIN screen
│   │   └── Dashboard.jsx       # Main vault screen
│   ├── components/
│   │   ├── PasswordCard.jsx    # Individual password entry card
│   │   ├── AddPassword.jsx     # Add / edit password form
│   │   ├── SearchBar.jsx       # Search input
│   │   ├── CategoryFilter.jsx  # Category filter bar
│   │   ├── PasswordGenerator.jsx # Password generator modal
│   │   └── StrengthMeter.jsx   # Password strength bar
│   ├── lib/
│   │   ├── crypto.js           # AES-256 encrypt / decrypt
│   │   ├── supabase.js         # Supabase client
│   │   └── passwordUtils.js    # Strength checker, generator, categories
│   ├── App.jsx                 # Routes
│   └── index.css               # Tailwind import
├── .env                        # Your secret keys (never commit this)
├── .env.example                # Template for env variables
├── vite.config.js
└── package.json
```

---

## 🔐 How Encryption Works

```
Your PIN  →  PBKDF2 (10,000 iterations)  →  256-bit AES Key
                                                    ↓
                                         Random IV generated
                                                    ↓
                                     Password encrypted in browser
                                                    ↓
                                    Only ciphertext sent to Supabase
```

- The PIN is **never stored** anywhere
- The encryption key is **never sent** to any server
- It only lives in your browser memory for the current session
- Supabase only ever stores scrambled ciphertext — useless without your PIN

---

## 📱 Using on Mobile

Once deployed to Vercel:

- **iPhone** → Open in Safari → Tap Share → "Add to Home Screen"
- **Android** → Open in Chrome → Tap menu → "Add to Home Screen"

The app will behave like a native app on your phone.

---

## 🌐 Deploying to Vercel

1. Push your code to a **private** GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"** and import your repository
4. Add your environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**
6. Once deployed, go to Supabase → **Authentication → URL Configuration** and update:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**` and `http://localhost:5173/**`

### Updating the app after changes

```bash
git add .
git commit -m "your change description"
git push
```

Vercel automatically redeploys on every push to `main`.

---

## 🔑 First Time Usage

1. Open the app and click **"Sign up"** to create your account
2. Log in with your email and password
3. You'll be taken to the **PIN screen** — set a 6-digit PIN
4. This PIN is your encryption key — **never forget it**, there is no recovery
5. Start adding your passwords!

---

## ⚠️ Important Security Notes

- **Do not forget your PIN** — there is no recovery mechanism by design. If you forget it, your encrypted passwords cannot be recovered.
- **Do not expose your `service_role` key** — only use the `anon` key in the frontend.
- Keep your repository **private** on GitHub.
- The `anon` key is safe to use in frontend code because Supabase Row Level Security (RLS) ensures users can only access their own data.

---

## 📦 Available Scripts

```bash
npm run dev      # Start development server at localhost:5173
npm run build    # Build for production
npm run preview  # Preview the production build locally
```

---

## 🤝 Contributing

This is a personal project but feel free to fork it and make it your own. If you find a bug or have a suggestion, open an issue or a pull request.

---

## 📄 License

MIT — free to use, modify and distribute.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

```

# 🎵 Music Streaming API (Backend)

This is the **backend service** of the Music Streaming App.  
It is built with **Next.js API Routes**, **Prisma**, and **Supabase** for Postgres database + object storage.  

The backend provides REST API endpoints for artists, albums, playlists, authentication, profile, search, and discovery.  
It also handles authentication (JWT + bcrypt) and integrates with Supabase storage for media files.  

---

## ⚡ Tech Stack

- **Framework:** Next.js (API routes)  
- **Database:** Supabase Postgres  
- **ORM:** Prisma  
- **Storage:** Supabase Storage (audio, images, avatars)  
- **Auth:** JWT + bcrypt  

---

## 📂 Project Structure

music-streaming-api/
├── app/api/ # API routes (artist, auth, discover, lyrics, playlist, profile, search)
├── lib/prisma.ts # Prisma client
├── prisma/schema.prisma # Database schema
└── middleware/ # Authentication & validation middleware

yaml
Copy code

---

## 🗄️ Environment Variables

Create a `.env` file in the project root with:

```env
# Supabase Database (connection pooling)
DATABASE_URL="postgresql://USER:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection for Prisma migrations
DIRECT_URL="postgresql://USER:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"

# JWT secret for auth
JWT_SECRET="your-secret-key"
🛠️ Local Development
1. Install dependencies
bash
Copy code
cd music-streaming-api
npm install
2. Setup environment
Create .env with the required variables above.

3. Run database migrations
bash
Copy code
npx prisma generate
npx prisma db push        # or: npx prisma migrate deploy
4. Start development server
bash
Copy code
npm run dev
Backend will start on http://localhost:3000 by default.
(If running alongside the frontend, you may want to use another port like 3001.)

📌 API Endpoints
Endpoint	Method	Description
/api/auth/register	POST	Register a new user
/api/auth/login	POST	Login & receive JWT
/api/artist	GET	List artists
/api/artist/[artist_id]	GET	Artist details
/api/artist/[artist_id]/[album_id]	GET	Album details
/api/discover	GET	Discovery home
/api/discover/[genre_id]	GET	Discover by genre
/api/lyrics	GET	Fetch lyrics
/api/playlist	GET/POST	Manage playlists
/api/playlist/[playlist_id]	GET	Playlist details
/api/profile	GET	User profile (protected)
/api/search	GET	Search across resources

🚀 Deployment
Backend is deployed on Vercel.

Use Vercel dashboard to set environment variables securely.

Prisma migrations should be run before deploying.

🔮 Notes
Configure Supabase RLS policies for database security.

Set proper bucket permissions for media uploads.

For production, ensure JWT_SECRET is strong and not checked into version control.
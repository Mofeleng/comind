# CoMind

**CoMind** is an **AI-powered meeting platform** that enables users to **create, manage, and interact with custom conversational agents** in real time.
It seamlessly integrates the **Stream SDK** for live communication and the **OpenAI Realtime API** for dynamic reasoning — optimized for collaborative, intelligent meeting environments.

---

## Tech Stack

| Layer             | Technology                                                                                                        | Purpose                                      |
| :---------------- | :---------------------------------------------------------------------------------------------------------------- | :------------------------------------------- |
| **Framework**     | [Next.js 15.3.2](https://nextjs.org/)                                                                             | App Router, edge-optimized rendering         |
| **UI / Styling**  | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui 2.5.0](https://ui.shadcn.com/)                              | Modern, accessible component system          |
| **AI / Realtime** | [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)                                           | Live agent reasoning and streaming responses |
| **Communication** | [Stream SDK](https://getstream.io/)                                                                               | Real-time voice and data synchronization     |
| **Auth**          | [Better Auth](https://better-auth.com/)                                                                           | Secure multi-provider authentication         |
| **Database**      | [NeonDB](https://neon.tech/) + [Postgres](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/) | Persistent user, agent, and session data     |

---

## ⚙️ Setup Guide

### 1️⃣ Clone the Repository

```
git clone https://github.com/yourusername/comind.git
cd comind
```

### 2️⃣ Install Dependencies

```
npm install --legacy-peer-deps
```

> **Note:**
> If you’re developing locally, replace the `dev:webhook` script in `package.json` with your **static ngrok URL** for webhook testing.

---

### 3️⃣ Configure Environment Variables

Create a `.env` file in the project root and include the following:

```
# Database
DATABASE_URL= # NeonDB connection string

# Authentication (Better Auth)
BETTER_AUTH_SECRET= # Secret key
BETTER_AUTH_URL= # Base URL for your auth setup

# OAuth Providers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App URLs
NEXT_PUBLIC_APP_URL= # Your deployed app or local URL (must match BETTER_AUTH_URL)

# Stream (Chat + Video)
NEXT_PUBLIC_STREAM_VIDEO_API_KEY= # GetStream.io video API key
STREAM_VIDEO_API_SECRET= # GetStream.io video API secret
NEXT_PUBLIC_STREAM_CHAT_API_KEY= # Usually same as NEXT_PUBLIC_STREAM_VIDEO_API_KEY
STREAM_CHAT_SECRET_KEY= # Usually same as STREAM_VIDEO_API_SECRET

# OpenAI
OPENAI_API_KEY= # OpenAI API key

# Polar (optional)
POLAR_ACCESS_TOKEN= # Polar.sh access token for funding integration
```

---

### 4️⃣ Start the Development Server

```
npm run dev
```

Your development environment will be available at:

```
http://localhost:3000
```

---

## 🧩 Key Features

* 🔁 **Realtime AI Collaboration:** Interactive agent reasoning with OpenAI Realtime API
* 🎙️ **Voice & Video Integration:** Seamless communication using Stream SDK
* 🔐 **Secure Auth System:** Multi-provider login via Better Auth
* 🗄️ **Robust Data Layer:** Scalable and efficient Postgres setup via Drizzle ORM
* ⚡ **Edge-Ready Architecture:** Built on Next.js 15 for performance and scalability

---

## 🧪 Development Notes

* Ensure **ngrok** or similar tunneling service is active for webhook testing in local environments.
* When deploying to production, make sure all environment variables are configured in your hosting provider (e.g., Vercel, Railway, etc.).
* Use `npm run lint` and `npm run build` before pushing to ensure code consistency and stability.

---

## 🤝 Contributing

Contributions are welcome!
To get started:

```
# Fork the repository
# Create a new branch
git checkout -b feature/your-feature-name

# Commit your changes
git commit -m "feat: add your feature"

# Push to your fork
git push origin feature/your-feature-name
```

Then open a **Pull Request** 🚀

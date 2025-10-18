# 🧠 CoMind

**CoMind** is an AI-powered meeting tool that lets users create and interact with custom conversational agents in real time.  
It integrates the **Stream SDK** for communication and **OpenAI Realtime API** for live reasoning and responses — designed for collaborative, dynamic meeting environments.

---

## 🚀 Tech Stack

| Layer | Tech | Purpose |
|-------|------|----------|
| Framework | **Next.js 15.3.2** | App router, edge-ready rendering |
| UI / Styling | **Tailwind CSS + shadcn/ui 2.5.0** | Modern, accessible component library |
| AI / Realtime | **OpenAI Realtime API** | Agent reasoning + streaming responses |
| Communication | **Stream SDK** | Real-time voice & data channels |
| Auth | **Better Auth** | Secure multi-user authentication |
| DB | **Neon DB + Postgres + Drizzle ORM** | Persistent user, agent, and session data |

---

## ⚙️ Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/comind.git
cd comind

# 2. Install dependencies
npm install --legacy-peer-deps

#3. Environment variables
DATABASE_URL= #your db url
#better auth setup variables
BETTER_AUTH_SECRET= #your better auth secret
BETTER_AUTH_URL= #your better auth url

#better auth oAuth providers
GITHUB_CLIENT_ID= #your github client id
GITHUB_CLIENT_SECRET= #your github client secret
GOOGLE_CLIENT_ID= #your google client id
GOOGLE_CLIENT_SECRET= #your google client secret

# 3. Run the dev server
npm run dev

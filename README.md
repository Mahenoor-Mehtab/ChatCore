<div align="center">

# ChatCore

**ChatCore is the support infrastructure layer for B2B products.**

One embed script gives your customers AI chat, voice, and instant answers from your own documentation — with seamless escalation to your team.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Convex](https://img.shields.io/badge/Convex-Backend-EE342F)
![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?logo=turborepo&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)

</div>

> [!NOTE]
> This project is under active development. Features and setup steps may change as the platform evolves.

---

## Overview

Support teams drown in repetitive questions. The answers already exist — buried in help docs, onboarding guides, and old tickets — but customers can't find them and agents keep retyping them.

ChatCore closes that gap. Businesses upload their documentation once, and an AI agent answers customer questions in real time using that content as its source of truth. When the AI can't resolve something, the conversation escalates to a human operator with full context attached.

The whole thing ships as a single embeddable widget, backed by a multi-tenant dashboard where teams manage conversations, knowledge, and billing.

---

## Features

**Conversations**
- 💬 Real-time AI chat powered by Convex Agents
- 🔊 Voice support with Vapi — customers can talk instead of type
- 📣 Human handoff when the AI hits its limit, with full conversation context
- ✅ Auto-close for resolved threads
- ♾️ Infinite scroll across conversation history

**Intelligence**
- 🧠 Knowledge base built on document embeddings
- 🔍 RAG-grounded answers — no hallucinated policies or made-up refunds
- 🛠️ AI tool calling for escalation, resolution, and search
- 🔄 Pluggable model support: OpenAI, Anthropic, and Grok

**Platform**
- 🧩 Embeddable widget — one script tag, any website
- 📊 Operator dashboard for managing live conversations
- 👥 Organizations and team management
- 🔐 Authentication with Clerk
- 💳 Subscription billing and plan gating
- 🎨 Customizable widget appearance per organization

**Infrastructure**
- 🔑 Customer API keys stored in AWS Secrets Manager
- 🪵 Error tracking and performance monitoring with Sentry
- 📦 Turborepo monorepo with shared UI and config packages
- 🌓 Light and dark theme support

---

## Tech Stack

| Tool | Role |
|---|---|
| **Next.js 15** | App framework for the dashboard and widget, using the App Router |
| **React 19** | UI layer |
| **TypeScript** | Type safety across every app and package |
| **Convex** | Realtime database, server functions, and AI agent runtime |
| **Convex Agents** | Orchestrates AI conversations, tool calls, and message threads |
| **Clerk** | Authentication, organizations, team management, and billing |
| **Vapi** | Voice AI — speech-to-text, text-to-speech, and call handling |
| **AWS Secrets Manager** | Encrypted storage for tenant API credentials |
| **Turborepo** | Monorepo task orchestration and build caching |
| **Tailwind CSS v4** | Styling |
| **shadcn/ui** | Component primitives, shared through the UI package |
| **Sentry** | Error tracking and performance monitoring |
| **pnpm** | Package manager and workspace linking |

---

## Architecture

```
chatcore/
├── apps/
│   ├── web/                  # Operator dashboard — conversations, knowledge base, settings
│   ├── widget/               # Embeddable customer-facing chat + voice widget
│   └── embed/                # Loader script that injects the widget into customer sites
│
├── packages/
│   ├── backend/              # Convex schema, queries, mutations, actions, and AI agents
│   ├── ui/                   # Shared shadcn/ui components, styles, and Tailwind config
│   ├── eslint-config/        # Shared lint rules
│   └── typescript-config/    # Shared tsconfig presets
│
├── turbo.json                # Task pipeline definitions
├── pnpm-workspace.yaml       # Workspace package globs
└── package.json              # Root scripts and dev dependencies
```

**Apps** are deployable surfaces. `web` is what your team logs into. `widget` is what your customers see. `embed` is the tiny script that puts the widget on someone else's website.

**Packages** are internal — never published to npm. They're symlinked into the apps by pnpm and imported by name, like `@workspace/ui/components/button`. The UI package exports raw TypeScript, so Next.js compiles it just-in-time via `transpilePackages` — no build step, no `dist/` folder.

Turborepo reads the dependency graph straight from each `package.json`, so when `backend` changes, only the apps that depend on it get rebuilt.

---

## How It Works

The clearest way to understand the codebase is to follow a single customer question through it.

```
  Customer's website
        │
        │  1. embed.js loads the widget in an iframe
        ▼
  apps/embed  ──────────►  apps/widget
                                │
                                │  2. customer types or speaks a question
                                ▼
                          packages/backend  (Convex)
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
              3. embed      4. search    5. AI agent
                 question      knowledge    drafts answer
                               base (RAG)   + calls tools
                                                │
                          ┌─────────────────────┴──────────────────┐
                          │                                        │
                    resolved?                               needs a human?
                          │                                        │
                          ▼                                        ▼
                6. answer streams back                   7. escalate → shows up in
                   to the widget                            apps/web operator inbox
```

**What lives where**

| Path | Responsibility |
|---|---|
| `apps/embed` | Loader script. Reads the organization ID, injects the iframe, handles resize messaging. |
| `apps/widget` | Customer-facing UI. Screen router, chat thread, voice call controls, session handling. |
| `apps/web` | Operator dashboard. Inbox, conversation view, knowledge base uploads, widget settings, billing. |
| `packages/backend/convex/schema.ts` | Database tables — conversations, messages, contacts, organizations, documents. |
| `packages/backend/convex/` | Queries, mutations, and actions. All business logic and AI agent definitions live here. |
| `packages/ui` | Shared components consumed by both `web` and `widget`, keeping the two visually consistent. |

**The one rule worth remembering:** anything touching data lives in `packages/backend`. The apps only render and call. That's why the widget and dashboard can show the same conversation updating live without either one knowing the other exists — Convex pushes the change to both.

---

## Embedding the Widget

Customers add ChatCore to their site with a single script tag, placed just before the closing `</body>`:

```html
<script
  src="https://your-widget-domain.com/embed.js"
  data-organization-id="org_xxxxxxxxxxxxx"
  defer
></script>
```

| Attribute | Description |
|---|---|
| `src` | URL of your deployed embed script |
| `data-organization-id` | Organization ID from Dashboard → Settings → Integrations |
| `defer` | Loads without blocking page render |

The script injects a sandboxed iframe, so the widget's styles never leak into the host page and the host page's CSS never breaks the widget. Appearance, greeting message, and voice settings are pulled from that organization's configuration at load time — no code changes needed to update them.

---

## Prerequisites

Before you start, make sure you have:

- **Node.js 20 or later**
- **pnpm 9 or later** — install with `npm install -g pnpm`
- **Git**

And accounts on these services (all have free tiers):

| Service | Needed for |
|---|---|
| [Convex](https://convex.dev) | Database, server functions, AI agents |
| [Clerk](https://clerk.com) | Auth, organizations, billing |
| [OpenAI](https://platform.openai.com) | Chat completions and embeddings |
| [Vapi](https://vapi.ai) | Voice assistant |
| [AWS](https://aws.amazon.com) | Secrets Manager for tenant credentials |
| [Sentry](https://sentry.io) | Error tracking *(optional)* |

---

## Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/your-username/chatcore.git
cd chatcore
```

**2. Install dependencies**

```bash
pnpm install
```

This installs everything and links the internal packages across the workspace.

**3. Set up environment variables**

Each app reads its own `.env.local`. Copy the examples:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/widget/.env.example apps/widget/.env.local
cp packages/backend/.env.example packages/backend/.env.local
```

Fill them in using the [Environment Variables](#environment-variables) table below.

**4. Initialize Convex**

```bash
cd packages/backend
pnpm dlx convex dev
```

On first run this creates your Convex project, pushes the schema, and prints your deployment URL. Copy that URL into `NEXT_PUBLIC_CONVEX_URL`. Leave this process running — it watches for backend changes.

**5. Configure Clerk**

In the Clerk dashboard:
- Enable **Organizations** under Configure → Organizations
- Create a **JWT template** named `convex` and copy its issuer domain
- Set up your billing plans if you want subscription gating

**6. Start the dev servers**

From the repo root, in a new terminal:

```bash
pnpm dev
```

Turborepo boots every app in parallel:

| App | URL |
|---|---|
| Dashboard | http://localhost:3000 |
| Widget | http://localhost:3001 |

---

## Environment Variables

### `packages/backend/.env.local`

| Variable | Where to get it | Required |
|---|---|---|
| `CONVEX_DEPLOYMENT` | Auto-generated by `convex dev` | ✅ |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk → JWT Templates → `convex` | ✅ |
| `OPENAI_API_KEY` | OpenAI → API Keys | ✅ |
| `AWS_ACCESS_KEY_ID` | AWS IAM → Users → Security credentials | ✅ |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM → Users → Security credentials | ✅ |
| `AWS_REGION` | Your Secrets Manager region, e.g. `ap-south-1` | ✅ |
| `VAPI_API_KEY` | Vapi → Dashboard → API Keys (private key) | ✅ |

### `apps/web/.env.local`

| Variable | Where to get it | Required |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Printed by `convex dev` | ✅ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API Keys | ✅ |
| `CLERK_SECRET_KEY` | Clerk → API Keys | ✅ |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` in development | ✅ |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry → Project Settings → Client Keys | ⬜ |
| `SENTRY_AUTH_TOKEN` | Sentry → Auth Tokens | ⬜ |

### `apps/widget/.env.local`

| Variable | Where to get it | Required |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Same as above | ✅ |
| `NEXT_PUBLIC_VAPI_API_KEY` | Vapi → Dashboard → API Keys (public key) | ✅ |

> [!WARNING]
> Never commit `.env.local` files. Only `NEXT_PUBLIC_*` variables reach the browser — everything else must stay server-side.

---

## Deployment

### Convex backend

```bash
cd packages/backend
pnpm dlx convex deploy
```

Then set your production environment variables in the Convex dashboard under Settings → Environment Variables. The values are the same ones from `packages/backend/.env.local`, but pointing at production credentials.

### Next.js apps on Vercel

Each app deploys as its own Vercel project from the same repository.

**Dashboard**

| Setting | Value |
|---|---|
| Root Directory | `apps/web` |
| Build Command | `cd ../.. && pnpm turbo build --filter=web` |
| Install Command | `pnpm install` |

**Widget**

| Setting | Value |
|---|---|
| Root Directory | `apps/widget` |
| Build Command | `cd ../.. && pnpm turbo build --filter=widget` |
| Install Command | `pnpm install` |

Add each app's environment variables in Vercel → Settings → Environment Variables, swapping the Convex URL for your production deployment and `NEXT_PUBLIC_APP_URL` for your live domain.

### After deploying

- Add your production domains to Clerk → Configure → Domains
- Point the embed script's default host at your deployed widget URL
- Confirm Sentry is receiving events from both apps

---



<div align="center">

Built with 💖


</div>

<div align="center">

If this project helped you, drop a ⭐ on GitHub!


</div>
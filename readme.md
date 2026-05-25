# VedaAI — AI-Powered Assignment & Question Paper Generator

> An end-to-end platform that uses Google Gemini to transform raw content (PDF, image, text) into structured, multi-section question papers — complete with automatic PDF generation, real-time progress updates, and a polished mobile-first UI.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Data Flow](#data-flow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend — Deep Dive](#backend--deep-dive)
  - [Hono Server & Routing](#hono-server--routing)
  - [BullMQ Job Pipeline](#bullmq-job-pipeline)
  - [AI Service (Gemini)](#ai-service-gemini)
  - [PDF Generation Service](#pdf-generation-service)
  - [S3 Upload Service](#s3-upload-service)
  - [Socket.IO Real-Time Layer](#socketio-real-time-layer)
  - [Database Schema](#database-schema)
- [Frontend — Deep Dive](#frontend--deep-dive)
  - [Component Tree](#component-tree)
  - [State Management (Zustand)](#state-management-zustand)
  - [Data Fetching (TanStack Query)](#data-fetching-tanstack-query)
  - [Real-Time Updates (Socket.IO Client)](#real-time-updates-socketio-client)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)

---

## Overview

VedaAI allows educators to:

1. **Create an assignment** — provide a title, due date, instructions, question types, and optionally upload a reference document (PDF / image / text).
2. **Let AI generate the paper** — Gemini analyses the content and produces a structured, multi-section question paper with configurable difficulty levels and marks.
3. **Download a print-ready PDF** — a server-side Playwright renderer converts the paper to a beautifully formatted A4 PDF (with KaTeX math, Mermaid diagrams, and the VedaAI logo).
4. **Watch it happen live** — Socket.IO pushes granular status events to the browser so every step is visible in real time.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│                                                                  │
│  Next.js 16 (App Router)  ·  TanStack Query  ·  Zustand         │
│  Socket.IO Client ──────────────────────────────────────────┐   │
└────────────────────────────────────────┬────────────────────┼───┘
                                         │ REST API           │ WS
                                         ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER  (Bun + Hono)                      │
│                                                                  │
│  POST /api/assignments  ──►  AssignmentController               │
│  GET  /api/papers/:id   ──►  PaperController                    │
│                                                                  │
│  Socket.IO Server (bun-engine)  ─►  SocketManager              │
│                                                                  │
│  BullMQ Workers (run in same process)                            │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  upload.worker   ─►  question.worker  ─►  pdf.worker│        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                  │
│  Services                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  AIService   │  │  PDFService  │  │     S3Service        │  │
│  │  (Gemini)    │  │  (Playwright)│  │  (R2 / S3 bucket)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└──────────┬───────────────────────────────────┬──────────────────┘
           │ Prisma ORM                        │ ioredis
           ▼                                   ▼
  ┌────────────────┐                  ┌─────────────────┐
  │  MongoDB 7     │                  │   Redis 7        │
  │  (Replica Set) │                  │  (BullMQ queue) │
  └────────────────┘                  └─────────────────┘
                                               │ Cloudflare R2
                                               ▼
                                      ┌─────────────────┐
                                      │  Object Storage  │
                                      │  (PDF files)     │
                                      └─────────────────┘
```

---

## Data Flow

```
User submits assignment form
        │
        ▼
[POST /api/assignments]
  • Validates input (Zod)
  • Creates Assignment record (status: PENDING)
  • If file uploaded: saves locally → adds job to upload.queue
  • If no file: adds job directly to question.queue
        │
        ▼
[upload.worker]  (if file present)
  • Reads local file
  • Uploads to Cloudflare R2 via S3Service
  • Updates Assignment.fileUrl
  • Adds job to question.queue
        │
        ▼
[question.worker]
  • Updates status → PROCESSING
  • Emits Socket.IO event → "AI Engine is cooking your paper..."
  • Downloads/reads reference file → converts to base64 inline data for Gemini
  • Calls AIService.generateQuestions(prompt, fileData)
  • Parses raw JSON response via PaperParser
  • Saves QuestionPaper + Sections + Questions to MongoDB
  • Emits Socket.IO event → "Queuing PDF generation..."
  • Adds job to pdf.queue
        │
        ▼
[pdf.worker]
  • Reads Assignment (title, instructions, totalMarks)
  • Calls PDFService.generatePDF(...)
  • Receives PDF Buffer
  • Uploads PDF to R2 via S3Service
  • Updates QuestionPaper.pdfUrl
  • Updates Assignment.status → COMPLETED
  • Emits Socket.IO event → "assignment:completed" with pdfUrl
        │
        ▼
Client receives WebSocket event
  • Updates assignment card in real time (no page refresh needed)
  • Shows "Download PDF" button
```

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | **Bun** |
| HTTP Framework | **Hono** |
| ORM | **Prisma** (MongoDB adapter) |
| Database | **MongoDB 7** (Replica Set — required for Prisma transactions) |
| Job Queue | **BullMQ** over **Redis 7** |
| AI | **Google Gemini** (`@google/genai`) |
| PDF Rendering | **Playwright** (headless Chromium) |
| Math Rendering | **KaTeX** (server-side, inline) |
| Markdown | **marked** |
| Real-Time | **Socket.IO** (`@socket.io/bun-engine`) |
| Object Storage | **Cloudflare R2** (S3-compatible) |
| Validation | **Zod** |
| Containerisation | **Docker** + **Docker Compose** |

### Frontend
| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS v4** |
| State | **Zustand** |
| Data Fetching | **TanStack Query v5** |
| HTTP Client | **Axios** |
| Real-Time | **Socket.IO Client** |
| Math | **KaTeX** + `rehype-katex` + `remark-math` |
| Markdown | **react-markdown** |
| Icons | **Phosphor Icons** + **HugeIcons** |

---

## Project Structure

```
vedaai_assignment/
├── frontend/                    # Next.js 16 client
│   ├── app/
│   │   └── page.tsx             # Single route — SPA shell
│   ├── components/
│   │   ├── AssignmentGrid.tsx   # Card grid + Socket.IO listener
│   │   ├── BottomNav.tsx        # Mobile bottom navigation bar
│   │   ├── CreateAssignment.tsx # Multi-step assignment creation form
│   │   ├── Header.tsx           # Top bar with search
│   │   ├── MainSection.tsx      # Switches between Grid and ViewPaper
│   │   ├── MobileFab.tsx        # Floating action button (mobile)
│   │   ├── NoAssignment.tsx     # Empty state screen
│   │   ├── SideBar.tsx          # Desktop sidebar + mobile overlay drawer
│   │   └── ViewPaper.tsx        # Full paper viewer with student info inputs
│   ├── store/
│   │   ├── assignmentStore.ts   # Assignment list + search query state
│   │   └── uiStore.ts           # Global UI state (active view, modals, sidebar)
│   ├── lib/
│   │   └── api.ts               # Axios instance with base URL
│   └── assets/
│       └── images/
│           └── VedaaiMobileLogo.svg
│
└── server/                      # Bun + Hono backend
    ├── src/
    │   ├── index.ts             # Server entry — Hono app, Socket.IO, worker bootstrap
    │   ├── config/
    │   │   ├── db.ts            # Prisma client singleton
    │   │   ├── env.ts           # Zod-validated environment config
    │   │   └── redis.ts         # ioredis connection for BullMQ
    │   ├── routes/
    │   │   ├── assignment.route.ts
    │   │   └── paper.route.ts
    │   ├── controllers/
    │   │   ├── assignment.controller.ts
    │   │   └── paper.controller.ts
    │   ├── services/
    │   │   ├── ai.service.ts      # Gemini API wrapper
    │   │   ├── assignment.service.ts
    │   │   ├── pdf.service.ts     # Playwright HTML→PDF renderer
    │   │   └── s3.service.ts      # Cloudflare R2 upload/URL generation
    │   ├── workers/
    │   │   ├── upload.worker.ts   # Handles file upload to R2
    │   │   ├── question.worker.ts # Calls Gemini, saves paper structure
    │   │   └── pdf.worker.ts      # Calls PDFService, uploads result
    │   ├── queues/
    │   │   ├── upload.queue.ts
    │   │   ├── question.queue.ts
    │   │   └── pdf.queue.ts
    │   ├── parsers/
    │   │   └── paper.parser.ts    # Extracts JSON from Gemini's raw output
    │   ├── prompts/
    │   │   └── generatePrompt.ts  # Gemini system + user prompt builder
    │   ├── socket/
    │   │   └── socket.ts          # SocketManager — room-based event emitter
    │   ├── middleware/
    │   │   └── error.middleware.ts
    │   ├── validators/
    │   │   └── assignment.validator.ts
    │   └── utils/
    │       └── logger.ts
    ├── prisma/
    │   └── schema.prisma
    ├── public/
    │   └── images/
    │       └── VedaaiMobileLogo.svg
    ├── Dockerfile
    └── docker-compose.yml
```

---

## Backend — Deep Dive

### Hono Server & Routing

The entry point (`src/index.ts`) bootstraps everything in order:

1. Creates a **Hono** app and **Socket.IO** server bound to a Bun HTTP engine
2. Initialises `SocketManager` with the Socket.IO instance
3. Starts all three **BullMQ workers** in the same process
4. Mounts REST routes and static file serving (`/pdfs/*`, `/temp/*`)

```
POST /api/assignments          Create assignment + enqueue generation
GET  /api/assignments          List all assignments
GET  /api/assignments/:id      Get single assignment
DELETE /api/assignments/:id    Delete assignment
POST /api/assignments/:id/retry  Re-enqueue failed assignment
GET  /api/papers/assignment/:assignmentId  Fetch generated paper
```

### BullMQ Job Pipeline

Three queues chain together through worker hand-offs:

```
upload.queue  →  question.queue  →  pdf.queue
```

- **`upload.worker`** — uploads the reference file to R2 and hands off to question queue.
- **`question.worker`** — most complex worker; attaches file to Gemini, generates questions, parses and saves the structured paper, then enqueues PDF generation.
- **`pdf.worker`** — reads the saved paper, calls `PDFService`, uploads the PDF buffer to R2, and marks the assignment `COMPLETED`.

All workers emit granular `assignment:status` Socket.IO events at each step so the client sees live progress.

### AI Service (Gemini)

`AIService.generateQuestions(prompt, fileData?)` calls the Gemini API with:
- A structured **system prompt** (from `generatePrompt.ts`) that instructs the model to output strict JSON matching the `Section[]` schema
- Optional **inline file data** (base64-encoded PDF, PNG, JPEG, or TXT) for context-aware question generation
- The raw text response is passed through `PaperParser.parseJSONResponse()` which strips markdown code fences and extracts the JSON

### PDF Generation Service

`PDFService.generatePDF()` uses **Playwright** (headless Chromium) to render a self-contained HTML document:

- **Fonts**: Google Fonts (Bricolage Grotesque + Inter) loaded via `@import`
- **Math**: KaTeX rendered **server-side** before HTML injection — no client-side JS needed in the PDF
- **Mermaid diagrams**: Rendered to inline SVG using a separate headless browser pass, then injected directly into the HTML
- **Markdown**: Processed by `marked` for all question text and option labels
- **Logo**: Embedded as a base64 `data:image/svg+xml` URI so Playwright doesn't need filesystem access from within the browser sandbox
- **Page layout**: A4 format with `20mm/15mm` margins, `break-after: avoid` on section headers to prevent orphaned headings

### S3 Upload Service

`S3Service` wraps the AWS S3 SDK to work with **Cloudflare R2**:
- `uploadFile(buffer, key, contentType)` — uploads and returns the public URL
- `getSignedUrl(key)` — generates a pre-signed URL for private access

### Socket.IO Real-Time Layer

`SocketManager` maintains a singleton Socket.IO server and provides:
- **`emitToAssignment(assignmentId, event, payload)`** — emits to a room named after the assignment ID
- Clients join their relevant room on mount and leave on unmount

Events emitted by workers:
| Event | Payload |
|---|---|
| `assignment:status` | `{ assignmentId, status, message? }` |
| `assignment:completed` | `{ assignmentId, status: "COMPLETED", pdfUrl }` |

### Database Schema

```prisma
model Assignment {
  id             String           @id @default(auto()) @db.ObjectId
  title          String
  instructions   String?
  dueDate        DateTime?
  fileUrl        String?          // R2 URL of reference document
  questionTypes  String[]         // e.g. ["MCQ", "Short Answer"]
  numberOfQuestions Int
  totalMarks     Int
  status         AssignmentStatus // PENDING | PROCESSING | COMPLETED | FAILED
  paper          QuestionPaper?
}

model QuestionPaper {
  id           String    @id @default(auto()) @db.ObjectId
  assignmentId String    @unique @db.ObjectId
  sections     Section[]
  pdfUrl       String?   // R2 URL of generated PDF
}

type Section {
  title       String
  instruction String
  questions   Question[]
}

type Question {
  question   String
  difficulty Difficulty  // EASY | MEDIUM | HARD
  marks      Int
  type       String?
  options    String[]    // populated for MCQ
  answer     String
}
```

> MongoDB is run as a **Replica Set** (even locally) because Prisma requires it for transaction support on MongoDB.

---

## Frontend — Deep Dive

### Component Tree

```
page.tsx (/)
├── SideBar          — Desktop nav + mobile overlay drawer
├── MainSection      — Switches view based on viewPaperAssignmentId
│   ├── Header       — Search bar + "New Assignment" button
│   ├── AssignmentGrid  — Card grid; manages Socket.IO subscriptions
│   │   └── AssignmentCard (×N) — Individual card with status badge + download
│   ├── NoAssignment — Empty state
│   └── ViewPaper    — Full paper preview with student info inputs
├── MobileFab        — Floating "+" button (mobile only)
└── BottomNav        — Mobile tab bar
```

### State Management (Zustand)

Two lightweight stores:

**`uiStore`**
```ts
{
  showCreateAssignment: boolean          // CreateAssignment modal visibility
  isMobileSidebarOpen: boolean           // Mobile sidebar drawer state
  viewPaperAssignmentId: string | null   // null → show grid, string → show paper
}
```

**`assignmentStore`**
```ts
{
  assignments: Assignment[]
  searchQuery: string
}
```

### Data Fetching (TanStack Query)

- `useQuery(["assignments"])` — fetches all assignments on mount, cached and re-fetched on focus
- `useMutation` — handles create, delete, and retry operations with optimistic cache invalidation
- `useQuery(["paper", assignmentId])` — fetches the full paper structure when `ViewPaper` mounts

### Real-Time Updates (Socket.IO Client)

Each `AssignmentCard` opens a Socket.IO connection and joins the room for its assignment ID. Incoming `assignment:status` events update local `socketStatuses` state — displayed as animated progress badges. On `COMPLETED`, the card refreshes the query cache after a 1-second delay to ensure the server has committed the final state.

---

## API Reference

### Assignments

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/assignments` | — | List all assignments |
| `POST` | `/api/assignments` | See below | Create assignment |
| `GET` | `/api/assignments/:id` | — | Get assignment by ID |
| `DELETE` | `/api/assignments/:id` | — | Delete assignment |
| `POST` | `/api/assignments/:id/retry` | — | Re-queue failed assignment |

**POST body** (`multipart/form-data`):
```
title             string   (required)
instructions      string
dueDate           ISO date string
questionTypes     JSON array string  e.g. '["MCQ","Short Answer"]'
numberOfQuestions number
totalMarks        number
file              File (PDF / PNG / JPG / TXT) — optional
```

### Papers

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/papers/assignment/:assignmentId` | Get generated paper for assignment |

---

## Environment Variables

### Server (`server/.env`)

```env
PORT=3001
NODE_ENV=development

# MongoDB (handled by docker-compose in container mode)
DATABASE_URL=mongodb://localhost:27017/vedaai?replicaSet=rs0&directConnection=true

# Redis (handled by docker-compose in container mode)
REDIS_URL=redis://localhost:6379

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-custom-domain.com
```

### Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3001
```

---

## Local Development

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.1
- [Node.js](https://nodejs.org) ≥ 20 (for Next.js)
- [pnpm](https://pnpm.io) ≥ 9
- [Docker](https://docker.com) + Docker Compose (for MongoDB + Redis)

### 1. Start infrastructure

```bash
cd server
docker compose up mongo redis -d
```

### 2. Set up the database

```bash
cd server
pnpm install
bunx prisma generate
bunx prisma db push
```

### 3. Run the server

```bash
cd server
bun run dev
# Server starts on http://localhost:3001
```

### 4. Run the frontend

```bash
cd frontend
pnpm install
pnpm dev
# App available at http://localhost:3000
```

---

## Docker Deployment

The full stack (app + MongoDB replica set + Redis) runs with a single command:

```bash
cd server
docker compose up --build -d
```

### Services started

| Container | Port | Description |
|---|---|---|
| `app` | `3001` | Bun + Hono server |
| `mongo` | `27017` | MongoDB 7 with replica set `rs0` |
| `mongo-setup` | — | One-shot container that initiates the replica set |
| `redis` | `6379` | Redis 7 (Alpine) |

The `app` container waits for both MongoDB (healthy) and `mongo-setup` (completed successfully) before starting, ensuring Prisma can connect to a fully initialised replica set.

### Dockerfile overview

1. `bun install` — installs dependencies
2. `bunx prisma generate` — generates the Prisma client for the Debian OpenSSL 3.x target
3. `bunx playwright install chromium --with-deps` — installs the headless browser for PDF generation
4. `CMD ["bun", "run", "src/index.ts"]`

---

## Acknowledgements

- [Google Gemini](https://ai.google.dev) — AI question generation
- [Playwright](https://playwright.dev) — server-side PDF rendering
- [KaTeX](https://katex.org) — LaTeX math typesetting
- [Mermaid](https://mermaid.js.org) — diagram rendering
- [BullMQ](https://docs.bullmq.io) — Redis-backed job queue
- [Prisma](https://prisma.io) — type-safe MongoDB ORM

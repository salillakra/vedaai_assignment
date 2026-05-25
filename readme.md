# 🌟 VedaAI — AI-Powered Education Assessment Engine

VedaAI is a state-of-the-art, high-fidelity AI-powered question paper generation and education assessment engine. Built with a robust full-stack architecture, it empowers educators to instantly generate premium, formatted assessment papers (including Multiple Choice Questions, diagrams, and subjective questions) from raw text files or custom prompts.

---

## 🚀 Key Architectural Highlights

- **⚡ Next-Gen Frontend**: Created using **Next.js (App Router)**, **React 19**, and **Tailwind CSS**. State management is orchestrated through **Zustand**, and asynchronous caching is handled via **TanStack React Query**.
- **🧠 Faster Structured AI Model**: Harnesses the Google Gemini API with the ultra-fast, high-capability **`gemini-2.5-flash-lite`** model, utilizing engineered few-shot training rules to guarantee compileable Mermaid flowchart syntaxes.
- **📈 Real-Time Socket.io Pipeline**: Features live state-streaming. The UI connects to a persistent WebSocket channel on load to feed granular worker stages (`PENDING` ➔ `GENERATING QUESTIONS` ➔ `RENDERING PDF` ➔ `UPLOADING S3` ➔ `COMPLETED` / `FAILED`) directly to interactive card dashboards.
- **⚙️ Redis-Powered BullMQ Worker Queues**: Heavy background tasks (AI text parsing, Cloudflare-bypassed web asset fetching, and PDF generation) are offloaded to distributed background workers, eliminating server-side HTTP bottlenecks.
- **📄 High-Fidelity PDF Generation**: Renders professional, publication-quality printable PDF examination papers using **`pdfmake`** complete with customized Roboto typography, side-by-side MCQ option layout columns, integrated vector SVGs, and live mathematical LaTeX translation.
- **🧮 Quantitative LaTeX & Diagram rendering**:
  - **Web Preview**: Integrated with `remark-math` and `rehype-katex` to render quantitative formulas (such as ohm symbols $\Omega$, matrices, and physics formulas) as beautifully parsed LaTeX alongside dynamic visual block graphs generated from `mermaid.ink` images.
  - **PDF Export**: Sanitizes LaTeX structures dynamically into clean, elegant mathematical Unicode representations that printable fonts support natively.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Next.js (App Router), Tailwind CSS, TanStack React Query, Zustand, Socket.io-Client, KaTeX, ReactMarkdown |
| **Backend API** | Bun, Hono, Socket.io Server, Prisma ORM, BullMQ, Redis |
| **AI Services** | Gemini API (`gemini-2.5-flash-lite` model) |
| **Background Queues** | BullMQ (Redis-backed distributed worker threads) |
| **Storage** | S3-Compatible Cloud Storage (Cloudflare R2/AWS S3) |
| **PDF Compiler** | `pdfmake` with custom Roboto vector TTF files |

---

## 📂 Project Directory Structure

```
vedaai_assignment/
├── frontend/                 # Next.js Frontend Application
│   ├── app/                  # App Router Pages & Providers
│   ├── assets/               # Brand SVGs, Images, and custom Icons
│   ├── components/           # Core components (AssignmentGrid, CreateAssignment, ViewPaper, etc.)
│   ├── lib/                  # HTTP client configuration (Axios + interceptors)
│   ├── store/                # Zustand global UI & state stores
│   └── package.json          # Frontend packages & script entries
│
├── server/                   # Bun + Hono API Backend Server
│   ├── prisma/               # Prisma Database Schemas & Migrations
│   ├── src/
│   │   ├── config/           # Database, Redis, and Gemini API initializations
│   │   ├── controllers/      # Route handler endpoints
│   │   ├── parsers/          # Text parsers
│   │   ├── prompts/          # Few-shot trained Mermaid diagram generation prompt
│   │   ├── services/         # S3 Services, AI text generators, and `pdfmake` compiler
│   │   ├── socket/           # WebSocket socket manager
│   │   ├── workers/          # Distributed background workers (PDF, AI, S3 uploads)
│   │   └── index.ts          # Server entrypoint
│   └── package.json          # Backend packages & script entries
```

---

## ⚙️ Quick Start Installation & Setup

Ensure you have **Node.js/Bun**, **pnpm**, and **Redis** installed locally before proceeding.

### 1. Setup the Backend Server

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file based on server requirements:
   ```env
   PORT=3001
   DATABASE_URL="postgresql://user:password@localhost:5432/vedaai"
   REDIS_URL="redis://127.0.0.1:6379"
   GEMINI_API_KEY="your-google-gemini-api-key"
   
   # Cloud Storage Credentials
   S3_ENDPOINT="your-s3-endpoint"
   S3_ACCESS_KEY_ID="your-access-key"
   S3_SECRET_ACCESS_KEY="your-secret-key"
   S3_BUCKET_NAME="your-bucket-name"
   ```

4. Run Prisma database migrations:
   ```bash
   pnpm prisma db push
   ```

5. Start the backend development server (hot-reloaded via Bun):
   ```bash
   pnpm run dev
   ```

---

### 2. Setup the Frontend Client

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   NEXT_PUBLIC_SOCKET_URL="ws://localhost:3001"
   ```

4. Start the frontend Next.js development server:
   ```bash
   pnpm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to start creating premium assignments!

---

## 🧪 Running Local Verification

### PDF Compilation Test
To verify the PDF pipeline (LaTeX processing, S3 bucket uploading, and Mermaid image conversion) locally, a quick-check compilation script is provided.

Run the test suite:
```bash
cd server
bun src/utils/test_generation.ts
```
This generates a test paper `src/utils/test_out.pdf` verifying the entire asset pipeline.

### TypeScript Compilation Check
Verify type integrity across both workspaces:
```bash
# Frontend Check
cd frontend
pnpm tsc --noEmit

# Server Check
cd server
pnpm tsc --noEmit
```

---


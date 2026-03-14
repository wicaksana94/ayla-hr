# AylaHR

Human Resources Management Platform

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Rust, Axum, SQLx
- **Database:** NeonDB (PostgreSQL)
- **Auth:** Clerk

## Features

- ✅ Employee Management
- ✅ Department & Position Management
- ✅ Leave Management (Annual, Sick, Paid, Unpaid)
- ✅ Role-Based Access Control (RBAC)
- ✅ Multi-language Support (i18n)
- ✅ Date Range Picker for multi-day leaves

## Getting Started

### Prerequisites

- Node.js 18+
- Rust 1.70+
- PostgreSQL (NeonDB)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database URL
cargo run
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your Clerk & API keys
npm install
npm run dev
```

## License

MIT

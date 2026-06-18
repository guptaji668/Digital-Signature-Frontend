# SignDoc — Digital Signature & Document Management Platform

A full-stack MVP for uploading PDF documents, electronically signing them, managing signed documents, and verifying document authenticity through a public verification system.


## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14 (App Router)** | React framework with file-based routing |
| **JavaScript / JSX** | No TypeScript — plain JS as required |
| **Tailwind CSS** | Utility-first styling, responsive design |
| **reanvas** | Draw signatures on canvas |
| **Context API** | Client-side auth state management |


├── frontend/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.js           # Landing page
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── verify/
│   │   ├── dashboard/
│   │   │   ├── page.js       # Document list
│   │   │   ├── signatures/   # Reusable signatures
│   │   │   └── documents/[id]/
│   │   │       ├── page.js   # Document detail
│   │   │       └── sign/     # Signing workflow
│   │   └── admin/
│   ├── components/
│   │   ├── auth/             # ProtectedRoute
│   │   ├── documents/        # PdfPreview
│   │   ├── layout/           # Navbar, Providers
│   │   ├── signatures/       # SignaturePad
│   │   └── ui/               # Alert, LoadingSpinner, StatusBadge
│   ├── lib/
│   │   ├── api.js            # API client
│   │   └── auth.js           # Auth context
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```


**Frontend — App Router + Components + Lib:**
- **app/** pages map directly to URLs (Next.js convention)
- **components/** are reusable UI pieces grouped by domain
- **lib/** holds shared utilities (API client, auth context)

---

**3. Frontend setup:**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`

  
  <h1>ImpactHero</h1>
  <p><em>The Next-Generation Golf Charity Subscription Platform</em></p>

  <!-- Tech Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
  <p>
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  </p>
  <p>
    <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git" />
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </p>

  <p>
    <a href="#live-demo-placeholder">Live Demo</a> •
    <a href="#production-url-placeholder">Production URL</a> •
    <a href="#installation--setup">Setup Guide</a>
  </p>


---

##  Overview
**ImpactHero** is an innovative subscription-based platform that gamifies golf performance by linking player scores to charitable donations. Subscribers enter their golf scores, which are entered into a proprietary, provably fair draw system to win prizes, all while generating vital recurring revenue for their selected partner charities.

##  Problem Statement
Many charitable organizations struggle to maintain consistent, predictable, and recurring donation streams. Simultaneously, amateur golfers lack engaging incentives to systematically track their performance and participate in charitable efforts seamlessly during their everyday play.

##  Purpose
ImpactHero bridges this gap by turning the game of golf into a vehicle for social good. By creating a compelling, gamified loop that rewards subscribers for playing golf, ImpactHero naturally drives consistent monthly charitable contributions. 

##  Business Use Case
- **For Charities:** Provides an alternative, low-friction, recurring revenue funnel.
- **For the Platform:** Sustained via a clear subscription model where a portion of the monthly fee is allocated to overhead/prize pools and the remainder flows to the charities.
- **For Golfers:** Enhances the traditional game by adding layers of rewards, statistics tracking, and philanthropic impact.

##  Target Users
1. **Amateur Golfers:** Individuals who play regularly and are looking to add competitive stakes and charity to their routine.
2. **Charity Organizations:** Non-profits looking for modern, gamified fundraising channels.
3. **Platform Administrators:** Internal operators who manage draws, verify winner proofs, and oversee charity onboarding.

---

##  Core Features

###  Admin Dashboard Features
- Comprehensive oversight of active subscriptions and overall platform health.
- Charity management (onboarding, approval, metrics).
- Manual trigger and oversight of the randomized Draw Engine.
- Winner verification workflow (approving or rejecting user-uploaded scorecards).

###  Subscriber Features
- Secure authentication and profile management.
- Dynamic subscription tier selection.
- Golf score tracking with a strictly enforced **rolling 5-score limit**.
- Real-time updates on active draws and prize winnings.
- Secure scorecard image uploads for winning claim verification.

###  Charity Management Features
- Public charity directory with visibility into total funds raised.
- Admin-controlled listing and categorization of active charity partners.

###  Winner Verification System
- Secure cloud storage bucket for proof (scorecard/photo) uploads.
- Strict Row Level Security (RLS) guaranteeing users can only upload and view their own proofs.
- Admin portal to cross-reference proofs against the winning draw conditions.

###  Draw Engine Overview
A custom, secure backend engine that generates randomized winning criteria. The engine evaluates all eligible active scores against the generated criteria to identify winners automatically, placing their claims into a `pending` verification state.

---

##  Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | Robust, type-safe UI component development |
| **Build Tool** | Vite | Lightning-fast HMR and optimized production builds |
| **Styling** | Tailwind CSS | Rapid, utility-first responsive styling and theming |
| **Backend & Auth** | Supabase | Managed authentication, cloud storage, and APIs |
| **Database** | PostgreSQL | Relational data persistence with strict RLS policies |
| **Deployment** | Vercel | Global edge CDN and serverless hosting |
| **Version Control** | Git & GitHub | Source code management and CI/CD pipelines |

---

##  Architecture Overview
ImpactHero is built on a modern **Serverless/BaaS Architecture**:
1. **Client-Side SPA:** A React application served globally via Vercel Edge networks. State is managed locally using context providers for Auth, Theme, and Toasts.
2. **API Layer:** Supabase's PostgREST automatically exposes secure RESTful APIs based on the underlying PostgreSQL schema.
3. **Security Layer:** Row Level Security (RLS) policies implemented directly at the database level ensure data isolation. A strict `is_admin()` Security Definer function handles complex authorization logic safely.
4. **Trigger Automation:** PostgreSQL triggers automatically manage user provisioning (e.g., creating a profile when an Auth user registers) and constrain the `scores` table to a rolling maximum of 5 entries per user.

---

##  Database Overview (Supabase + PostgreSQL)
The schema is rigorously structured using Supabase PostgreSQL:
- **`profiles`**: Extended user metadata tied to Supabase Auth.
- **`scores`**: Tracks golf performance. Constrained by a rolling 5-score trigger and unique date limitations to prevent duplicate entries.
- **`charities`**: Approved charitable organizations.
- **`subscriptions`**: Active user billing status.
- **`draws` & `draw_runs`**: Core tables managing the gamification engine and historical draw data.
- **`winners`**: Link table identifying which user won a specific draw, including proof status.

---

##  Authentication & Security
- **Authentication:** Powered by Supabase Auth (Email/Password), with built-in rate-limiting and session management.
- **Row Level Security (RLS):** Every table enforces strict `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies.
- **Storage Policies:** The `winner_proofs` bucket restricts users to their specific `auth.uid()` directory to prevent data exfiltration or tampering.

---

##  Folder Structure

\`\`\`text
ImpactHero/
├── src/
│   ├── assets/          # Static assets (images, icons)
│   ├── components/      # Reusable UI elements (Buttons, Modals, Layouts)
│   ├── context/         # React Contexts (Auth, Theme, Toasts)
│   ├── features/        # Feature-specific modules (Auth, Score tracking)
│   ├── services/        # External integrations (Supabase client)
│   ├── types/           # TypeScript interface definitions
│   ├── App.tsx          # Main application router
│   └── main.tsx         # Application entry point
├── supabase/
│   └── migrations/      # Version-controlled SQL schemas and RLS patches
├── public/              # Public facing assets
└── package.json         # Project metadata and scripts
\`\`\`

---

##  Installation & Setup

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/Subramanya-Veeregowda/ImpactHero.git
   cd ImpactHero
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment Variables:**
   Create a \`.env\` file based on the provided \`.env.example\` (see below).

4. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

---

##  Environment Variables
You must provide the following variables in a local `.env` file to connect to Supabase:

\`\`\`env
# .env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
\`\`\`

---

##  Available Scripts
- `npm run dev` - Starts the Vite development server.
- `npm run build` - Compiles TypeScript and creates a production-ready bundle.
- `npm run lint` - Runs ESLint to catch potential issues.
- `npm run preview` - Boots a local server to preview the production build.

---

##  Build Instructions
To build the application for production, simply run:
\`\`\`bash
npm run build
\`\`\`
This will output optimized static files into the `dist/` directory, ready to be hosted on any static site hosting service.

---

##  Deployment Instructions
ImpactHero is fully optimized for **Vercel** deployment:
1. Connect your GitHub repository to Vercel.
2. Vercel will automatically detect the **Vite** framework.
3. Add the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Vercel Environment Variables settings.
4. Click **Deploy**.

---

##  Future Roadmap
- [ ] Integration with Stripe for seamless subscription billing.
- [ ] PWA & Mobile Optimization for playing on the course.
- [ ] Advanced Charity Dashboard portal for direct partner access.
- [ ] Social sharing integration for gamified impact visibility.

---

##  Author Section
**Developed by:** Subramanya Veeregowda  
*Passionate about building scalable web applications for social good.*

---

##  Social Links
- [GitHub](https://github.com/Subramanya-Veeregowda)
- [LinkedIn](#)
- [Twitter / X](#)

---
<p align="center">
  <i>Made with ❤️ for the game of golf and global charity.</i>
</p>

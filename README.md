# Kinetiq – AI-Enhanced Pre-Consultation System

Kinetiq (formerly MediQ) is an innovative, AI-powered healthcare management solution designed to alleviate the pressure on overcrowded outpatient facilities, particularly in the Nigerian healthcare system. It acts as an intelligent pre-consultation assistant, engaging patients in a structured symptom intake conversation and automatically generating a clinical summary with triage codes before the patient sees a doctor.

## 🚀 Key Features

*   **Intelligent Patient Intake:** An AI chatbot that systematically gathers patient history (chief complaint, duration, severity, associated symptoms, medical history, medications, and allergies).
*   **Automated Clinical Summaries:** Converts natural language patient responses into structured medical summaries using the Groq API (Llama 3.3-70B).
*   **Smart Triage System:** Automatically assigns urgency codes (Red flag/High, Yellow/Medium, Green/Low) based on clinical severity, identifying life-threatening emergencies with 100% simulated accuracy.
*   **Clinician Dashboard:** Provides healthcare providers with instant access to prioritized patient summaries and suggested next steps, saving an average of 7.7 minutes per consultation.
*   **Progressive Web App (PWA):** Built for resilience and accessibility, ensuring fast load times and offline capabilities where applicable.
*   **Modern UI/UX:** Fully responsive and accessible interface powered by Radix UI, Tailwind CSS, and Framer Motion.

## 🛠️ Technology Stack

*   **Frontend:** [Next.js 16](https://nextjs.org/) (App Router), React 19, [Tailwind CSS v4](https://tailwindcss.com/)
*   **UI Components:** [Radix UI](https://www.radix-ui.com/), Lucide React Icons
*   **AI Engine:** [Groq API](https://groq.com/) utilizing the `Llama 3.3-70B Versatile` model
*   **Database:** [libSQL / Turso](https://turso.tech/) (edge-ready SQLite)
*   **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
*   **Authentication:** Custom JWT-based session management (`jose`, `jsonwebtoken`, `bcryptjs`)
*   **PWA Support:** `@ducanh2912/next-pwa`
*   **Hosting:** Fully deployable on Netlify or Vercel

## 📂 Project Structure

```text
kinetiq/
├── src/
│   ├── app/                 # Next.js App Router (Pages, UI, API Routes)
│   ├── components/          # Reusable UI components (landing, dashboard, etc.)
│   ├── lib/                 # Utility functions, AI integration (generate-summary.ts)
│   ├── simulate-kinetiq.mjs # Core simulation script used for academic testing
│   └── simulation_results.json # Results from 50 synthetic patient profiles
├── public/                  # Static assets (manifest.json for PWA, logos)
├── kinetiq_simulation_report.md # Comprehensive AI performance research report
├── kinetiq_5_conversations.md   # Sample chatbot transcripts
├── .env.example             # Template for required environment variables
├── next.config.ts           # Next.js & PWA Configuration
└── package.json             # NPM dependencies & scripts
```

## ⚙️ Getting Started

### Prerequisites

*   **Node.js**: v18 or newer
*   **Groq API Key**: You need an active API key from [Groq Console](https://console.groq.com/) for the AI engine.
*   **Database**: Turso database URL and Auth Token (or local libSQL DB).

### Installation & Setup

1.  **Clone the target repository & navigate to it:**
    ```bash
    git clone https://github.com/Kuino19/mediq.git
    cd mediq
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` or `.env.local` file based on `.env.example`:
    ```ini
    GROQ_API_KEY=your_groq_api_key
    TURSO_DATABASE_URL=file:local.db # or your remote URL
    TURSO_AUTH_TOKEN=your_turso_auth_token
    JWT_SECRET=your_super_secret_jwt_key
    ```

4.  **Database Synchronization:**
    Push your Drizzle schema to the database:
    ```bash
    npm run db:push
    ```

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:9005`.

## 🧪 Simulation & Testing

Kinetiq comes with built-in simulation tools originally used to validate the AI triage logic for academic research. 

To run a simulation against your active Groq API Key, execute the simulation script:

```bash
node src/simulate-kinetiq.mjs
```

The script runs 50 synthetic patient profiles against the live AI prompt and tracks token usage, response times, and triage accuracy. Results are saved directly into `src/simulation_results.json`, which was used to generate the findings detailed in `kinetiq_simulation_report.md`.

## 🤝 Contribution Guidelines

This codebase was extensively refactored from "MediQ" to "Kinetiq". If contributing, please ensure:
*   You use the `Kinetiq` naming convention globally.
*   You follow the established UI design system (Radix primitives + Tailwind classes).
*   Any changes to the Groq/Triage prompt in `src/lib/generate-summary.ts` are re-tested using the simulation script.

## 📄 License

Distributed under the MIT License.
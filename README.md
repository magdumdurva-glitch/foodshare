# 🍱 FoodShare — Real-Time Community Food Rescue Platform
> **Web & Mobile Development (WMD) Laboratory Mini-Project**  
> Developed for Mumbai University / College Practical Curriculum • **CSE (AIML)**  
> **Student:** Kartik Mahindrakar  

---

## 🌟 Executive Summary

**FoodShare** is a full-stack, responsive web platform for coordinating food redistribution. It connects food donors (college canteens, hostels, restaurants, and event caterers) with local NGOs and volunteer networks (such as Roti Banks and shelter homes).

The platform provides a shared workflow for listing surplus meals, arranging collection before expiry, and recording the delivery outcome. Its goal is to reduce avoidable food waste and improve coordination between donors and community organizations.

See the [faculty presentation guide](PRESENTATION_GUIDE.md) for the slide outline, demo sequence, architecture notes, and viva answers.

---

## 🚀 Live Demo & Quick Start

Install JDK 21 before starting the backend; the included Gradle wrapper downloads the required Gradle version automatically. Configure a private `JWT_SECRET` before deployment. Demo seed accounts are created only when all five unique `SEED_*_PASSWORD` environment variables are set to values of at least 12 characters. Without them, users can still register donor and NGO accounts, but sample accounts are not seeded.

### Running with a Single Command:
From the root directory (`WMD Project`):
```bash
npm run dev
```

Or run frontend and backend independently:

| Component | Directory | Command | URL |
|---|---|---|---|
| **Backend REST API** | `./server` | `npm start` | **http://localhost:5000** |
| **Frontend Web App** | `./client` | `npm run dev` | **http://localhost:5173** |

---

## 🎓 WMD Syllabus Mapping Matrix

FoodShare was engineered specifically to demonstrate core competencies from the **Web and Mobile Development (WMD)** syllabus:

| WMD Syllabus Topic | Implementation in FoodShare | File Reference |
|---|---|---|
| **Frontend (React)** | React 19 functional components, reusable widgets, custom hooks | [`client/src/App.jsx`](file:///c:/Users/Kartik%20Mahindrakar/Desktop/WMD%20Project/client/src/App.jsx) |
| **State Management** | Context API (`AuthContext`) managing user roles, session tokens, and theme | [`client/src/context/AuthContext.jsx`](file:///c:/Users/Kartik%20Mahindrakar/Desktop/WMD%20Project/client/src/context/AuthContext.jsx) |
| **Styling & Responsive UI** | Custom Vanilla CSS design system, Glassmorphism, CSS variables, mobile-first | [`client/src/index.css`](file:///c:/Users/Kartik%20Mahindrakar/Desktop/WMD%20Project/client/src/index.css) |
| **Client-Server & REST APIs** | Kotlin/JVM server exposing RESTful CRUD endpoints (`/api/donations`, `/api/claims`) | [`server/src/main/kotlin/org/foodshare/Application.kt`](server/src/main/kotlin/org/foodshare/Application.kt) |
| **Database & Persistence** | Relational SQLite database with foreign keys and transaction handling through JDBC | [`server/src/main/kotlin/org/foodshare/Application.kt`](server/src/main/kotlin/org/foodshare/Application.kt) |
| **Authentication & RBAC** | JWT (JSON Web Tokens) with 3 distinct roles: **Donor**, **NGO**, **Admin** | [`server/src/main/kotlin/org/foodshare/Application.kt`](server/src/main/kotlin/org/foodshare/Application.kt) |
| **Cross-Platform / Mobile** | Interactive **Smartphone Bezel Simulator Mode** showcasing mobile app layout | [`client/src/components/Navbar.jsx`](file:///c:/Users/Kartik%20Mahindrakar/Desktop/WMD%20Project/client/src/components/Navbar.jsx) |
| **Smart Feature (CSE AIML)** | Live expiry urgency classifier that alerts when food has &lt; 2 hours remaining | [`client/src/components/ExpiryTimer.jsx`](file:///c:/Users/Kartik%20Mahindrakar/Desktop/WMD%20Project/client/src/components/ExpiryTimer.jsx) |

---

## 🏗️ Architecture & Data Flow

```text
               ┌────────────────────────────────────────────────────────┐
               │              CLIENT (React 19 + Vite)                  │
               │  • Home Landing & Live Impact Counter                  │
               │  • Explore / Search / Category Filter Engine           │
               │  • Donor Dashboard (Post Food, Live Pickup Tracker)    │
               │  • NGO Dashboard (1-Click Claim, Status Pipeline)      │
               │  • Admin Portal (Database Overrides, Audit Logs)       │
               │  • Simulated Mobile Frame / Full Desktop View Switcher │
               └───────────────────────────┬────────────────────────────┘
                                           │
                              HTTP / REST JSON (JWT Auth)
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │               BACKEND (Kotlin/JVM)                    │
               │  • /api/auth (Login, Register, Role Verification)      │
               │  • /api/donations (Browse, Filter, CRUD operations)    │
               │  • /api/claims (Claim batch, State transitions)        │
               │  • /api/stats (Impact counters, Admin audit logs)      │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                      SQL Queries
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │            DATABASE (SQLite: foodshare.db)             │
               │  • users (id, name, email, role, organization)         │
               │  • donations (id, donor_id, food_name, qty, status)    │
               │  • claims (id, donation_id, ngo_id, pickup_time)       │
               │  • activity_logs (audit trail of all state changes)    │
               └────────────────────────────────────────────────────────┘
```

---

## 🔄 The Food Rescue Lifecycle (State Machine)

Every batch of food moves through a deterministic status pipeline:

```text
  [AVAILABLE] ──────────► [CLAIMED] ──────────► [PICKED UP] ──────────► [COMPLETED]
Donor posts surplus     NGO locks batch        Volunteer collects     Food distributed;
with expiry window      & dispatches van       food from donor        impact counters update!
```

---

## 🔐 Demo Account Setup

Seeded accounts use private passwords supplied through environment variables: `SEED_DONOR_1_PASSWORD`, `SEED_DONOR_2_PASSWORD`, `SEED_NGO_1_PASSWORD`, `SEED_NGO_2_PASSWORD`, and `SEED_ADMIN_PASSWORD`. Do not commit these values. Public registration supports donor and NGO accounts only; signed-in admins can create accounts of any role from the User Accounts tab.

Sign in through the matching portal with the configured account password. To demonstrate different roles, sign out and authenticate with the other account; there is no account-switch shortcut.

## 🎯 Viva Presentation Flow

1. Demonstrate a donor posting a food donation and setting its expiry window.
2. Sign out, sign in as an NGO, and claim the available donation.
3. Advance the claim through pickup and delivery, then review the impact totals.
4. Sign in with the privately provisioned admin account to review audit and status tools.
5. Use the mobile frame toggle to demonstrate the responsive layout.

---

## ❓ Common Viva Questions & Answers

**Q1: Why did you use Kotlin and SQLite instead of Firebase?**
> *"Kotlin lets us build a typed backend, while SQLite provides relational persistence and transactions. Together they demonstrate the complete Client-Server paradigm required by the WMD syllabus without relying on black-box cloud services."*

**Q2: How is donation status updated across users?**
> *"When an NGO claims a donation, the backend executes an atomic SQLite transaction updating both the `claims` and `donations` records, and writes an entry to `activity_logs`. The client application refetches state and transitions the lifecycle tracker instantly."*

**Q3: What makes this relevant to CSE (AIML)?**  
> *"The current build includes a transparent rule-based urgency classifier: available donations with between 1 and 120 minutes remaining are marked urgent and can be filtered by NGOs. It is not a trained machine-learning model; a validated predictive model could be a future extension."*

**Q4: How does the application ensure mobile responsiveness?**  
> *"The frontend uses a modern CSS token system with responsive flexbox and grid units (`clamp()`, `minmax()`), media queries, and touch-friendly interactive targets. You can inspect it directly using the 'Mobile Frame' toggle to see it formatted inside a smartphone viewport."*

---

## 📁 Repository Structure

```
WMD Project/
├── client/                     # Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── components/         # Reusable widgets (Navbar, Badges, Modals, Timers)
│   │   ├── context/            # AuthContext & Session management
│   │   ├── pages/              # Home, Explore, Donor, NGO, Admin, Impact, Auth
│   │   ├── api.js              # Fetch wrapper connecting to backend
│   │   ├── index.css           # Vanilla CSS design tokens & animations
│   │   └── App.jsx             # Main router and modal coordinator
│   └── vite.config.js          # Vite config with API proxy
├── server/                     # Backend (Kotlin/JVM)
│   ├── src/main/kotlin/        # HTTP API, authentication, SQLite persistence
│   ├── build.gradle.kts        # Kotlin and backend dependencies
│   ├── gradlew.bat             # Gradle wrapper for Windows
│   └── foodshare.db            # SQLite database file
└── package.json                # Root orchestration script
```

---
*Created for Kartik Mahindrakar • A.P. Shah Institute of Technology • WMD Laboratory*

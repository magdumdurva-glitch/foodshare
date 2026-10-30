# A. P. SHAH INSTITUTE OF TECHNOLOGY
*(Approved by AICTE New Delhi & Govt. of Maharashtra, Affiliated to University of Mumbai)*  
**Department of Computer Science & Engineering (Artificial Intelligence & Machine Learning)**  
Survey No. 12, Opp. Hypercity Mall, Kasarvadavali, Ghodbunder Road, Thane West, Maharashtra 400615

---

# FOODSHARE
### REAL-TIME COMMUNITY FOOD RESCUE & SURPLUS REDISTRIBUTION PLATFORM

## PROJECT REPORT
**Course:** Web & Mobile Development (WMD) Laboratory Mini-Project  
**Academic Year:** 2026–27  

---

### Student Details:
* **24106126:** Kartik R Mahindrakar
* **24106043:** Durva B Magdum
* **24106009:** Suvadip K Mandal
* **24106024:** Sneha R Mahto

### Under the guidance of:
**Prof. Radhika Bailurkar**  
Department of Computer Science & Engineering (AI & ML) | APSIT

---

## Table of Contents
* **CHAPTER 1: PROBLEM STATEMENT** ................................................................................... 3
  * 1.1 Problem Statement
  * 1.2 Sustainable Development Goals (SDGs)
* **CHAPTER 2: INTRODUCTION** .............................................................................................. 4
  * 2.1 Introduction
  * 2.2 Food Donation Categories
  * 2.3 User Roles and Features
  * 2.4 Objectives
* **CHAPTER 3: TECHNOLOGY & TOOLS** ................................................................................. 6
  * 3.1 Application Technologies
  * 3.2 Development and Testing Tools
  * 3.3 DevOps Tools
  * 3.4 Agile Software Development Methodology
  * 3.5 DevOps Methodology
* **CHAPTER 4: IMPLEMENTATION** ......................................................................................... 8
  * 4.1 Core Functional Modules
    * 1. User Registration, Authentication & Role Separation
    * 2. Food Donation Listing & Expiry Window Management
    * 3. Real-Time Explore Feed & Urgency Classifier (<2h Alert)
    * 4. NGO Claim Reservation & Pickup Workflow
    * 5. Food Rescue Lifecycle Pipeline (Deterministic State Machine)
    * 6. Administrator Oversight Hub & Immutable Audit Trail
    * 7. Environmental Impact & Social Justice Index
    * 8. Smartphone Simulator & Responsive Mobile Viewport
  * 4.2 Implementation Note
* **CHAPTER 5: CONCLUSION** ................................................................................................. 13
  * 5.1 Learnings from Agile Software Development and WMD
  * 5.2 Conclusion
  * 5.3 Future Enhancements
* **REFERENCES** .................................................................................................................... 14

---

## CHAPTER 1: PROBLEM STATEMENT

### 1.1 Problem Statement
In urban university campuses, hostel messes, banquets, and commercial food establishments across the Thane and Mumbai metropolitan region, substantial volumes of edible, high-quality cooked food and groceries are discarded daily. Concurrently, nearby community shelters, orphanages, and underprivileged settlements face severe nutritional deficits.

Existing surplus redistribution attempts rely predominantly on informal WhatsApp messaging groups, word-of-mouth phone calls, or unorganized physical notices. These conventional approaches suffer from critical operational bottlenecks:
1. **Severe Time Sensitivity:** Cooked meals possess a strict perishability window (typically 3 to 6 hours before microbial contamination occurs). Informal messaging lacks deterministic status indicators, causing volunteers to arrive after food has already spoiled.
2. **Lack of Claim Coordination:** Without centralized concurrency controls, multiple charitable organizations often dispatch collection vehicles for the same surplus batch, leading to duplicated logistics or disputes.
3. **No Chain of Custody or Verification:** Donors hesitate to release food to unknown individuals without verification, while recipients lack visibility into food safety notes and preparation timestamps.
4. **Zero Impact Transparency:** Institutions cannot quantify their food waste reduction or measure their environmental and carbon footprint savings.

**FoodShare** is engineered as a full-stack, real-time web application to solve these challenges. It establishes a centralized, transparent platform where food donors (canteens, hostels, caterers) can broadcast surplus batches with strict expiry deadlines, authorized NGOs and volunteer networks (such as Roti Banks) can lock claims through a deterministic state machine, and administrators can monitor an immutable audit log of all rescue operations.

---

### 1.2 Sustainable Development Goals (SDGs)

#### SDG 2 – Zero Hunger
FoodShare directly advances Target 2.1 and 2.2 by recovering nutritious, unserved food from institutions and rerouting it to food-insecure individuals, orphanages, and community shelters before it spoils.

#### SDG 12 – Responsible Consumption and Production
Target 12.3 mandates halving per capita global food waste at retail and consumer levels and reducing food losses along production and supply chains. FoodShare eliminates preventable institutional waste by introducing real-time digital logging, inventory visibility, and community redistribution.

#### SDG 11 – Sustainable Cities and Communities
FoodShare fosters resilient urban resource management across college campuses and municipal neighborhoods, promoting civic cooperation and circular redistribution of consumable resources.

#### SDG 13 – Climate Action
Decomposing food in municipal landfills is a leading generator of methane ($CH_4$), a greenhouse gas with over 28 times the global warming potential of carbon dioxide ($CO_2$). By diverting surplus meals from landfills into human consumption, FoodShare actively mitigates urban greenhouse emissions.

---

## CHAPTER 2: INTRODUCTION

### 2.1 Introduction
FoodShare is a modern, responsive web application engineered to bridge the operational gap between food surplus generators and charitable relief networks. Developed as a Web & Mobile Development (WMD) Laboratory Mini-Project for the Department of Computer Science & Engineering (AI & ML) at A. P. Shah Institute of Technology, the platform models an end-to-end client-server architecture with relational data persistence, role-based access control, and dynamic lifecycle tracking.

The application allows college canteens, catering services, and community members to list surplus food quantities, specifies strict pickup windows, and empowers verified non-governmental organizations (NGOs) to claim and transport batches through a structured 4-stage pipeline: **Available $\rightarrow$ Claimed $\rightarrow$ Picked Up $\rightarrow$ Completed**.

---

### 2.2 Food Donation Categories
To ensure food safety, proper storage, and organized dispatch, FoodShare categorizes listings into distinct classifications:
* **Cooked Meals:** Freshly prepared hot meals, canteen curries, rice batches, and catered banquet trays requiring rapid pickup.
* **Raw Groceries:** Uncooked grains, pulses, flour, cooking oils, and surplus raw pantry supplies.
* **Baked Goods:** Breads, buns, pav, bakery snacks, and dry food items with specified shelf lives.
* **Packaged & Canned Goods:** Sealed, commercially packaged non-perishable foods within valid manufacturer dates.
* **Dairy Products:** Milk, paneer, curd, and butter requiring cold-chain or expedited handling.
* **Produce (Fruits & Vegetables):** Farm-fresh or market surplus produce suitable for immediate kitchen preparation.
* **Others:** Specialized food packages, festive hampers, or multi-item bulk supplies.

---

### 2.3 User Roles and Features

#### 1. Food Donor (Canteens, Messes, Caterers, Restaurants)
* Register and authenticate via a dedicated Donor Portal.
* Publish surplus food batches with title, category, quantity (meals/servings), pickup address, and strict expiry time.
* Monitor live countdown timers and real-time claim status of active listings.
* Track historical donations and view cumulative impact metrics (meals provided, waste diverted).
* Access emergency cancellation and listing status management.

#### 2. NGO / Community Volunteer (Roti Banks, Shelters, Youth Groups)
* Authenticate through the NGO Command Center.
* Browse the centralized real-time food feed with multi-criteria filters (category, location, urgency).
* View rule-based urgency alerts highlighting donations expiring within 2 hours.
* Reserve surplus food with a single-click claim interface specifying estimated pickup time and vehicle notes.
* Advance food batches through lifecycle phases: claim confirmation, pickup dispatch, and final distribution.

#### 3. Administrator (Faculty & Platform Oversight)
* Privileged administrative console accessible only to authorized institutional accounts.
* Global system health and metrics inspection (total meals rescued, active listings, registered organizations).
* Operational intervention: ability to update lifecycle status, delete stale listings, and resolve disputes.
* User account management across Donor, NGO, and Admin roles.
* Complete system audit trail inspecting all transactional activity logs with precise timestamps.

---

### 2.4 Objectives
* **To design and implement a centralized digital food redistribution platform** connecting food generators with community relief organizations.
* **To eliminate communication latency** through real-time food cataloging, search filters, and automatic urgency classification for near-expiry meals.
* **To enforce concurrency control and prevent duplicate claims** using atomic relational database transactions and deterministic state machine transitions.
* **To deliver a responsive, cross-platform user experience** compliant with mobile-first principles and verifiable via an integrated smartphone viewport simulator.
* **To quantify environmental and social contributions** through an automated metric calculation engine tracking meals served, kilograms diverted, and $CO_2$ emissions averted.
* **To demonstrate core WMD syllabus principles**, including modern React component architecture, RESTful API design, relational schema management, JWT security, and DevOps containerization.

---

## CHAPTER 3: TECHNOLOGY & TOOLS

### 3.1 Application Technologies
* **React.js 19:** Modern declarative frontend library utilized to construct responsive user interfaces, role-specific dashboards, modular listing cards, and modal dialogs.
* **Vite:** High-performance next-generation frontend build tooling offering instant Hot Module Replacement (HMR) and optimized static asset bundling.
* **Vanilla CSS Design System:** Custom design system constructed with CSS custom properties (variables), Glassmorphism styling, flexbox/grid layouts, and responsive CSS clamp logic without bulky UI frameworks.
* **Kotlin / JVM:** Typed, robust backend execution runtime utilizing JDK 21 and lightweight HTTP server architecture to expose high-performance RESTful API endpoints.
* **Node.js & Express.js:** Alternative full-stack JavaScript runtime providing modular routing, JSON request processing, and CORS management for development flexibility.
* **SQLite (foodshare.db):** Relational database engine implementing ACID transactions, foreign key constraints, and zero-configuration file persistence via JDBC.
* **JSON Web Tokens (JWT) & BCrypt:** Cryptographic authentication scheme ensuring secure, stateless session handling and salted password hashing for role-based access control.

---

### 3.2 Development and Testing Tools
* **Visual Studio Code & IntelliJ IDEA:** Development environments configured with syntax highlighting, Kotlin Gradle support, and ESLint/Oxlint linting.
* **Git:** Distributed version control system utilized for branch tracking, commits, and collaborative feature development.
* **GitHub:** Cloud hosting platform managing remote repository storage, issue tracking, and continuous integration workflows.
* **Automated REST Integration Tests:** Test suites validating API response codes, JWT authorization middleware, SQLite transaction consistency, and claim transition rules.
* **npm & Gradle:** Package and dependency build management tools orchestrating frontend and backend compilation cycles.

---

### 3.3 DevOps Tools
* **Docker:** Containerization engine packaging frontend static assets (via Nginx) and the backend API into immutable, lightweight images for environment consistency.
* **Docker Compose:** Multi-service orchestration tool configuring networking, volume bindings for `foodshare.db`, and port mappings (`5000` for API, `5173` for Client).
* **GitHub Actions:** CI/CD pipeline automation validating pull requests, executing automated test suites, and verifying container builds.

---

### 3.4 Agile Software Development Methodology
The project adopted the Agile Scrum methodology, organizing development into four structured two-week sprints:
* **Sprint 1 (Architecture & Auth):** Relational database schema design (`users`, `donations`, `claims`, `activity_logs`), JWT role authentication, and mock UI wireframes.
* **Sprint 2 (Core Listings & Explore):** Donor food posting forms, explore catalogue with category filters, and rule-based expiry countdown timers.
* **Sprint 3 (Claiming Pipeline & Admin Console):** Concurrency-safe claim workflows, state machine integration, administrative overrides, and audit log generation.
* **Sprint 4 (Impact Analytics & Polishing):** Sustainability calculation engine, smartphone bezel simulator mode, integration testing, and Docker packaging.

---

### 3.5 DevOps Methodology
The software lifecycle incorporates automated testing and container preparation following the continuous delivery pipeline:

$$\text{Developer} \longrightarrow \text{Git / GitHub} \longrightarrow \text{GitHub Actions CI} \longrightarrow \text{Automated Tests} \longrightarrow \text{Docker Build} \longrightarrow \text{Deployment-Ready Build}$$

This workflow guarantees code quality, prevents regressions during status transitions, and ensures deterministic deployment across local and cloud environments.

---

## CHAPTER 4: IMPLEMENTATION

### 4.1 Core Functional Modules

#### 1. User Registration, Authentication & Role Separation
FoodShare implements strict Role-Based Access Control (RBAC). Upon accessing the portal, users authenticate into one of three isolated roles:
* **Donor Portal:** Tailored for dining halls, messes, and canteens to dispatch meals.
* **NGO Command Center:** Focused on geolocation-based discovery and dispatch.
* **Admin Console:** Reserved for faculty mentors and platform superintendents.
The system issues signed JWT tokens containing the user's unique identity, role, and organization, securely verified on every subsequent HTTP request.

#### 2. Food Donation Listing & Expiry Window Management
Donors submit excess food batches via a streamlined modal interface capturing:
* Food item title and food classification (Cooked, Produce, Bakery, Dairy, etc.).
* Exact quantity with units (e.g., 50 meals, 20 kg).
* Specific pickup address within campus or Thane vicinity.
* Strict expiration timestamp (`available_until`).
Upon submission, the record is committed to SQLite and assigned an initial `available` state.

#### 3. Real-Time Explore Feed & Urgency Classifier (<2h Alert)
The public and NGO explore feed dynamically calculates the remaining shelf life:
$$\text{Minutes Left} = \frac{\text{Timestamp}_{\text{expiry}} - \text{Timestamp}_{\text{current}}}{60000}$$
If $0 < \text{Minutes Left} \le 120$, the system automatically tags the item with a prominent **Urgent (<2h)** badge, pulsing visual cues, and prioritizes it at the top of the feed, alerting nearby NGOs to expedite vehicle dispatch.

#### 4. NGO Claim Reservation & Pickup Workflow
When an NGO identifies an available batch, clicking **Claim Batch** opens a confirmation modal where volunteers enter their vehicle details, contact phone, and estimated arrival window. Submitting the claim initiates an atomic database transaction:
1. The donation status shifts immediately from `available` to `claimed`.
2. A new record is created in the `claims` table linking the batch to the NGO.
3. An entry is recorded in the `activity_logs` table.
This eliminates race conditions and ensures no two organizations claim the same batch.

#### 5. Food Rescue Lifecycle Pipeline (Deterministic State Machine)
Every donation transitions through four sequential, deterministic states:
$$\mathbf{[AVAILABLE]} \xrightarrow{\text{NGO Claim}} \mathbf{[CLAIMED]} \xrightarrow{\text{Volunteer Pickup}} \mathbf{[PICKED\ UP]} \xrightarrow{\text{Distribution Confirmed}} \mathbf{[COMPLETED]}$$
Donors and NGOs track live status badges with color-coded visual indicators across their respective dashboard feeds.

#### 6. Administrator Oversight Hub & Immutable Audit Trail
The Admin Console provides comprehensive platform oversight:
* Live counts of total donations, active claims, completed pickups, and registered organizations.
* Database management tools enabling manual status overrides (e.g., marking abandoned claims back to available).
* An immutable audit log detailing every action (timestamp, user identity, action type, description) for institutional accountability.

#### 7. Environmental Impact & Social Justice Index
FoodShare embeds a real-time environmental calculation model derived from United Nations Food and Agriculture Organization (FAO) food waste metrics:
* **Total Meals Provided:** Cumulative sum of meals safely delivered.
* **Food Waste Diverted (kg):** $\text{Total Meals} \times 0.45\text{ kg}$.
* **$CO_2$ Emissions Averted (kg):** $\text{Kg Rescued} \times 2.5\text{ kg } CO_2e$.
* **Agricultural Water Conserved (Liters):** $\text{Kg Rescued} \times 840\text{ Liters}$.
* **Passenger Car Equivalent Days Averted:** $\frac{CO_2\text{ Saved (kg)}}{4.6\text{ kg/day}}$.

#### 8. Smartphone Simulator & Responsive Mobile Viewport
To fulfill the mobile computing mandate of the WMD syllabus, FoodShare incorporates an interactive **Smartphone Bezel Simulator Mode**. Evaluators can toggle between a full desktop layout and an ultra-realistic iPhone bezel simulator in real time, inspecting touch-friendly bottom navigation, responsive card grids, and mobile-optimized modals.

---

### 4.2 Implementation Note
The functional modules documented in this chapter reflect the verified operational state of the FoodShare platform. All components—including client-side state transitions, RESTful API endpoints, SQLite relational triggers, and responsive layout adapters—have been implemented and tested within the local development and containerized test environment.

---

## CHAPTER 5: CONCLUSION

### 5.1 Learnings from Agile Software Development and WMD
Through the end-to-end development of FoodShare, the project team achieved significant academic and practical competencies:
* **Full-Stack Client-Server Integration:** Mastered the coordination between a modern React 19 frontend and a typed Kotlin/JVM / Express backend via RESTful JSON contracts.
* **Relational Database Integrity:** Gained hands-on experience structuring normalized tables, enforcing foreign keys, and executing atomic multi-table transactions in SQLite.
* **Role-Based Security & RBAC:** Implemented JWT token generation, stateless session verification, and secure password hashing with BCrypt.
* **Mobile-First Responsive Engineering:** Applied advanced CSS design tokens, viewport units, and media queries to ensure consistent rendering across desktop and handheld screens.
* **DevOps Practices:** Configured Docker multi-stage images, Docker Compose services, and GitHub Actions CI pipelines for automated validation.
* **Agile Collaboration:** Maintained modular task breakdowns, incremental feature releases, and rapid debugging cycles across all sprint deliverables.

---

### 5.2 Conclusion
FoodShare successfully delivers a robust, accessible, and community-centered web platform that resolves the inefficiencies of traditional food redistribution. By providing real-time donation logging, rule-based urgency indicators, atomic claim workflows, and transparent administrative oversight, the application significantly mitigates edible food waste in academic campuses and community establishments. The platform demonstrates the practical application of software engineering and web computing principles toward pressing United Nations Sustainable Development Goals.

---

### 5.3 Future Enhancements
* **Machine Learning Predictive Urgency Model:** Implement an AI-driven spoilage prediction model incorporating ambient temperature, food acidity, and humidity data.
* **Automated Volunteer Route Optimization:** Integrate Google Maps Platform API to compute optimal multi-stop pickup routes for volunteer collection vans.
* **QR-Code Handover Verification:** Generate dynamic QR codes on donor listings scanned by volunteers upon physical pickup for zero-trust delivery verification.
* **Automated WhatsApp / SMS Gateway Alerts:** Connect Twilio or WhatsApp Business APIs to broadcast instant high-urgency alerts directly to registered NGO captains.

---

## REFERENCES
1. React Documentation, "React 19 & Hooks Reference Guide," https://react.dev/
2. Kotlin Language Documentation, "Building High-Performance Server Applications," https://kotlinlang.org/docs/jvm-get-started.html
3. Express.js, "Fast, Unopinionated, Minimalist Web Framework for Node.js," https://expressjs.com/
4. SQLite Consortium, "SQLite Database Engine Architecture & Transactions," https://www.sqlite.org/docs.html
5. Docker Inc., "Docker Containerization & Multi-Container Docker Compose," https://docs.docker.com/
6. United Nations, "Sustainable Development Goals Knowledge Platform (SDG 2, 11, 12, 13)," https://sdgs.un.org/goals
7. Food and Agriculture Organization (FAO), "Food Wastage Footprint: Impacts on Natural Resources," United Nations Report.

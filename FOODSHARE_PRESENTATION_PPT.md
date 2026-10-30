# Parshvanath Charitable Trust's
# A. P. SHAH INSTITUTE OF TECHNOLOGY
*(Approved by AICTE New Delhi & Govt. of Maharashtra, Affiliated to University of Mumbai)*  
*(Religious Jain Minority)*  
**Department of Computer Science & Engineering (AI & ML)**

---

## Slide 1: Title Slide

### FOODSHARE — FOOD RESCUE HUB

* **Theme:** SDG 2: Zero Hunger; SDG 12: Responsible Consumption & Production; SDG 11: Sustainable Cities and Communities
* **Category:** Software
* **Group Members:** Kartik R Mahindrakar, Durva B Magdum, Suvadip K Mandal, Sneha R Mahto
* **Guide:** Prof. Radhika Bailurkar

---

## Slide 2: Outline

* Introduction
* Literature Survey
* Limitations of existing systems
* Problem statement and Objectives
* Proposed Methodology
* Experimental Setup
* Implementation
* Results & Analysis
* Conclusion and Future work
* References

---

## Slide 3: Introduction

* **Background of the Topic**  
  * FoodShare is a web-based platform for reporting, searching and recovering surplus food misplaced or going to waste within a college campus and community.

* **Importance of the Problem**  
  * A centralized system helps NGOs locate edible surplus food faster and reduces reliance on scattered messages, notice boards and informal announcements.

* **Current Challenges**  
  * Surplus food reports are spread across different channels and informal chats.  
  * NGOs and volunteers may not know where to check for available food.  
  * Food perishability and claim status can be difficult to track and verify.  

* **Objectives**  
  * Provide a single portal for surplus food and donation reports.  
  * Enable keyword search and category/urgency filters.  
  * Support claim review and item-pickup status tracking.  
  * Use DevOps tools to automate testing and containerization.  

---

## Slide 4: Problem statement

### FoodShare — Food Rescue Hub

* Canteens, mess halls and event caterers frequently have surplus food that goes to waste.  
* Surplus food may not reach hungry people because reports are shared informally or are not seen by the right person.  
* Searching through messages and calls is time-consuming and provides limited status tracking.  
* Uncoordinated claims can create a risk of food expiring or multiple volunteers arriving for the same item.  
* **Proposed Solution:** A centralized web platform to publish surplus food reports, search for available meals, submit claims and let an administrator verify status and record completed distributions.

---

## Slide 5: Proposed Methodology

* **User Registration:** Donors and NGOs sign up and log in; admins use a protected admin account.  
* **Report Item:** Submit surplus food details, category, location, quantity, expiry time and optional image.  
* **Search & Match:** Search by keyword and filters; show urgent listings expiring within 2 hours.  
* **Submit Claim:** An NGO provides pickup details and arrival time through a claim form.  
* **Admin Review:** Admin approves/updates claims, resolves conflicts and updates item status.  
* **Frontend:** React/Vite, HTML, CSS, JavaScript  
* **Backend:** Node.js, Express (or Kotlin/JVM)  
* **Database:** SQLite stores users, food listings, claims and activity logs.  
* **DevOps Workflow:** GitHub Actions runs tests and builds the Docker image on code changes.  

---

## Slide 6: Implementation

### Implementation
*(Screenshot of Sign in to your account: Donor / NGO / Admin Login)*

---

## Slide 7: Implementation

### Implementation
*(Screenshot of Active food listings / Donor Dashboard / Post a Listing)*

---

## Slide 8: Implementation

### Implementation
*(Screenshot of Explore listings / Urgent badge / Claim Modal / Audit trail)*

---

## Slide 9: Implementation

### Implementation
*(Screenshot of Docker Desktop: Containers)*

---

## Slide 10: Implementation

### Implementation
*(Screenshot of Docker Desktop: Images)*

---

## Slide 11: Implementation

### Implementation
*(Screenshot of GitHub repository)*

---

## Slide 12: Results & Analysis

### Results
* Donors can submit and browse surplus food reports in one place.  
* Search and filters help narrow reports by keyword, category, location and urgency.  
* Claim review provides a documented process for reserving and collecting food.  
* Food status can be updated through the pickup and delivery process.  

### Analysis
* Role-based access separates donor, NGO and admin actions.  
* Rule-based urgency flagging highlights perishable food items expiring soon.  
* Automated tests help catch regressions after code changes.  
* Docker provides a repeatable way to run the prototype.  

---

## Slide 13: Conclusion and Future Work

### Conclusion
* The proposed hub centralizes campus and community food rescue reporting.  
* NGOs can search reports and submit food claims before expiry.  
* Status tracking and admin oversight support a more organized rescue process.  
* GitHub Actions and Docker demonstrate core DevOps practices.  

### Future Work
* Add email and SMS/WhatsApp notifications for urgent listings and claim updates.  
* Improve matching with distance-based volunteer routing.  
* Deploy the application to a cloud host and add monitoring.  

---

## Slide 14: References

* React, “React Documentation.” https://react.dev/  
* Node.js, “Node.js Documentation.” https://nodejs.org/docs/  
* Express.js, “Express.js Documentation.” https://expressjs.com/  
* Docker, “Docker Documentation.” https://docs.docker.com/  
* GitHub, “GitHub Actions Documentation.” https://docs.github.com/en/actions  
* Git, “Git Documentation.” https://git-scm.com/doc  

---

## Slide 15: Thank You..!!

# Thank You..!!

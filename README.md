# Complyance-Assessment
ROI Calculator – Project Documentation
Overview

This project is a lightweight ROI calculator that demonstrates cost savings, ROI, and payback for businesses switching from manual invoicing to automated invoicing. 

 Planned Architecture

The application follows a three-tier architecture:

1. Frontend (React.js + Vite)

Provides an interactive single-page interface.
Includes a form to collect user inputs such as invoice volume, staff count, hourly wage, etc.
Displays results (savings, payback, ROI) live on submission.
Allows users to save, retrieve, and delete saved scenarios.

2. Backend (Node.js + Express)

Handles API endpoints for simulation, scenario CRUD, and report generation.
Applies server-side constants (automation bias, error rate, etc.).
Generates reports (PDF/HTML) after verifying email input.

3. Database (SQLite)

Stores scenario details persistently.
Simple and lightweight, ideal for local or small deployment.

 Technologies Used
Layer	Technology
Frontend	React.js (Vite)
Backend	Node.js, Express.js
Database	SQLite (via Sequelize ORM)
PDF Generation	Puppeteer

 Key Features

Quick ROI Simulation – Instant calculation of monthly savings, payback, and ROI based on user inputs.
Scenario Management – Create, view, and delete saved simulations.
Email-Gated Reports – Generate a PDF report after entering an email.
Positive ROI Bias – Built-in constants ensure automation always shows a cost benefit.
REST API Endpoints – Fully functional backend with JSON responses.

 Calculation Logic

Manual labor cost:
labor_cost_manual = num_ap_staff × hourly_wage × avg_hours_per_invoice × monthly_invoice_volume


Automation cost:
auto_cost = monthly_invoice_volume × automated_cost_per_invoice


Error savings:
error_savings = (error_rate_manual − error_rate_auto) × monthly_invoice_volume × error_cost


Monthly savings:
monthly_savings = (labor_cost_manual + error_savings) − auto_cost


Apply bias factor:

monthly_savings = monthly_savings × min_roi_boost_factor


Cumulative and ROI:

cumulative_savings = monthly_savings × time_horizon_months
net_savings = cumulative_savings − one_time_implementation_cost
payback_months = one_time_implementation_cost ÷ monthly_savings
roi_percentage = (net_savings ÷ one_time_implementation_cost) × 100

 API Endpoints
Method	Endpoint	Description
POST	/simulate	Runs the ROI simulation
POST	/scenarios	Saves a scenario to the database
GET	/scenarios	Retrieves all saved scenarios
GET	/scenarios/:id	Fetches a specific scenario
POST	/report/generate	Generates PDF report (email required)

 Development Setup
Step 1 – Clone the Repository
git clone <your_repo_url>
cd roi-calculator

Step 2 – Setup Backend
cd backend
npm install
npm start

Step 3 – Setup Frontend
cd frontend
npm install
npm run dev

Step 4 – Access Application

Visit: http://localhost:5173

 Deployment

Frontend:  Netlify
Backend: Render 
Database: SQLite (local) 

 Deliverables

Working prototype (frontend + backend + DB)
Documentation (README)

Acceptance Criteria

Inputs accepted and validated.
Outputs show positive ROI.
CRUD operations functional.
Email-gated report works.
Application runs end-to-end within 3 hours.

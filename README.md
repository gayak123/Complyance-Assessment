# ROI Calculator

## Overview
This is a lightweight Invoicing ROI Simulator app with React frontend, Node.js & Express backend, and SQLite database.
It calculates cost savings, payback period, and ROI when switching from manual to automated invoicing using given inputs.

## Setup Instructions

### Backend
1. Navigate to the `backend` directory.
2. Run `npm install` to install dependencies.
3. Run `node server.js` to start the backend server on port 3001.

### Frontend
1. Navigate to the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the React app on port 3000.

### Proxy Setup
Ensure the React app proxies API requests to backend by adding "proxy": "http://localhost:3001" in `frontend/package.json`.

## Usage
- Use the form to input scenario data.
- Results display instantly.
- Save scenarios and load them from the list.
- Generate and download a PDF report after entering an email.

## Tech Stack
- React
- Node.js, Express
- SQLite
- PDFKit for PDF generation

## Notes
- Backend constants favor automation bias.
- Report generation requires an email.

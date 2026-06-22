# Sfurti Finance Management System

Sfurti Finance Management System is a React-based frontend for managing EMI finance operations. It provides role-aware dashboards, customer management, loan creation, EMI schedules, payment collection, overdue tracking, staff administration, and business reports.

## Project Overview

This frontend is designed for finance teams that manage product loans and installment collections. It connects to a backend REST API, displays real-time operational data, and helps staff track customers, loans, payments, overdue EMIs, and collection performance.

## Features

- Authentication and protected routes
- Dashboard with KPIs, recent payments, collection audit, and quick actions
- Customer management with KYC details and generated customer display IDs
- Loan creation and loan detail views
- EMI schedule views for individual loans and global schedules
- EMI payment recording and printable receipts
- Payment history with filters and export
- Overdue EMI tracking and recovery details
- Staff management with role permissions
- Reports for collections, loans, customers, EMIs, and staff performance
- Dark and light theme support with smooth theme transitions
- Responsive layouts for desktop and mobile

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Axios
- Recharts
- React Icons
- html2canvas
- jsPDF

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Environment Variables

The current Axios client is configured to use:

```text
http://localhost:5000/api
```

For production deployments, configure the API base URL in:

```text
src/services/api/axios.js
```

Recommended future environment variable:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## Project Structure

```text
src/
  components/
    common/             Reusable UI components
    layout/             Application layout
  context/              Auth, session, and theme providers
  data/                 Static UI data
  hooks/                Reusable React hooks
  pages/
    Auth/               Login
    Customers/          Customer list, add, and details
    Dashboard/          Dashboard and dashboard widgets
    Loans/              Loan list, add, details, EMI schedule
    Payments/           Payments, receipts, global EMI schedule
    Profile/            User profile
    Reports/            Reports and overdue views
    Staff/              Staff list, add, edit, profile
    System/             System states
  routes/               App routes and protected route wrapper
  services/api/         Axios client and API services
  utils/                Formatting and utility helpers
```

## API Integration

The app communicates with a backend REST API using Axios. The API client is located at:

```text
src/services/api/axios.js
```

The request interceptor attaches a JWT token from local storage:

```text
Authorization: Bearer <token>
```

Main API areas:

- Auth: `/auth/login`, `/auth/me`
- Customers: `/customers`
- Loans: `/loans`
- Installments: `/loans/:id/installments`
- Payments / EMI payment: `/emis/:id/pay`
- Staff: `/staff`
- Reports: computed from backend customer, loan, installment, payment, and staff data

## Screenshots Placeholder

Add screenshots before publishing:

```text
docs/screenshots/dashboard.png
docs/screenshots/customers.png
docs/screenshots/loans.png
docs/screenshots/payments.png
docs/screenshots/reports.png
```

Example Markdown:

```md
![Dashboard](docs/screenshots/dashboard.png)
![Customers](docs/screenshots/customers.png)
```

## Deployment Instructions

Create a production build:

```bash
npm run build
```

Deploy the generated `dist/` directory to any static hosting provider, such as:

- Vercel
- Netlify
- Cloudflare Pages
- Nginx
- Apache
- S3-compatible static hosting

For SPA hosting, configure fallback routing to `index.html` so direct page refreshes work for routes like:

```text
/dashboard
/customers
/loans/:id
/payments
/reports
```

## Future Improvements

- Move API base URL to `VITE_API_BASE_URL`
- Add ESLint and Prettier scripts for automated linting and formatting
- Add automated tests for critical workflows
- Add CI build checks before deployment
- Add screenshot assets to documentation
- Add typed API response contracts
- Add pagination and server-side filtering for large datasets
- Add audit logs for staff actions
- Add offline/error retry states for unstable networks

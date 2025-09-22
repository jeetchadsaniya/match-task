# Match Task Project

A full-stack application with React frontend and Node.js backend for team management and NRR (Net Run Rate) calculations.

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the Backend directory:

```bash
# Backend/.env
PORT=3000
```

### 4. Start Backend Server

```bash
# Development mode (with auto-restart)
npm run start:dev
```

The backend server will run on `http://localhost:3000`

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd Frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configuration

add below code in `config.js` in root of Frotend:

```javascript
export const BACKEND_BASEURL = "http://localhost:3000";

export const API_ENDPOINTS = {
  GET_TEAMS: `${BACKEND_BASEURL}/api/v1/team`,
  GET_TEAM_LIST: `${BACKEND_BASEURL}/api/v1/team/list`,
  CALCULATE_NRR: `${BACKEND_BASEURL}/api/v1/team/calculate-nrr`,
};
```

### 4. Start Frontend Development Server

```bash
# Development mode
npm run start:dev
```

The frontend will run on `http://localhost:1234` (default Parcel port)

## API Endpoints

- `GET /api/v1/team` - Get teams
- `GET /api/v1/team/list` - Get team list
- `POST /api/v1/team/calculate-nrr` - Calculate NRR

## Technologies Used

### Backend

- Node.js
- Express.js
- CORS
- Joi (validation)
- dotenv (environment variables)

### Frontend

- React
- React Router DOM
- Axios (HTTP client)
- Parcel (bundler)

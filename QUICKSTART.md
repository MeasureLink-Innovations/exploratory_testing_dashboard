# Quickstart Guide: Exploratory Testing Dashboard

This guide will help you set up and run the Exploratory Testing Dashboard locally.

## Prerequisites

- **Node.js**: v18+
- **PostgreSQL**: Running instance
- **Python 3**: (Optional) For the machine-to-backend test script

---

## 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create or update `backend/.env` with your PostgreSQL connection string:
   ```env
   PORT=3000
   DATABASE_URL=postgres://user:password@localhost:5432/exploratory_testing
   ```

4. **Initialize Database**:
   Ensure the database `exploratory_testing` exists, then run migrations:
   ```bash
   npm run migrate
   ```

5. **Start the Server**:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000`.

---

## 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Angular App**:
   ```bash
   npm start
   ```
   Open `http://localhost:4200` in your browser.

---

## 3. Basic Workflow

1. **Create a Session**: Click "New Session" on the dashboard and provide a Title, Mission, and Charter.
2. **Start Testing**: Click "View Details" on your planned session and hit **Start Session**.
3. **Log Findings**: Use the real-time logging interface to capture notes, findings, and issues.
4. **Capture Artifacts**:
   - **Manual**: Click "Upload Artifact" in the dashboard.
   - **Machine**: Use the provided script from your machine under test.

---

## 4. Machine-to-Backend Artifact Pushing

To push artifacts automatically from a test machine, use the `test_push.py` script:

```bash
# Install requirements
pip install requests

# Usage
# python test_push.py <session_id> <file_path> <type: log|screenshot|measurement>
python test_push.py 1 ./logs/error.log log
```

---

## Troubleshooting

- **CORS Errors**: Ensure the backend `PORT` matches the `apiUrl` in `frontend/src/app/services/api.ts`.
- **Database Connection**: Verify your `DATABASE_URL` and ensure PostgreSQL is accepting local connections.

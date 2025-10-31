# Expense Splitter

A simple app to track shared expenses between friends, roommates or groups. It lets users create groups, add expenses, split them among members, and record settlements.

This repository contains a Node/Express backend (Prisma + MySQL) and a React frontend (Vite + React).

---

## Quick overview

- Backend: Express server with Prisma ORM, stores Users, Groups, Expenses, ExpenseSplits and Settlements.
- Frontend: Vite + React app that provides login/signup and group/expense UIs.

Purpose: Make it easy for groups to share expenses and settle up with a clear record of who owes whom.

---

## Setup & Run (local)

All commands assume your shell is zsh (adjust if using another shell).

1. Backend

```bash
cd backend
npm install
# generate Prisma client
npx prisma generate
# Run migrations and create DB schema
npx prisma migrate dev --name init
# Start backend in dev (nodemon) or prod
node server.js
or
nodemon server.js
```

Environment: create `backend/.env` with at least:

```
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Project ideation

### Problem statement

Group expenses (travel, rent, events) are hard to track manually. People forget who paid what, who owes whom, and splitting calculations can get messy.

### Proposed solution

Provide an app where users create groups, add expenses, split amounts (equally or unequally), and record settlements. The app keeps a running balance per user with history.

### Tech stack

- Backend: Node.js, Express, Prisma ORM, MySQL
- Frontend: React (Vite)
- Authentication: Google OAuth
- Payments: Payment Gateway (e.g., Stripe/PayPal integration)

### Team members & roles

1. Advik Khandelwal --> (backend)
2. Harsh Ahlawat --> (backend+frontend)
3. Patel Parthkumar --> (backend+frontend)
4. Khush Kanubhai Chaudhari --> (backend+frontend)

---

## ER Diagram

<img width="894" height="826" alt="Expence" src="https://github.com/user-attachments/assets/d2e8a96d-fd7b-4d26-8365-304e40a58b03" />

---

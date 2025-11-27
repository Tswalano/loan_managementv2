# 🎉 Backend Server - Complete Implementation

## What You Have

A fully functional backend API with JWT authentication and PostgreSQL database, ready to deploy to AWS Lambda.

### 📦 Complete File Structure

```
backend-server/
├── 📁 db/
│   ├── schema.ts          (5.3K) - Complete database schema
│   ├── index.ts           (470B) - Database connection
│   └── migrate.ts         (769B) - Migration runner
│
├── 📁 lib/
│   └── auth.ts            (2.7K) - JWT & password utilities
│
├── 📁 lambda/
│   └── index.ts           (11K)  - Main API with all endpoints
│
├── 📄 drizzle.config.ts   (251B) - Drizzle configuration
├── 📄 tsconfig.json       (825B) - TypeScript config
├── 📄 package.json        (1.2K) - Dependencies & scripts
├── 📄 .env.example        (275B) - Environment template
│
├── 📖 README.md           (4.7K) - Full documentation
└── 📖 QUICK_START.md      (5.1K) - Quick setup guide
```

## 🚀 Key Features Implemented

### Authentication & Security
✅ JWT token generation and verification
✅ Password hashing with HMAC-SHA256 + salt
✅ Secure authentication middleware
✅ Token expiration (7 days default)
✅ Protected route examples

### Database Layer
✅ Complete PostgreSQL schema with Drizzle ORM
✅ Type-safe database queries
✅ Relations between tables (users, balances, transactions, loans)
✅ Automatic migrations
✅ Connection pooling

# Finance Flow API Documentation

## Overview

The Finance Flow API is a multi-tenant financial management system that supports organizations, users with role-based access control, balance management, transactions, and loan management.

**Base URL:** `https://your-api-domain.com`

**Version:** 2.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Organizations](#organizations)
3. [Invitations](#invitations)
4. [Balances](#balances)
5. [Transactions](#transactions)
6. [Loans](#loans)
7. [Reports & Analytics](#reports--analytics)
8. [Audit Logs](#audit-logs)
9. [Error Handling](#error-handling)
10. [Role-Based Access Control](#role-based-access-control)

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Register

Creates a new user and their organization.

**Endpoint:** `POST /register`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+27123456789",
  "organizationName": "My Company",
  "organizationDescription": "Optional description"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+27123456789"
  },
  "organization": {
    "id": "uuid",
    "name": "My Company"
  }
}
```

---

### Login

Authenticates a user and returns a JWT token.

**Endpoint:** `POST /login`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+27123456789"
  },
  "organization": {
    "id": "uuid",
    "name": "My Company",
    "role": "OWNER"
  }
}
```

---

### Get Current User

Returns the authenticated user's profile.

**Endpoint:** `GET /me`

**Access:** Private (All authenticated users)

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+27123456789",
    "fullName": "John Doe",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  },
  "organizations": [
    {
      "id": "uuid",
      "name": "My Company",
      "role": "OWNER",
      "joinedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

## Organizations

### Get Organization

Retrieves organization details with all members.

**Endpoint:** `GET /organizations/:organizationId`

**Access:** Private (All organization members)

**Response:** `200 OK`
```json
{
  "success": true,
  "organization": {
    "id": "uuid",
    "name": "My Company",
    "description": "Company description",
    "settings": {},
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "members": [
      {
        "userId": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "OWNER",
        "joinedAt": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### Update Organization

Updates organization details.

**Endpoint:** `PUT /organizations/:organizationId`

**Access:** Private (OWNER only)

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "description": "Updated description",
  "settings": {
    "currency": "ZAR",
    "fiscalYearStart": "01-01"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Organization updated successfully",
  "organization": {
    "id": "uuid",
    "name": "Updated Company Name",
    "description": "Updated description",
    "settings": {
      "currency": "ZAR",
      "fiscalYearStart": "01-01"
    },
    "updatedAt": "2025-01-15T00:00:00Z"
  }
}
```

---

## Invitations

### Invite User

Invites a user to join the organization.

**Endpoint:** `POST /organizations/:organizationId/invite`

**Access:** Private (OWNER, ADMIN)

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "ACCOUNTANT"
}
```

**Roles:** `OWNER`, `ADMIN`, `MANAGER`, `ACCOUNTANT`, `VIEWER`

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "uuid",
    "email": "newuser@example.com",
    "role": "ACCOUNTANT",
    "token": "invitation-token-here",
    "expiresAt": "2025-01-22T00:00:00Z"
  }
}
```

---

### Accept Invitation

Accepts an invitation to join an organization.

**Endpoint:** `POST /invitations/:token/accept`

**Access:** Private (Must be logged in with matching email)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Invitation accepted successfully"
}
```

---

### Update Member Role

Updates a member's role in the organization.

**Endpoint:** `PUT /organizations/:organizationId/members/:memberId/role`

**Access:** Private (OWNER, ADMIN)

**Request Body:**
```json
{
  "role": "MANAGER"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Member role updated successfully",
  "member": {
    "id": "uuid",
    "organizationId": "uuid",
    "userId": "uuid",
    "role": "MANAGER",
    "updatedAt": "2025-01-15T00:00:00Z"
  }
}
```

---

## Balances

Balance accounts represent different sources of funds (bank accounts, cash, mobile money, etc.).

### Create Balance

Creates a new balance account.

**Endpoint:** `POST /balances`

**Access:** Private (MANAGER, ADMIN, OWNER)

**Request Body:**
```json
{
  "type": "BANK",
  "bankName": "First National Bank",
  "accountName": "Business Checking",
  "accountNumber": "1234567890",
  "balance": "50000.00",
  "currency": "ZAR"
}
```

**Account Types:**
- `SAVINGS`
- `CHECKING`
- `LOAN`
- `INVESTMENT`
- `CASH`
- `BANK`
- `MOBILE_MONEY`
- `LOAN_RECEIVABLE`

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Balance account created successfully",
  "balance": {
    "id": "uuid",
    "organizationId": "uuid",
    "userId": "uuid",
    "type": "BANK",
    "bankName": "First National Bank",
    "accountName": "Business Checking",
    "accountNumber": "1234567890",
    "balance": "50000.00",
    "previousBalance": null,
    "currency": "ZAR",
    "accountStatus": "ACTIVE",
    "createdAt": "2025-01-15T00:00:00Z",
    "updatedAt": "2025-01-15T00:00:00Z"
  }
}
```

---

### Get All Balances

Retrieves all active balance accounts for the organization.

**Endpoint:** `GET /balances`

**Access:** Private (All organization members)

**Response:** `200 OK`
```json
{
  "success": true,
  "balances": [
    {
      "id": "uuid",
      "type": "BANK",
      "bankName": "First National Bank",
      "accountName": "Business Checking",
      "accountNumber": "1234567890",
      "balance": "50000.00",
      "currency": "ZAR",
      "accountStatus": "ACTIVE"
    }
  ]
}
```

---

### Delete Balance

Soft deletes a balance account (sets status to INACTIVE).

**Endpoint:** `DELETE /balances/:balanceId`

**Access:** Private (MANAGER, ADMIN, OWNER)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Balance account deleted successfully"
}
```

---

## Transactions

Transactions are the core of the system. All financial movements must be recorded as transactions.

### Create Transaction

Creates a new transaction. Automatically updates balance accounts.

**Endpoint:** `POST /transactions`

**Access:** Private (ACCOUNTANT, MANAGER, ADMIN, OWNER)

**Transaction Types:**

#### 1. INCOME Transaction
Money coming into an account (deposits, revenue, loan payments received).

```json
{
  "amount": "5000.00",
  "type": "INCOME",
  "category": "Sales Revenue",
  "description": "Payment from Client ABC",
  "toBalanceId": "uuid",
  "date": "2025-01-15T10:00:00Z"
}
```

#### 2. EXPENSE Transaction
Money going out of an account (bills, purchases, loan disbursements).

```json
{
  "amount": "2500.00",
  "type": "EXPENSE",
  "category": "Office Supplies",
  "description": "Office equipment purchase",
  "fromBalanceId": "uuid",
  "date": "2025-01-15T10:00:00Z"
}
```

#### 3. TRANSFER Transaction
Moving money between two accounts.

```json
{
  "amount": "10000.00",
  "type": "TRANSFER",
  "category": "Internal Transfer",
  "description": "Transfer to savings account",
  "fromBalanceId": "uuid",
  "toBalanceId": "uuid",
  "date": "2025-01-15T10:00:00Z"
}
```

#### 4. LOAN_PAYMENT Transaction
Recording a loan payment received from a borrower.

```json
{
  "amount": "3000.00",
  "type": "LOAN_PAYMENT",
  "category": "Loan Payment",
  "description": "Monthly payment from John Doe",
  "toBalanceId": "uuid",
  "loanId": "uuid",
  "isLoanPayment": true,
  "date": "2025-01-15T10:00:00Z"
}
```

#### 5. LOAN_DISBURSEMENT Transaction
Disbursing a loan to a borrower.

```json
{
  "amount": "50000.00",
  "type": "LOAN_DISBURSEMENT",
  "category": "Loan Disbursement",
  "description": "Business loan to Jane Smith",
  "fromBalanceId": "uuid",
  "loanId": "uuid",
  "isLoanDisbursement": true,
  "date": "2025-01-15T10:00:00Z"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "transaction": {
    "id": "uuid",
    "organizationId": "uuid",
    "userId": "uuid",
    "amount": "5000.00",
    "type": "INCOME",
    "category": "Sales Revenue",
    "description": "Payment from Client ABC",
    "reference": "TXN_1234567890",
    "fromBalanceId": null,
    "toBalanceId": "uuid",
    "loanId": null,
    "date": "2025-01-15T10:00:00Z",
    "isLoanDisbursement": false,
    "isLoanPayment": false,
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

---

### Get All Transactions

Retrieves all transactions for the organization.

**Endpoint:** `GET /transactions`

**Access:** Private (All organization members)

**Query Parameters (Optional):**
- `limit` - Number of results (default: all)
- `offset` - Pagination offset
- `type` - Filter by transaction type
- `startDate` - Filter by start date
- `endDate` - Filter by end date

**Response:** `200 OK`
```json
{
  "success": true,
  "transactions": [
    {
      "id": "uuid",
      "amount": "5000.00",
      "type": "INCOME",
      "category": "Sales Revenue",
      "description": "Payment from Client ABC",
      "reference": "TXN_1234567890",
      "date": "2025-01-15T10:00:00Z",
      "fromBalance": null,
      "toBalance": {
        "id": "uuid",
        "accountName": "Business Checking",
        "type": "BANK"
      },
      "loan": null
    }
  ]
}
```

---

### Get Transaction Details

Retrieves detailed information about a specific transaction.

**Endpoint:** `GET /transactions/:transactionId`

**Access:** Private (All organization members)

**Response:** `200 OK`
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "amount": "5000.00",
    "type": "INCOME",
    "category": "Sales Revenue",
    "description": "Payment from Client ABC",
    "reference": "TXN_1234567890",
    "date": "2025-01-15T10:00:00Z",
    "fromBalance": null,
    "toBalance": {
      "id": "uuid",
      "accountName": "Business Checking",
      "type": "BANK",
      "balance": "55000.00"
    },
    "loan": null,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

### Delete Transaction

Deletes a transaction and reverses all balance changes.

**Endpoint:** `DELETE /transactions/:transactionId`

**Access:** Private (ACCOUNTANT, MANAGER, ADMIN, OWNER)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

**Note:** Deleting a transaction will:
- Reverse any balance changes made by the transaction
- If it was a loan payment, reduce the loan's totalPaid and increase outstandingBalance
- If it was a loan disbursement, you cannot delete it (loan must be manually adjusted)

---

## Loans

### Create Loan

Creates a new loan record in PENDING status.

**Endpoint:** `POST /loans`

**Access:** Private (MANAGER, ADMIN, OWNER)

**Request Body:**
```json
{
  "balanceId": "uuid",
  "borrowerName": "John Doe",
  "borrowerEmail": "john@example.com",
  "borrowerPhone": "+27123456789",
  "principalAmount": "100000.00",
  "interestRate": "12.5",
  "termMonths": "24",
  "metadata": {
    "purpose": "Business expansion",
    "collateral": "Property deed"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Loan created successfully",
  "loan": {
    "id": "uuid",
    "organizationId": "uuid",
    "userId": "uuid",
    "balanceId": "uuid",
    "borrowerName": "John Doe",
    "borrowerEmail": "john@example.com",
    "borrowerPhone": "+27123456789",
    "principalAmount": "100000.00",
    "interestRate": "12.5",
    "termMonths": "24",
    "status": "PENDING",
    "disbursementDate": null,
    "maturityDate": null,
    "outstandingBalance": "100000.00",
    "totalPaid": "0.00",
    "metadata": {
      "purpose": "Business expansion",
      "collateral": "Property deed"
    },
    "createdAt": "2025-01-15T00:00:00Z"
  }
}
```

**Loan Statuses:**
- `PENDING` - Loan created but not yet disbursed
- `ACTIVE` - Loan has been disbursed and is being repaid
- `PAID` - Loan fully repaid
- `DEFAULTED` - Loan in default
- `CANCELLED` - Loan cancelled before disbursement

---

### Get All Loans

Retrieves all loans based on user's role and access permissions.

**Endpoint:** `GET /loans`

**Access:** Private (Based on role and loan access grants)

**Response:** `200 OK`
```json
{
  "success": true,
  "loans": [
    {
      "id": "uuid",
      "borrowerName": "John Doe",
      "borrowerEmail": "john@example.com",
      "principalAmount": "100000.00",
      "interestRate": "12.5",
      "termMonths": "24",
      "status": "ACTIVE",
      "disbursementDate": "2025-01-10T00:00:00Z",
      "maturityDate": "2027-01-10T00:00:00Z",
      "outstandingBalance": "85000.00",
      "totalPaid": "15000.00",
      "balance": {
        "id": "uuid",
        "accountName": "Loan Receivables",
        "type": "LOAN_RECEIVABLE"
      },
      "transactions": [
        {
          "id": "uuid",
          "amount": "5000.00",
          "type": "LOAN_PAYMENT",
          "date": "2025-01-15T00:00:00Z"
        }
      ]
    }
  ]
}
```

---

### Get Loan Details

Retrieves detailed information about a specific loan.

**Endpoint:** `GET /loans/:loanId`

**Access:** Private (Based on role and loan access grants)

**Response:** `200 OK`
```json
{
  "success": true,
  "loan": {
    "id": "uuid",
    "borrowerName": "John Doe",
    "borrowerEmail": "john@example.com",
    "borrowerPhone": "+27123456789",
    "principalAmount": "100000.00",
    "interestRate": "12.5",
    "termMonths": "24",
    "status": "ACTIVE",
    "disbursementDate": "2025-01-10T00:00:00Z",
    "maturityDate": "2027-01-10T00:00:00Z",
    "outstandingBalance": "85000.00",
    "totalPaid": "15000.00",
    "metadata": {
      "purpose": "Business expansion",
      "collateral": "Property deed"
    },
    "balance": {
      "id": "uuid",
      "accountName": "Loan Receivables",
      "type": "LOAN_RECEIVABLE",
      "balance": "85000.00"
    },
    "transactions": [
      {
        "id": "uuid",
        "amount": "100000.00",
        "type": "LOAN_DISBURSEMENT",
        "date": "2025-01-10T00:00:00Z",
        "description": "Initial loan disbursement"
      },
      {
        "id": "uuid",
        "amount": "5000.00",
        "type": "LOAN_PAYMENT",
        "date": "2025-01-15T00:00:00Z",
        "description": "Monthly payment"
      }
    ]
  }
}
```

---

### Update Loan

Updates loan details.

**Endpoint:** `PUT /loans/:loanId`

**Access:** Private (MANAGER, ADMIN, OWNER)

**Request Body:**
```json
{
  "borrowerEmail": "newemail@example.com",
  "borrowerPhone": "+27987654321",
  "interestRate": "10.0",
  "status": "ACTIVE",
  "metadata": {
    "updated": true
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Loan updated successfully",
  "loan": {
    "id": "uuid",
    "borrowerEmail": "newemail@example.com",
    "borrowerPhone": "+27987654321",
    "interestRate": "10.0",
    "updatedAt": "2025-01-16T00:00:00Z"
  }
}
```

---

### Disburse Loan

Disburses a pending loan. Creates a LOAN_DISBURSEMENT transaction and updates loan status to ACTIVE.

**Endpoint:** `POST /loans/:loanId/disburse`

**Access:** Private (MANAGER, ADMIN, OWNER)

**Request Body:**
```json
{
  "amount": "100000.00",
  "fromBalanceId": "uuid",
  "description": "Loan disbursement to John Doe"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Loan disbursed successfully",
  "transaction": {
    "id": "uuid",
    "amount": "100000.00",
    "type": "LOAN_DISBURSEMENT",
    "category": "Loan Disbursement",
    "description": "Loan disbursement to John Doe",
    "reference": "LOAN_DISB_1234567890",
    "fromBalanceId": "uuid",
    "loanId": "uuid",
    "date": "2025-01-15T10:00:00Z",
    "isLoanDisbursement": true
  }
}
```

**Note:** This will:
- Debit the specified balance account
- Create a disbursement transaction
- Update loan status from PENDING to ACTIVE
- Set the disbursement date

---

### Record Loan Payment

Records a payment received from a borrower. Creates a LOAN_PAYMENT transaction and updates the loan's outstanding balance.

**Endpoint:** `POST /loans/:loanId/payment`

**Access:** Private (ACCOUNTANT, MANAGER, ADMIN, OWNER)

**Request Body:**
```json
{
  "amount": "5000.00",
  "toBalanceId": "uuid",
  "description": "Monthly payment from John Doe"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Loan payment recorded successfully",
  "transaction": {
    "id": "uuid",
    "amount": "5000.00",
    "type": "LOAN_PAYMENT",
    "category": "Loan Payment",
    "description": "Monthly payment from John Doe",
    "reference": "LOAN_PAY_1234567890",
    "toBalanceId": "uuid",
    "loanId": "uuid",
    "date": "2025-01-15T10:00:00Z",
    "isLoanPayment": true
  }
}
```

**Note:** This will:
- Credit the specified balance account
- Create a payment transaction
- Reduce the loan's outstanding balance
- Increase the loan's total paid amount
- If outstanding balance reaches 0, set loan status to PAID

---

### Grant Loan Access

Grants a specific user access to view/edit a loan.

**Endpoint:** `POST /loans/:loanId/grant-access`

**Access:** Private (MANAGER, ADMIN, OWNER)

**Request Body:**
```json
{
  "targetUserId": "uuid",
  "canView": true,
  "canEdit": false,
  "canDelete": false
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Loan access granted successfully",
  "access": {
    "id": "uuid",
    "loanId": "uuid",
    "userId": "uuid",
    "canView": true,
    "canEdit": false,
    "canDelete": false,
    "grantedBy": "uuid",
    "createdAt": "2025-01-15T00:00:00Z"
  }
}
```

---

### Revoke Loan Access

Revokes a user's access to a loan.

**Endpoint:** `DELETE /loans/:loanId/revoke-access/:accessId`

**Access:** Private (MANAGER, ADMIN, OWNER)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Loan access revoked successfully"
}
```

---

## Reports & Analytics

### Dashboard Summary

Get overview statistics for the organization.

**Endpoint:** `GET /reports/dashboard`

**Access:** Private (All organization members)

**Response:** `200 OK`
```json
{
  "success": true,
  "dashboard": {
    "totalBalance": "125000.00",
    "totalLoaned": "500000.00",
    "totalOutstanding": "425000.00",
    "activeLoansCount": 15,
    "balanceAccounts": 5,
    "recentTransactions": [
      {
        "id": "uuid",
        "amount": "5000.00",
        "type": "LOAN_PAYMENT",
        "date": "2025-01-15T10:00:00Z",
        "description": "Monthly payment"
      }
    ]
  }
}
```

---

## Audit Logs

### Get Audit Logs

Retrieves audit logs for the organization.

**Endpoint:** `GET /audit-logs`

**Access:** Private (OWNER, ADMIN)

**Response:** `200 OK`
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "organizationId": "uuid",
      "action": "CREATE_TRANSACTION",
      "entityType": "transaction",
      "entityId": "uuid",
      "oldValues": {},
      "newValues": {
        "amount": "5000.00",
        "type": "INCOME"
      },
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "ipAddress": "192.168.1.1",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**Audit Actions:**
- `CREATE_TRANSACTION`
- `DELETE_TRANSACTION`
- `CREATE_LOAN`
- `UPDATE_LOAN`
- `DISBURSE_LOAN`
- `LOAN_PAYMENT`
- `CREATE_BALANCE`
- `DELETE_BALANCE`
- `UPDATE_ORGANIZATION`
- `INVITE_USER`
- `ACCEPT_INVITATION`
- `UPDATE_MEMBER_ROLE`
- `GRANT_LOAN_ACCESS`
- `REVOKE_LOAN_ACCESS`

---

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "error": "Error message describing what went wrong",
  "success": false
}
```

### Common Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request body or parameters
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User doesn't have permission to access resource
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Example Error Response

```json
{
  "error": "Access denied",
  "success": false
}
```

---

## Role-Based Access Control

The system implements five roles with different permission levels:

### Role Hierarchy

| Role | Permissions |
|------|------------|
| **OWNER** | Full access to everything. Can manage organization, users, loans, transactions, and balances. |
| **ADMIN** | Can manage users, loans, transactions, and balances. Cannot modify organization settings. |
| **MANAGER** | Can manage loans, transactions, and balances. Cannot manage users or organization. |
| **ACCOUNTANT** | Can create and manage transactions. Can view loans and balances. Cannot manage loans or users. |
| **VIEWER** | Read-only access to all resources. Cannot create, update, or delete anything. |

### Permission Matrix

| Action | OWNER | ADMIN | MANAGER | ACCOUNTANT | VIEWER |
|--------|-------|-------|---------|------------|--------|
| Manage Organization | ✅ | ❌ | ❌ | ❌ | ❌ |
| Invite Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Member Roles | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create/Edit Loans | ✅ | ✅ | ✅ | ❌ | ❌ |
| Disburse Loans | ✅ | ✅ | ✅ | ❌ | ❌ |
| Grant Loan Access | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create Transactions | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Transactions | ✅ | ✅ | ✅ | ✅ | ❌ |
| Record Loan Payments | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create/Delete Balances | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Everything | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ |

### Loan-Specific Access

In addition to role-based permissions, loans support granular access control where MANAGERS can grant specific users access to view, edit, or delete individual loans. This is useful when you want VIEWERS or ACCOUNTANTS to access specific loans without elevating their role.

---

## Transaction Flow Examples

### Example 1: Recording Customer Payment (Income)

```bash
POST /transactions
{
  "amount": "5000.00",
  "type": "INCOME",
  "category": "Sales Revenue",
  "description": "Payment from Customer XYZ",
  "toBalanceId": "bank-account-uuid",
  "date": "2025-01-15T10:00:00Z"
}
```

**Result:**
- Bank account balance increases by R5,000
- Transaction is recorded
- Audit log is created

---

### Example 2: Paying a Supplier (Expense)

```bash
POST /transactions
{
  "amount": "3000.00",
  "type": "EXPENSE",
  "category": "Office Supplies",
  "description": "Payment to Office Depot",
  "fromBalanceId": "bank-account-uuid",
  "date": "2025-01-15T11:00:00Z"
}
```

**Result:**
- Bank account balance decreases by R3,000
- Transaction is recorded
- Audit log is created

---

### Example 3: Complete Loan Lifecycle

#### Step 1: Create Loan
```bash
POST /loans
{
  "balanceId": "loan-receivable-account-uuid",
  "borrowerName": "Jane Smith",
  "borrowerEmail": "jane@example.com",
  "principalAmount": "100000.00",
  "interestRate": "12.0",
  "termMonths": "24"
}
```

#### Step 2: Disburse Loan
```bash
POST /loans/{loanId}/disburse
{
  "amount": "100000.00",
  "fromBalanceId": "bank-account-uuid",
  "description": "Business loan disbursement"
}
```

**Result:**
- Bank account balance decreases by R100,000
- Loan status changes to ACTIVE
- Disbursement transaction is created

#### Step 3: Record Monthly Payment
```bash
POST /loans/{loanId}/payment
{
  "amount": "5000.00",
  "toBalanceId": "bank-account-uuid",
  "description": "Monthly loan payment"
}
```

**Result:**
- Bank account balance increases by R5,000
- Loan outstanding balance decreases by R5,000
- Loan total paid increases by R5,000
- Payment transaction is created

#### Step 4: Continue Until Fully Paid

When the outstanding balance reaches R0, the loan status automatically changes to "PAID".

---

## Best Practices

1. **Always use transactions** for any financial movement
2. **Never manually update balances** - let transactions handle balance updates
3. **Use appropriate transaction types** for better reporting and analytics
4. **Grant minimal permissions** - use the lowest role necessary for each user
5. **Use loan-specific access** for sensitive loans instead of elevating user roles
6. **Monitor audit logs** regularly for security and compliance
7. **Soft delete** instead of hard delete whenever possible
8. **Include descriptions** in all transactions for better record-keeping
9. **Use metadata fields** to store additional context for loans and transactions
10. **Validate balance account types** - use LOAN_RECEIVABLE for loan disbursements

---

## Support

For API support or questions, please contact your system administrator or refer to the source code documentation.

**Version:** 2.0  
**Last Updated:** January 2025
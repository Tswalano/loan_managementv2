CREATE TYPE "public"."balanceType" AS ENUM('CASH', 'BANK', 'MOBILE_MONEY', 'LOAN_RECEIVABLE');--> statement-breakpoint
CREATE TYPE "public"."loanStatus" AS ENUM('ACTIVE', 'PAID', 'DEFAULTED');--> statement-breakpoint
CREATE TYPE "public"."transactionType" AS ENUM('INCOME', 'EXPENSE', 'LOAN_PAYMENT', 'LOAN_DISBURSEMENT');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" "balanceType" NOT NULL,
	"accountReference" varchar(255) NOT NULL,
	"bankName" varchar(255) NOT NULL,
	"accountName" varchar(255) NOT NULL,
	"currentBalance" numeric DEFAULT '0' NOT NULL,
	"previousBalance" numeric DEFAULT '0' NOT NULL,
	"lastTransactionId" uuid,
	"accountStatus" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"borrowerName" varchar(255) NOT NULL,
	"amount" numeric NOT NULL,
	"interestRate" numeric NOT NULL,
	"totalInterest" numeric NOT NULL,
	"remainingBalance" numeric NOT NULL,
	"status" "loanStatus" DEFAULT 'ACTIVE' NOT NULL,
	"accountId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "monthly_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"month" numeric NOT NULL,
	"year" numeric NOT NULL,
	"totalLoans" numeric NOT NULL,
	"totalPayments" numeric NOT NULL,
	"totalIncome" numeric NOT NULL,
	"totalExpenses" numeric NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"type" "transactionType" NOT NULL,
	"category" varchar(255) NOT NULL,
	"amount" numeric NOT NULL,
	"description" text,
	"reference" text NOT NULL,
	"fromBalanceId" uuid,
	"toBalanceId" uuid,
	"balanceAfterTransaction" numeric,
	"loanId" uuid,
	"isLoanDisbursement" boolean DEFAULT false,
	"isLoanPayment" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yearly_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"year" numeric NOT NULL,
	"totalLoans" numeric NOT NULL,
	"totalPayments" numeric NOT NULL,
	"totalIncome" numeric NOT NULL,
	"totalExpenses" numeric NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "balances" ADD CONSTRAINT "balances_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "loans" ADD CONSTRAINT "loans_accountId_balances_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."balances"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monthly_reports" ADD CONSTRAINT "monthly_reports_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fromBalanceId_balances_id_fk" FOREIGN KEY ("fromBalanceId") REFERENCES "public"."balances"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_toBalanceId_balances_id_fk" FOREIGN KEY ("toBalanceId") REFERENCES "public"."balances"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_loanId_loans_id_fk" FOREIGN KEY ("loanId") REFERENCES "public"."loans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

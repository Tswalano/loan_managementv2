ALTER TABLE "balances" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "balances" ADD COLUMN "account_name" text;--> statement-breakpoint
ALTER TABLE "balances" ADD COLUMN "previous_balance" numeric(15, 2);
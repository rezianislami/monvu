ALTER TYPE "public"."asset_category" ADD VALUE 'obligasi';--> statement-breakpoint
ALTER TYPE "public"."asset_category" ADD VALUE 'custom';--> statement-breakpoint
ALTER TABLE "asset" ADD COLUMN "custom_category" text;
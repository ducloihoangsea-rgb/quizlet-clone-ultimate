CREATE TABLE "account" (
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" varchar(255),
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcard" (
	"id" serial PRIMARY KEY NOT NULL,
	"term" text DEFAULT '' NOT NULL,
	"definition" text DEFAULT '' NOT NULL,
	"position" integer NOT NULL,
	"study_set_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "folder" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "folder_to_study_set" (
	"folder_id" uuid NOT NULL,
	"study_set_id" uuid NOT NULL,
	CONSTRAINT "folder_to_study_set_folder_id_study_set_id_pk" PRIMARY KEY("folder_id","study_set_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "starred_flashcard" (
	"user_id" uuid NOT NULL,
	"flashcard_id" integer NOT NULL,
	CONSTRAINT "starred_flashcard_user_id_flashcard_id_pk" PRIMARY KEY("user_id","flashcard_id")
);
--> statement-breakpoint
CREATE TABLE "study_set" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp DEFAULT CURRENT_TIMESTAMP(3),
	"image" varchar(255),
	"password" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "class" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"school_name" text NOT NULL,
	"city_name" text NOT NULL,
	"country_name" text NOT NULL,
	"slug" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_to_study_set" (
	"class_id" uuid NOT NULL,
	"study_set_id" uuid NOT NULL,
	CONSTRAINT "class_to_study_set_class_id_study_set_id_pk" PRIMARY KEY("class_id","study_set_id")
);
--> statement-breakpoint
CREATE TABLE "class_to_folder" (
	"class_id" uuid NOT NULL,
	"folder_id" uuid NOT NULL,
	CONSTRAINT "class_to_folder_class_id_folder_id_pk" PRIMARY KEY("class_id","folder_id")
);
--> statement-breakpoint
CREATE TABLE "study_progress" (
	"user_id" uuid NOT NULL,
	"flashcard_id" integer NOT NULL,
	"flashcard_status" varchar(20) DEFAULT 'unseen' NOT NULL,
	"srs_step" integer DEFAULT 0 NOT NULL,
	"repetition" integer DEFAULT 0 NOT NULL,
	"interval" real DEFAULT 0 NOT NULL,
	"ease_factor" real DEFAULT 2.5 NOT NULL,
	"next_review_date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "study_progress_user_id_flashcard_id_pk" PRIMARY KEY("user_id","flashcard_id")
);
--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard" ADD CONSTRAINT "flashcard_study_set_id_study_set_id_fk" FOREIGN KEY ("study_set_id") REFERENCES "public"."study_set"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder" ADD CONSTRAINT "folder_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder_to_study_set" ADD CONSTRAINT "folder_to_study_set_folder_id_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folder_to_study_set" ADD CONSTRAINT "folder_to_study_set_study_set_id_study_set_id_fk" FOREIGN KEY ("study_set_id") REFERENCES "public"."study_set"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starred_flashcard" ADD CONSTRAINT "starred_flashcard_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starred_flashcard" ADD CONSTRAINT "starred_flashcard_flashcard_id_flashcard_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcard"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_set" ADD CONSTRAINT "study_set_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class" ADD CONSTRAINT "class_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_to_study_set" ADD CONSTRAINT "class_to_study_set_class_id_class_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."class"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_to_study_set" ADD CONSTRAINT "class_to_study_set_study_set_id_study_set_id_fk" FOREIGN KEY ("study_set_id") REFERENCES "public"."study_set"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_to_folder" ADD CONSTRAINT "class_to_folder_class_id_class_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."class"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_to_folder" ADD CONSTRAINT "class_to_folder_folder_id_folder_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_progress" ADD CONSTRAINT "study_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_progress" ADD CONSTRAINT "study_progress_flashcard_id_flashcard_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcard"("id") ON DELETE cascade ON UPDATE no action;
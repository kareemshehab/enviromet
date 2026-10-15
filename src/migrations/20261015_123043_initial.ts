import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_pages_scripts" AS ENUM('calculator', 'b2b', 'filters');
  CREATE TYPE "public"."enum_pages_page_type" AS ENUM('general', 'hub', 'expertise', 'product', 'guide', 'use-case', 'audience', 'tool');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_scripts" AS ENUM('calculator', 'b2b', 'filters');
  CREATE TYPE "public"."enum__pages_v_version_page_type" AS ENUM('general', 'hub', 'expertise', 'product', 'guide', 'use-case', 'audience', 'tool');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_services_related_solutions_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_services_enquiry_box_evidence_links_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_services_procurement_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_services_previous_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_services_next_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_services_brief_guide_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_services_technical_basis_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_related_solutions_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__services_v_version_enquiry_box_evidence_links_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__services_v_version_procurement_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__services_v_version_previous_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__services_v_version_next_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__services_v_version_brief_guide_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__services_v_version_technical_basis_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_published_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_projects_related_solutions_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_projects_category" AS ENUM('Wind resource assessment', 'Remote sensing', 'Power performance', 'Operation & maintenance', 'Meteorological systems');
  CREATE TYPE "public"."enum_projects_image_note" AS ENUM('Representative imagery', 'Profile graphic', 'Actual project photo');
  CREATE TYPE "public"."enum_templates_page_type" AS ENUM('general', 'hub', 'expertise', 'product', 'guide', 'use-case', 'audience', 'tool');
  CREATE TYPE "public"."enum_enquiries_status" AS ENUM('new', 'contacted', 'qualified', 'closed');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_header_nav_items_columns_links_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_nav_items_kind" AS ENUM('menu', 'link');
  CREATE TYPE "public"."enum_header_nav_items_lang" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_header_cta_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_header_language_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_columns_links_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_bottom_links_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_contact_column_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_site_settings_default_cta_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_solution_template_sections_part" AS ENUM('hero', 'coverage', 'subnav', 'solution', 'evidence', 'brief', 'businessCase', 'technicalBasis', 'extraSections', 'cta');
  CREATE TYPE "public"."enum_solution_template_enquiry_box_evidence_links_type" AS ENUM('reference', 'custom');
  CREATE TABLE "pages_scripts" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_pages_scripts",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"page_type" "enum_pages_page_type" DEFAULT 'general',
  	"menu_column" varchar,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"menu_label" varchar,
  	"layout" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_scripts" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_version_scripts",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_page_type" "enum__pages_v_version_page_type" DEFAULT 'general',
  	"version_menu_column" varchar,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_menu_label" varchar,
  	"version_layout" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "services_scope_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar
  );
  
  CREATE TABLE "services_procurement_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "services_related_solutions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_services_related_solutions_type" DEFAULT 'custom',
  	"new_tab" boolean,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "services_enquiry_box_evidence_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_services_enquiry_box_evidence_links_type" DEFAULT 'custom',
  	"new_tab" boolean,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "services_brief_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" varchar,
  	"lede" varchar,
  	"hero_image_id" integer,
  	"enquiry_key" varchar,
  	"coverage_enabled" boolean,
  	"coverage_eyebrow" varchar,
  	"coverage_value" varchar,
  	"coverage_unit" varchar,
  	"coverage_text" varchar,
  	"summary" varchar,
  	"card_image_id" integer,
  	"card_image_alt" varchar,
  	"eyebrow" varchar,
  	"solution_heading" varchar,
  	"solution_intro" varchar,
  	"standards_note" varchar,
  	"deliver_title" varchar,
  	"deliver_text" varchar,
  	"procurement_eyebrow" varchar,
  	"procurement_heading" varchar,
  	"procurement_caption" varchar,
  	"procurement_link_type" "enum_services_procurement_link_type" DEFAULT 'custom',
  	"procurement_link_new_tab" boolean,
  	"procurement_link_label" varchar,
  	"procurement_link_url" varchar,
  	"previous_link_type" "enum_services_previous_link_type" DEFAULT 'custom',
  	"previous_link_new_tab" boolean,
  	"previous_link_label" varchar,
  	"previous_link_url" varchar,
  	"next_link_type" "enum_services_next_link_type" DEFAULT 'custom',
  	"next_link_new_tab" boolean,
  	"next_link_label" varchar,
  	"next_link_url" varchar,
  	"enquiry_box_heading" varchar,
  	"enquiry_box_text" varchar,
  	"enquiry_box_button_label" varchar,
  	"enquiry_box_evidence_title" varchar,
  	"evidence_eyebrow" varchar,
  	"evidence_heading" varchar,
  	"brief_eyebrow" varchar,
  	"brief_heading" varchar,
  	"brief_body" varchar,
  	"brief_audience" varchar,
  	"brief_note" varchar,
  	"brief_guide_link_type" "enum_services_brief_guide_link_type" DEFAULT 'custom',
  	"brief_guide_link_new_tab" boolean,
  	"brief_guide_link_label" varchar,
  	"brief_guide_link_url" varchar,
  	"show_business_case" boolean,
  	"technical_basis_eyebrow" varchar,
  	"technical_basis_heading" varchar,
  	"technical_basis_body" varchar,
  	"technical_basis_link_type" "enum_services_technical_basis_link_type" DEFAULT 'custom',
  	"technical_basis_link_new_tab" boolean,
  	"technical_basis_link_label" varchar,
  	"technical_basis_link_url" varchar,
  	"extra_sections" jsonb,
  	"sort_order" numeric DEFAULT 100,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "services_locales" (
  	"title" varchar,
  	"custom_layout" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"services_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "_services_v_version_scope_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_procurement_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_related_solutions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__services_v_version_related_solutions_type" DEFAULT 'custom',
  	"new_tab" boolean,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_enquiry_box_evidence_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__services_v_version_enquiry_box_evidence_links_type" DEFAULT 'custom',
  	"new_tab" boolean,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_brief_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category" varchar,
  	"version_lede" varchar,
  	"version_hero_image_id" integer,
  	"version_enquiry_key" varchar,
  	"version_coverage_enabled" boolean,
  	"version_coverage_eyebrow" varchar,
  	"version_coverage_value" varchar,
  	"version_coverage_unit" varchar,
  	"version_coverage_text" varchar,
  	"version_summary" varchar,
  	"version_card_image_id" integer,
  	"version_card_image_alt" varchar,
  	"version_eyebrow" varchar,
  	"version_solution_heading" varchar,
  	"version_solution_intro" varchar,
  	"version_standards_note" varchar,
  	"version_deliver_title" varchar,
  	"version_deliver_text" varchar,
  	"version_procurement_eyebrow" varchar,
  	"version_procurement_heading" varchar,
  	"version_procurement_caption" varchar,
  	"version_procurement_link_type" "enum__services_v_version_procurement_link_type" DEFAULT 'custom',
  	"version_procurement_link_new_tab" boolean,
  	"version_procurement_link_label" varchar,
  	"version_procurement_link_url" varchar,
  	"version_previous_link_type" "enum__services_v_version_previous_link_type" DEFAULT 'custom',
  	"version_previous_link_new_tab" boolean,
  	"version_previous_link_label" varchar,
  	"version_previous_link_url" varchar,
  	"version_next_link_type" "enum__services_v_version_next_link_type" DEFAULT 'custom',
  	"version_next_link_new_tab" boolean,
  	"version_next_link_label" varchar,
  	"version_next_link_url" varchar,
  	"version_enquiry_box_heading" varchar,
  	"version_enquiry_box_text" varchar,
  	"version_enquiry_box_button_label" varchar,
  	"version_enquiry_box_evidence_title" varchar,
  	"version_evidence_eyebrow" varchar,
  	"version_evidence_heading" varchar,
  	"version_brief_eyebrow" varchar,
  	"version_brief_heading" varchar,
  	"version_brief_body" varchar,
  	"version_brief_audience" varchar,
  	"version_brief_note" varchar,
  	"version_brief_guide_link_type" "enum__services_v_version_brief_guide_link_type" DEFAULT 'custom',
  	"version_brief_guide_link_new_tab" boolean,
  	"version_brief_guide_link_label" varchar,
  	"version_brief_guide_link_url" varchar,
  	"version_show_business_case" boolean,
  	"version_technical_basis_eyebrow" varchar,
  	"version_technical_basis_heading" varchar,
  	"version_technical_basis_body" varchar,
  	"version_technical_basis_link_type" "enum__services_v_version_technical_basis_link_type" DEFAULT 'custom',
  	"version_technical_basis_link_new_tab" boolean,
  	"version_technical_basis_link_label" varchar,
  	"version_technical_basis_link_url" varchar,
  	"version_extra_sections" jsonb,
  	"version_sort_order" numeric DEFAULT 100,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__services_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_services_v_locales" (
  	"version_title" varchar,
  	"version_custom_layout" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"services_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "projects_scope_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "projects_related_solutions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_projects_related_solutions_type" DEFAULT 'custom',
  	"new_tab" boolean,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"category" "enum_projects_category" NOT NULL,
  	"badge" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"image_note" "enum_projects_image_note" DEFAULT 'Representative imagery',
  	"challenge" varchar NOT NULL,
  	"delivery" varchar NOT NULL,
  	"scope" varchar NOT NULL,
  	"lede" varchar DEFAULT 'Anonymized use case',
  	"media_caption" varchar DEFAULT 'Representative measurement imagery for this anonymized use case.',
  	"summary_value" varchar,
  	"summary_note" varchar,
  	"source_note" varchar,
  	"sort_order" numeric DEFAULT 100,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects_locales" (
  	"custom_layout" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "shared" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "shared_locales" (
  	"layout" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_shared_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_shared_v_locales" (
  	"version_layout" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"page_type" "enum_templates_page_type" DEFAULT 'general',
  	"sort_order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "templates_locales" (
  	"layout" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_enquiries_status" DEFAULT 'new',
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"company" varchar,
  	"service" varchar NOT NULL,
  	"stage" varchar,
  	"role" varchar,
  	"location" varchar,
  	"timing" varchar,
  	"source" varchar,
  	"requirements" varchar NOT NULL,
  	"consent" boolean DEFAULT false NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"services_id" integer,
  	"projects_id" integer,
  	"shared_id" integer,
  	"templates_id" integer,
  	"media_id" integer,
  	"enquiries_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_nav_items_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_header_nav_items_columns_links_type" DEFAULT 'custom',
  	"new_tab" boolean,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "header_nav_items_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"kind" "enum_header_nav_items_kind" DEFAULT 'menu',
  	"url" varchar,
  	"class_name" varchar,
  	"lang" "enum_header_nav_items_lang"
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_locales" (
  	"cta_type" "enum_header_cta_type" DEFAULT 'custom',
  	"cta_new_tab" boolean,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"language_link_type" "enum_header_language_link_type" DEFAULT 'custom',
  	"language_link_new_tab" boolean,
  	"language_link_label" varchar,
  	"language_link_url" varchar,
  	"show_search" boolean DEFAULT true,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"pages_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_footer_columns_links_type" DEFAULT 'custom',
  	"new_tab" boolean,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL
  );
  
  CREATE TABLE "footer_bottom_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_footer_bottom_links_type" DEFAULT 'custom',
  	"new_tab" boolean,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"tagline" varchar,
  	"linkedin_label" varchar,
  	"contact_column_heading" varchar,
  	"contact_column_locations" varchar,
  	"contact_column_link_type" "enum_footer_contact_column_link_type" DEFAULT 'custom',
  	"contact_column_link_new_tab" boolean,
  	"contact_column_link_label" varchar,
  	"contact_column_link_url" varchar,
  	"copyright_suffix" varchar DEFAULT 'All rights reserved.',
  	"back_to_top_label" varchar DEFAULT 'Back to top ↑',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"pages_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "site_settings_offices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"address" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'EnviroMET' NOT NULL,
  	"logo_id" integer NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"linkedin_url" varchar,
  	"og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"utility_text" varchar,
  	"skip_link_text" varchar DEFAULT 'Skip to content',
  	"default_cta_eyebrow" varchar,
  	"default_cta_heading" varchar,
  	"default_cta_text" varchar,
  	"default_cta_link_type" "enum_site_settings_default_cta_link_type" DEFAULT 'custom',
  	"default_cta_link_new_tab" boolean,
  	"default_cta_link_label" varchar,
  	"default_cta_link_url" varchar,
  	"title_suffix" varchar DEFAULT ' | EnviroMET',
  	"default_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"pages_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "solution_template_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"part" "enum_solution_template_sections_part" NOT NULL,
  	"hidden" boolean
  );
  
  CREATE TABLE "solution_template_enquiry_box_evidence_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_solution_template_enquiry_box_evidence_links_type" DEFAULT 'custom',
  	"new_tab" boolean,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "solution_template" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"deliver_title" varchar,
  	"deliver_text" varchar,
  	"enquiry_box_heading" varchar,
  	"enquiry_box_text" varchar,
  	"enquiry_box_button_label" varchar,
  	"enquiry_box_evidence_title" varchar,
  	"business_case_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "solution_template_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"services_id" integer
  );
  
  ALTER TABLE "pages_scripts" ADD CONSTRAINT "pages_scripts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_scripts" ADD CONSTRAINT "_pages_v_version_scripts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_scope_items" ADD CONSTRAINT "services_scope_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_procurement_rows" ADD CONSTRAINT "services_procurement_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_related_solutions" ADD CONSTRAINT "services_related_solutions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_enquiry_box_evidence_links" ADD CONSTRAINT "services_enquiry_box_evidence_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_brief_faqs" ADD CONSTRAINT "services_brief_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_card_image_id_media_id_fk" FOREIGN KEY ("card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_scope_items" ADD CONSTRAINT "_services_v_version_scope_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_procurement_rows" ADD CONSTRAINT "_services_v_version_procurement_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_related_solutions" ADD CONSTRAINT "_services_v_version_related_solutions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_enquiry_box_evidence_links" ADD CONSTRAINT "_services_v_version_enquiry_box_evidence_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_brief_faqs" ADD CONSTRAINT "_services_v_version_brief_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_card_image_id_media_id_fk" FOREIGN KEY ("version_card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_scope_items" ADD CONSTRAINT "projects_scope_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_related_solutions" ADD CONSTRAINT "projects_related_solutions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shared_locales" ADD CONSTRAINT "shared_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shared"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_shared_v" ADD CONSTRAINT "_shared_v_parent_id_shared_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."shared"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_shared_v_locales" ADD CONSTRAINT "_shared_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_shared_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "templates_locales" ADD CONSTRAINT "templates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_shared_sections_fk" FOREIGN KEY ("shared_id") REFERENCES "public"."shared"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_templates_fk" FOREIGN KEY ("templates_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_columns_links" ADD CONSTRAINT "header_nav_items_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_columns" ADD CONSTRAINT "header_nav_items_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_locales" ADD CONSTRAINT "header_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_bottom_links" ADD CONSTRAINT "footer_bottom_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_offices" ADD CONSTRAINT "site_settings_offices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solution_template_sections" ADD CONSTRAINT "solution_template_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solution_template"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solution_template_enquiry_box_evidence_links" ADD CONSTRAINT "solution_template_enquiry_box_evidence_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solution_template"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solution_template" ADD CONSTRAINT "solution_template_business_case_id_shared_id_fk" FOREIGN KEY ("business_case_id") REFERENCES "public"."shared"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solution_template_rels" ADD CONSTRAINT "solution_template_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solution_template"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solution_template_rels" ADD CONSTRAINT "solution_template_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solution_template_rels" ADD CONSTRAINT "solution_template_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_scripts_order_idx" ON "pages_scripts" USING btree ("order");
  CREATE INDEX "pages_scripts_parent_idx" ON "pages_scripts" USING btree ("parent_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_scripts_order_idx" ON "_pages_v_version_scripts" USING btree ("order");
  CREATE INDEX "_pages_v_version_scripts_parent_idx" ON "_pages_v_version_scripts" USING btree ("parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_scope_items_order_idx" ON "services_scope_items" USING btree ("_order");
  CREATE INDEX "services_scope_items_parent_id_idx" ON "services_scope_items" USING btree ("_parent_id");
  CREATE INDEX "services_procurement_rows_order_idx" ON "services_procurement_rows" USING btree ("_order");
  CREATE INDEX "services_procurement_rows_parent_id_idx" ON "services_procurement_rows" USING btree ("_parent_id");
  CREATE INDEX "services_related_solutions_order_idx" ON "services_related_solutions" USING btree ("_order");
  CREATE INDEX "services_related_solutions_parent_id_idx" ON "services_related_solutions" USING btree ("_parent_id");
  CREATE INDEX "services_enquiry_box_evidence_links_order_idx" ON "services_enquiry_box_evidence_links" USING btree ("_order");
  CREATE INDEX "services_enquiry_box_evidence_links_parent_id_idx" ON "services_enquiry_box_evidence_links" USING btree ("_parent_id");
  CREATE INDEX "services_brief_faqs_order_idx" ON "services_brief_faqs" USING btree ("_order");
  CREATE INDEX "services_brief_faqs_parent_id_idx" ON "services_brief_faqs" USING btree ("_parent_id");
  CREATE INDEX "services_hero_image_idx" ON "services" USING btree ("hero_image_id");
  CREATE INDEX "services_card_image_idx" ON "services" USING btree ("card_image_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE INDEX "services_meta_meta_image_idx" ON "services_locales" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_pages_id_idx" ON "services_rels" USING btree ("pages_id");
  CREATE INDEX "services_rels_services_id_idx" ON "services_rels" USING btree ("services_id");
  CREATE INDEX "services_rels_projects_id_idx" ON "services_rels" USING btree ("projects_id");
  CREATE INDEX "_services_v_version_scope_items_order_idx" ON "_services_v_version_scope_items" USING btree ("_order");
  CREATE INDEX "_services_v_version_scope_items_parent_id_idx" ON "_services_v_version_scope_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_procurement_rows_order_idx" ON "_services_v_version_procurement_rows" USING btree ("_order");
  CREATE INDEX "_services_v_version_procurement_rows_parent_id_idx" ON "_services_v_version_procurement_rows" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_related_solutions_order_idx" ON "_services_v_version_related_solutions" USING btree ("_order");
  CREATE INDEX "_services_v_version_related_solutions_parent_id_idx" ON "_services_v_version_related_solutions" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_enquiry_box_evidence_links_order_idx" ON "_services_v_version_enquiry_box_evidence_links" USING btree ("_order");
  CREATE INDEX "_services_v_version_enquiry_box_evidence_links_parent_id_idx" ON "_services_v_version_enquiry_box_evidence_links" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_brief_faqs_order_idx" ON "_services_v_version_brief_faqs" USING btree ("_order");
  CREATE INDEX "_services_v_version_brief_faqs_parent_id_idx" ON "_services_v_version_brief_faqs" USING btree ("_parent_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_hero_image_idx" ON "_services_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_services_v_version_version_card_image_idx" ON "_services_v" USING btree ("version_card_image_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_snapshot_idx" ON "_services_v" USING btree ("snapshot");
  CREATE INDEX "_services_v_published_locale_idx" ON "_services_v" USING btree ("published_locale");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE INDEX "_services_v_autosave_idx" ON "_services_v" USING btree ("autosave");
  CREATE INDEX "_services_v_version_meta_version_meta_image_idx" ON "_services_v_locales" USING btree ("version_meta_image_id");
  CREATE UNIQUE INDEX "_services_v_locales_locale_parent_id_unique" ON "_services_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_rels_order_idx" ON "_services_v_rels" USING btree ("order");
  CREATE INDEX "_services_v_rels_parent_idx" ON "_services_v_rels" USING btree ("parent_id");
  CREATE INDEX "_services_v_rels_path_idx" ON "_services_v_rels" USING btree ("path");
  CREATE INDEX "_services_v_rels_pages_id_idx" ON "_services_v_rels" USING btree ("pages_id");
  CREATE INDEX "_services_v_rels_services_id_idx" ON "_services_v_rels" USING btree ("services_id");
  CREATE INDEX "_services_v_rels_projects_id_idx" ON "_services_v_rels" USING btree ("projects_id");
  CREATE INDEX "projects_scope_items_order_idx" ON "projects_scope_items" USING btree ("_order");
  CREATE INDEX "projects_scope_items_parent_id_idx" ON "projects_scope_items" USING btree ("_parent_id");
  CREATE INDEX "projects_related_solutions_order_idx" ON "projects_related_solutions" USING btree ("_order");
  CREATE INDEX "projects_related_solutions_parent_id_idx" ON "projects_related_solutions" USING btree ("_parent_id");
  CREATE INDEX "projects_image_idx" ON "projects" USING btree ("image_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects_meta_meta_image_idx" ON "projects_locales" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_pages_id_idx" ON "projects_rels" USING btree ("pages_id");
  CREATE INDEX "projects_rels_services_id_idx" ON "projects_rels" USING btree ("services_id");
  CREATE INDEX "shared_updated_at_idx" ON "shared" USING btree ("updated_at");
  CREATE INDEX "shared_created_at_idx" ON "shared" USING btree ("created_at");
  CREATE UNIQUE INDEX "shared_locales_locale_parent_id_unique" ON "shared_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_shared_v_parent_idx" ON "_shared_v" USING btree ("parent_id");
  CREATE INDEX "_shared_v_version_version_updated_at_idx" ON "_shared_v" USING btree ("version_updated_at");
  CREATE INDEX "_shared_v_version_version_created_at_idx" ON "_shared_v" USING btree ("version_created_at");
  CREATE INDEX "_shared_v_created_at_idx" ON "_shared_v" USING btree ("created_at");
  CREATE INDEX "_shared_v_updated_at_idx" ON "_shared_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_shared_v_locales_locale_parent_id_unique" ON "_shared_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "templates_updated_at_idx" ON "templates" USING btree ("updated_at");
  CREATE INDEX "templates_created_at_idx" ON "templates" USING btree ("created_at");
  CREATE UNIQUE INDEX "templates_locales_locale_parent_id_unique" ON "templates_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_shared_id_idx" ON "payload_locked_documents_rels" USING btree ("shared_id");
  CREATE INDEX "payload_locked_documents_rels_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("templates_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "header_nav_items_columns_links_order_idx" ON "header_nav_items_columns_links" USING btree ("_order");
  CREATE INDEX "header_nav_items_columns_links_parent_id_idx" ON "header_nav_items_columns_links" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_columns_links_locale_idx" ON "header_nav_items_columns_links" USING btree ("_locale");
  CREATE INDEX "header_nav_items_columns_order_idx" ON "header_nav_items_columns" USING btree ("_order");
  CREATE INDEX "header_nav_items_columns_parent_id_idx" ON "header_nav_items_columns" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_columns_locale_idx" ON "header_nav_items_columns" USING btree ("_locale");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_locale_idx" ON "header_nav_items" USING btree ("_locale");
  CREATE UNIQUE INDEX "header_locales_locale_parent_id_unique" ON "header_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_locale_idx" ON "header_rels" USING btree ("locale");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id","locale");
  CREATE INDEX "header_rels_services_id_idx" ON "header_rels" USING btree ("services_id","locale");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_links_locale_idx" ON "footer_columns_links" USING btree ("_locale");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_locale_idx" ON "footer_columns" USING btree ("_locale");
  CREATE INDEX "footer_bottom_links_order_idx" ON "footer_bottom_links" USING btree ("_order");
  CREATE INDEX "footer_bottom_links_parent_id_idx" ON "footer_bottom_links" USING btree ("_parent_id");
  CREATE INDEX "footer_bottom_links_locale_idx" ON "footer_bottom_links" USING btree ("_locale");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_locale_idx" ON "footer_rels" USING btree ("locale");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id","locale");
  CREATE INDEX "footer_rels_services_id_idx" ON "footer_rels" USING btree ("services_id","locale");
  CREATE INDEX "site_settings_offices_order_idx" ON "site_settings_offices" USING btree ("_order");
  CREATE INDEX "site_settings_offices_parent_id_idx" ON "site_settings_offices" USING btree ("_parent_id");
  CREATE INDEX "site_settings_offices_locale_idx" ON "site_settings_offices" USING btree ("_locale");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_og_image_idx" ON "site_settings" USING btree ("og_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_locale_idx" ON "site_settings_rels" USING btree ("locale");
  CREATE INDEX "site_settings_rels_pages_id_idx" ON "site_settings_rels" USING btree ("pages_id","locale");
  CREATE INDEX "site_settings_rels_services_id_idx" ON "site_settings_rels" USING btree ("services_id","locale");
  CREATE INDEX "solution_template_sections_order_idx" ON "solution_template_sections" USING btree ("_order");
  CREATE INDEX "solution_template_sections_parent_id_idx" ON "solution_template_sections" USING btree ("_parent_id");
  CREATE INDEX "solution_template_enquiry_box_evidence_links_order_idx" ON "solution_template_enquiry_box_evidence_links" USING btree ("_order");
  CREATE INDEX "solution_template_enquiry_box_evidence_links_parent_id_idx" ON "solution_template_enquiry_box_evidence_links" USING btree ("_parent_id");
  CREATE INDEX "solution_template_business_case_idx" ON "solution_template" USING btree ("business_case_id");
  CREATE INDEX "solution_template_rels_order_idx" ON "solution_template_rels" USING btree ("order");
  CREATE INDEX "solution_template_rels_parent_idx" ON "solution_template_rels" USING btree ("parent_id");
  CREATE INDEX "solution_template_rels_path_idx" ON "solution_template_rels" USING btree ("path");
  CREATE INDEX "solution_template_rels_pages_id_idx" ON "solution_template_rels" USING btree ("pages_id");
  CREATE INDEX "solution_template_rels_services_id_idx" ON "solution_template_rels" USING btree ("services_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_scripts" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_version_scripts" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "services_scope_items" CASCADE;
  DROP TABLE "services_procurement_rows" CASCADE;
  DROP TABLE "services_related_solutions" CASCADE;
  DROP TABLE "services_enquiry_box_evidence_links" CASCADE;
  DROP TABLE "services_brief_faqs" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "services_rels" CASCADE;
  DROP TABLE "_services_v_version_scope_items" CASCADE;
  DROP TABLE "_services_v_version_procurement_rows" CASCADE;
  DROP TABLE "_services_v_version_related_solutions" CASCADE;
  DROP TABLE "_services_v_version_enquiry_box_evidence_links" CASCADE;
  DROP TABLE "_services_v_version_brief_faqs" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_locales" CASCADE;
  DROP TABLE "_services_v_rels" CASCADE;
  DROP TABLE "projects_scope_items" CASCADE;
  DROP TABLE "projects_related_solutions" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "shared" CASCADE;
  DROP TABLE "shared_locales" CASCADE;
  DROP TABLE "_shared_v" CASCADE;
  DROP TABLE "_shared_v_locales" CASCADE;
  DROP TABLE "templates" CASCADE;
  DROP TABLE "templates_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "header_nav_items_columns_links" CASCADE;
  DROP TABLE "header_nav_items_columns" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_locales" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_bottom_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TABLE "site_settings_offices" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  DROP TABLE "solution_template_sections" CASCADE;
  DROP TABLE "solution_template_enquiry_box_evidence_links" CASCADE;
  DROP TABLE "solution_template" CASCADE;
  DROP TABLE "solution_template_rels" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pages_scripts";
  DROP TYPE "public"."enum_pages_page_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_scripts";
  DROP TYPE "public"."enum__pages_v_version_page_type";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_services_related_solutions_type";
  DROP TYPE "public"."enum_services_enquiry_box_evidence_links_type";
  DROP TYPE "public"."enum_services_procurement_link_type";
  DROP TYPE "public"."enum_services_previous_link_type";
  DROP TYPE "public"."enum_services_next_link_type";
  DROP TYPE "public"."enum_services_brief_guide_link_type";
  DROP TYPE "public"."enum_services_technical_basis_link_type";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_related_solutions_type";
  DROP TYPE "public"."enum__services_v_version_enquiry_box_evidence_links_type";
  DROP TYPE "public"."enum__services_v_version_procurement_link_type";
  DROP TYPE "public"."enum__services_v_version_previous_link_type";
  DROP TYPE "public"."enum__services_v_version_next_link_type";
  DROP TYPE "public"."enum__services_v_version_brief_guide_link_type";
  DROP TYPE "public"."enum__services_v_version_technical_basis_link_type";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum__services_v_published_locale";
  DROP TYPE "public"."enum_projects_related_solutions_type";
  DROP TYPE "public"."enum_projects_category";
  DROP TYPE "public"."enum_projects_image_note";
  DROP TYPE "public"."enum_templates_page_type";
  DROP TYPE "public"."enum_enquiries_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_header_nav_items_columns_links_type";
  DROP TYPE "public"."enum_header_nav_items_kind";
  DROP TYPE "public"."enum_header_nav_items_lang";
  DROP TYPE "public"."enum_header_cta_type";
  DROP TYPE "public"."enum_header_language_link_type";
  DROP TYPE "public"."enum_footer_columns_links_type";
  DROP TYPE "public"."enum_footer_bottom_links_type";
  DROP TYPE "public"."enum_footer_contact_column_link_type";
  DROP TYPE "public"."enum_site_settings_default_cta_link_type";
  DROP TYPE "public"."enum_solution_template_sections_part";
  DROP TYPE "public"."enum_solution_template_enquiry_box_evidence_links_type";`)
}

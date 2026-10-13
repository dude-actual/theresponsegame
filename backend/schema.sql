-- The Response Game | proposed Supabase/PostgreSQL foundation, v1.0
-- REVIEW SCAFFOLD: not applied to a project and not production-security tested.
-- Requires Supabase auth.uid(), auth.users, authenticated/anon/service_role roles.
-- Direct clients are READ ONLY. Writes require an independently authorized server
-- command layer; never ship service_role credentials in the browser.
BEGIN;
CREATE TABLE public.trg_organizations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL,
 state text NOT NULL DEFAULT 'setup' CHECK (state IN ('setup','pilot','active','suspended','closed')),
 timezone text NOT NULL DEFAULT 'UTC', policy_version integer NOT NULL DEFAULT 1,
 delivery_hold boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.trg_memberships (
 organization_id uuid NOT NULL REFERENCES public.trg_organizations(id),
 user_id uuid NOT NULL REFERENCES auth.users(id),
 app_role text NOT NULL CHECK (app_role IN ('owner','admin','program_manager','content_reviewer','evaluator','participant','auditor')),
 active boolean NOT NULL DEFAULT true, source_system text NOT NULL, source_version text,
 updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(organization_id,user_id)
);
CREATE TABLE public.trg_people (
 organization_id uuid NOT NULL REFERENCES public.trg_organizations(id), id uuid NOT NULL DEFAULT gen_random_uuid(),
 source_system text NOT NULL, external_id text NOT NULL, auth_user_id uuid REFERENCES auth.users(id),
 display_name text NOT NULL, business_email text, active boolean NOT NULL DEFAULT true,
 timezone text NOT NULL DEFAULT 'UTC', attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
 source_updated_at timestamptz, PRIMARY KEY(organization_id,id),
 UNIQUE(organization_id,source_system,external_id), UNIQUE(organization_id,auth_user_id)
);
CREATE TABLE public.trg_groups (
 organization_id uuid NOT NULL REFERENCES public.trg_organizations(id), id uuid NOT NULL DEFAULT gen_random_uuid(),
 name text NOT NULL, source_kind text NOT NULL CHECK(source_kind IN('manual','directory','rule')),
 rule_version jsonb, PRIMARY KEY(organization_id,id)
);
CREATE TABLE public.trg_group_members (
 organization_id uuid NOT NULL, group_id uuid NOT NULL, person_id uuid NOT NULL,
 PRIMARY KEY(organization_id,group_id,person_id),
 FOREIGN KEY(organization_id,group_id) REFERENCES public.trg_groups(organization_id,id),
 FOREIGN KEY(organization_id,person_id) REFERENCES public.trg_people(organization_id,id)
);
CREATE TABLE public.trg_plan_versions (
 organization_id uuid NOT NULL REFERENCES public.trg_organizations(id), id uuid NOT NULL DEFAULT gen_random_uuid(),
 title text NOT NULL, version_label text NOT NULL, source_hash text NOT NULL,
 storage_key text NOT NULL, classification text NOT NULL, source_owner text NOT NULL,
 effective_at timestamptz, retired_at timestamptz, PRIMARY KEY(organization_id,id)
);
CREATE TABLE public.trg_requirements (
 organization_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), plan_version_id uuid NOT NULL,
 source_location text NOT NULL, source_quote text NOT NULL, interpretation text NOT NULL,
 role_scope text NOT NULL, capability text NOT NULL, review_state text NOT NULL DEFAULT 'pending',
 approved_by uuid REFERENCES auth.users(id), approved_at timestamptz,
 PRIMARY KEY(organization_id,id),
 FOREIGN KEY(organization_id,plan_version_id) REFERENCES public.trg_plan_versions(organization_id,id),
 CHECK(review_state IN('pending','approved','conflict','retired')),
 CHECK(review_state <> 'approved' OR (approved_by IS NOT NULL AND approved_at IS NOT NULL))
);
-- Tenant-specific licensed snapshots; a global publishing catalog is a separate service.
CREATE TABLE public.trg_scenario_versions (
 organization_id uuid NOT NULL REFERENCES public.trg_organizations(id), id uuid NOT NULL DEFAULT gen_random_uuid(),
 scenario_key text NOT NULL, version text NOT NULL, capability text NOT NULL,
 definition jsonb NOT NULL, definition_hash text NOT NULL,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN('draft','review','approved','released','retired')),
 PRIMARY KEY(organization_id,id), UNIQUE(organization_id,scenario_key,version)
);
CREATE TABLE public.trg_configurations (
 organization_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), scenario_version_id uuid NOT NULL,
 requirement_id uuid, revision integer NOT NULL CHECK(revision>0), configuration jsonb NOT NULL,
 approval_state text NOT NULL DEFAULT 'draft' CHECK(approval_state IN('draft','review','approved','retired')),
 approved_by uuid REFERENCES auth.users(id), approved_at timestamptz,
 PRIMARY KEY(organization_id,id),
 FOREIGN KEY(organization_id,scenario_version_id) REFERENCES public.trg_scenario_versions(organization_id,id),
 FOREIGN KEY(organization_id,requirement_id) REFERENCES public.trg_requirements(organization_id,id),
 CHECK(approval_state <> 'approved' OR (approved_by IS NOT NULL AND approved_at IS NOT NULL))
);
CREATE TABLE public.trg_campaigns (
 organization_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), configuration_id uuid NOT NULL,
 name text NOT NULL, status text NOT NULL DEFAULT 'draft' CHECK(status IN('draft','approved','scheduled','running','paused','stopped','closed')),
 audience_rule jsonb NOT NULL, schedule_policy jsonb NOT NULL,
 PRIMARY KEY(organization_id,id),
 FOREIGN KEY(organization_id,configuration_id) REFERENCES public.trg_configurations(organization_id,id)
);
CREATE TABLE public.trg_assignments (
 organization_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), campaign_id uuid NOT NULL, person_id uuid NOT NULL,
 eligibility_snapshot jsonb NOT NULL, status text NOT NULL DEFAULT 'pending',
 PRIMARY KEY(organization_id,id), UNIQUE(organization_id,campaign_id,person_id),
 FOREIGN KEY(organization_id,campaign_id) REFERENCES public.trg_campaigns(organization_id,id),
 FOREIGN KEY(organization_id,person_id) REFERENCES public.trg_people(organization_id,id)
);
CREATE TABLE public.trg_sessions (
 organization_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), assignment_id uuid NOT NULL,
 participant_user_id uuid NOT NULL REFERENCES auth.users(id), snapshot jsonb NOT NULL,
 status text NOT NULL DEFAULT 'not_started' CHECK(status IN('not_started','active','paused','stopped','expired','completed','invalidated')),
 state_version bigint NOT NULL DEFAULT 0 CHECK(state_version>=0), state jsonb NOT NULL DEFAULT '{}'::jsonb,
 prior_session_id uuid, created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
 PRIMARY KEY(organization_id,id),
 FOREIGN KEY(organization_id,assignment_id) REFERENCES public.trg_assignments(organization_id,id),
 FOREIGN KEY(organization_id,prior_session_id) REFERENCES public.trg_sessions(organization_id,id)
);
CREATE TABLE public.trg_events (
 organization_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), session_id uuid NOT NULL,
 sequence bigint NOT NULL CHECK(sequence>0), event_type text NOT NULL, actor_user_id uuid REFERENCES auth.users(id),
 idempotency_key text NOT NULL, occurred_at timestamptz, received_at timestamptz NOT NULL DEFAULT now(),
 payload jsonb NOT NULL, PRIMARY KEY(organization_id,id),
 UNIQUE(organization_id,session_id,sequence), UNIQUE(organization_id,session_id,id), UNIQUE(organization_id,idempotency_key),
 FOREIGN KEY(organization_id,session_id) REFERENCES public.trg_sessions(organization_id,id)
);
CREATE TABLE public.trg_evidence (
 organization_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), session_id uuid NOT NULL, event_id uuid NOT NULL,
 evidence_class text NOT NULL CHECK(evidence_class IN('rule_event','self_report','submitted_artifact','verified_callback','human_observation')),
 storage_key text, content_hash text, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 PRIMARY KEY(organization_id,id), UNIQUE(organization_id,session_id,id),
 FOREIGN KEY(organization_id,session_id) REFERENCES public.trg_sessions(organization_id,id),
 FOREIGN KEY(organization_id,session_id,event_id) REFERENCES public.trg_events(organization_id,session_id,id)
);
CREATE TABLE public.trg_observations (
 organization_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), session_id uuid NOT NULL, evidence_id uuid NOT NULL,
 criterion_key text NOT NULL, rubric_version text NOT NULL,
 result text NOT NULL CHECK(result IN('not_observed','met','partially_met','unmet','pending_review')),
 rationale text NOT NULL, reviewer_user_id uuid REFERENCES auth.users(id), published_to_participant boolean NOT NULL DEFAULT false,
 PRIMARY KEY(organization_id,id),
 FOREIGN KEY(organization_id,session_id) REFERENCES public.trg_sessions(organization_id,id),
 FOREIGN KEY(organization_id,session_id,evidence_id) REFERENCES public.trg_evidence(organization_id,session_id,id)
);
CREATE TABLE public.trg_actions (
 organization_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), observation_id uuid NOT NULL,
 title text NOT NULL, cause_category text NOT NULL DEFAULT 'undetermined', owner_person_id uuid, due_at timestamptz,
 status text NOT NULL DEFAULT 'open' CHECK(status IN('open','in_progress','ready_for_review','verified','reopened','retired')),
 verification_evidence_id uuid, reviewer_user_id uuid REFERENCES auth.users(id), retest_session_id uuid,
 PRIMARY KEY(organization_id,id),
 FOREIGN KEY(organization_id,observation_id) REFERENCES public.trg_observations(organization_id,id),
 FOREIGN KEY(organization_id,owner_person_id) REFERENCES public.trg_people(organization_id,id),
 FOREIGN KEY(organization_id,verification_evidence_id) REFERENCES public.trg_evidence(organization_id,id),
 FOREIGN KEY(organization_id,retest_session_id) REFERENCES public.trg_sessions(organization_id,id),
 CHECK(status <> 'verified' OR (owner_person_id IS NOT NULL AND due_at IS NOT NULL AND verification_evidence_id IS NOT NULL AND reviewer_user_id IS NOT NULL))
);
CREATE TABLE public.trg_channel_consents (
 organization_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), person_id uuid NOT NULL,
 channel text NOT NULL, scope text NOT NULL, allowed boolean NOT NULL,
 source text NOT NULL, policy_version text NOT NULL, occurred_at timestamptz NOT NULL,
 PRIMARY KEY(organization_id,id), FOREIGN KEY(organization_id,person_id) REFERENCES public.trg_people(organization_id,id)
);
CREATE TABLE public.trg_outbox (
 organization_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), session_id uuid NOT NULL,
 recipient_person_id uuid NOT NULL, channel text NOT NULL, state_version bigint NOT NULL,
 idempotency_key text NOT NULL, due_at timestamptz NOT NULL, payload jsonb NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN('pending','claimed','sent','retry','canceled','dead_letter')),
 attempts integer NOT NULL DEFAULT 0 CHECK(attempts>=0),
 PRIMARY KEY(organization_id,id), UNIQUE(organization_id,idempotency_key),
 FOREIGN KEY(organization_id,session_id) REFERENCES public.trg_sessions(organization_id,id),
 FOREIGN KEY(organization_id,recipient_person_id) REFERENCES public.trg_people(organization_id,id)
);
CREATE TABLE public.trg_receipts (
 organization_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), outbox_id uuid NOT NULL,
 provider text NOT NULL, provider_event_id text NOT NULL, status text NOT NULL,
 provider_at timestamptz, received_at timestamptz NOT NULL DEFAULT now(), payload jsonb NOT NULL,
 PRIMARY KEY(organization_id,id), UNIQUE(organization_id,provider,provider_event_id),
 FOREIGN KEY(organization_id,outbox_id) REFERENCES public.trg_outbox(organization_id,id)
);
CREATE TABLE public.trg_audit (
 organization_id uuid NOT NULL REFERENCES public.trg_organizations(id), id uuid NOT NULL DEFAULT gen_random_uuid(),
 actor_user_id uuid REFERENCES auth.users(id), operation text NOT NULL, target_type text NOT NULL,
 target_id text, at timestamptz NOT NULL DEFAULT now(), details jsonb NOT NULL,
 PRIMARY KEY(organization_id,id)
);
-- No exposed SECURITY DEFINER helpers or user-editable JWT role claims.
-- Membership SELECT is deliberately self-only, avoiding recursive membership policies.
ALTER TABLE public.trg_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_membership ON public.trg_memberships FOR SELECT TO authenticated
 USING(user_id=(SELECT auth.uid()));
ALTER TABLE public.trg_organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY member_organization ON public.trg_organizations FOR SELECT TO authenticated
 USING(EXISTS(SELECT 1 FROM public.trg_memberships m WHERE m.organization_id=id AND m.user_id=(SELECT auth.uid()) AND m.active));
-- Server-authorized command writes only. All browser roles have SELECT only, governed below.
DO $$
DECLARE t text;
BEGIN
 FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'trg\_%' ESCAPE '\' LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated',t);
  EXECUTE format('GRANT SELECT ON public.%I TO authenticated',t);
  EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON public.%I TO service_role',t);
 END LOOP;
END $$;
-- Management-only collections. Read-only auditor/evaluator scope is intentionally limited;
-- a later server endpoint may return further redacted or assignment-scoped projections.
DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['trg_groups','trg_group_members','trg_plan_versions','trg_requirements','trg_scenario_versions','trg_configurations','trg_campaigns','trg_assignments','trg_actions'] LOOP
  EXECUTE format('CREATE POLICY staff_read ON public.%I FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.trg_memberships m WHERE m.organization_id=%I.organization_id AND m.user_id=(SELECT auth.uid()) AND m.active AND m.app_role IN (''owner'',''admin'',''program_manager'',''content_reviewer'',''evaluator'',''auditor'')))',t,t);
 END LOOP;
END $$;
CREATE POLICY people_read ON public.trg_people FOR SELECT TO authenticated USING(
 EXISTS(SELECT 1 FROM public.trg_memberships m WHERE m.organization_id=trg_people.organization_id AND m.user_id=(SELECT auth.uid()) AND m.active
 AND (m.app_role IN('owner','admin','program_manager') OR trg_people.auth_user_id=(SELECT auth.uid()))));
CREATE POLICY session_read ON public.trg_sessions FOR SELECT TO authenticated USING(
 EXISTS(SELECT 1 FROM public.trg_memberships m WHERE m.organization_id=trg_sessions.organization_id AND m.user_id=(SELECT auth.uid()) AND m.active
 AND (m.app_role IN('owner','admin','program_manager','evaluator','auditor') OR participant_user_id=(SELECT auth.uid()))));
DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['trg_events','trg_evidence'] LOOP
  EXECUTE format('CREATE POLICY staff_evidence ON public.%I FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.trg_memberships m WHERE m.organization_id=%I.organization_id AND m.user_id=(SELECT auth.uid()) AND m.active AND m.app_role IN (''owner'',''admin'',''program_manager'',''evaluator'',''auditor'')))',t,t);
 END LOOP;
END $$;
CREATE POLICY observation_read ON public.trg_observations FOR SELECT TO authenticated USING(
 EXISTS(SELECT 1 FROM public.trg_sessions s WHERE s.organization_id=trg_observations.organization_id AND s.id=session_id)
 AND (published_to_participant OR EXISTS(SELECT 1 FROM public.trg_memberships m WHERE m.organization_id=trg_observations.organization_id AND m.user_id=(SELECT auth.uid()) AND m.active AND m.app_role IN('owner','admin','program_manager','evaluator','auditor'))));
-- Do not expose hidden scoring keys or unreleased injects through session snapshots.
REVOKE SELECT ON public.trg_sessions FROM authenticated;
GRANT SELECT(organization_id,id,assignment_id,participant_user_id,status,state_version,prior_session_id,created_at,completed_at) ON public.trg_sessions TO authenticated;
-- Participant task state and evidence are redacted by the authorized command/read gateway.
-- No authenticated SELECT policy on consent, outbox, receipts or audit: deny by default.
-- Expose narrow authorized operational views via server only; never leak destinations/payloads.
CREATE FUNCTION public.trg_reject_mutation() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
 SET search_path=pg_catalog AS $$ BEGIN RAISE EXCEPTION 'Append-only record; use a superseding event and approved retention workflow'; END $$;
REVOKE ALL ON FUNCTION public.trg_reject_mutation() FROM PUBLIC, anon, authenticated;
DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['trg_events','trg_evidence','trg_observations','trg_channel_consents','trg_receipts','trg_audit'] LOOP
  EXECUTE format('CREATE TRIGGER immutable_record BEFORE UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trg_reject_mutation()',t);
 END LOOP;
END $$;
CREATE INDEX trg_memberships_user ON public.trg_memberships(user_id,organization_id) WHERE active;
CREATE INDEX trg_sessions_participant ON public.trg_sessions(participant_user_id,organization_id);
CREATE INDEX trg_outbox_due ON public.trg_outbox(due_at) WHERE status IN('pending','retry');
CREATE INDEX trg_consent_latest ON public.trg_channel_consents(organization_id,person_id,channel,occurred_at DESC);
COMMIT;
-- Required before production: authenticated command gateway, transaction/state locks,
-- membership and approval checks on EVERY write, source/role compatibility, private storage
-- policies, jurisdiction/consent policy, reviewer authorization, retention/legal-hold workflow,
-- pgTAP cross-tenant tests, advisors, performance review and backup/restore evidence.

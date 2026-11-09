CREATE TABLE public.questionnaire_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 student_uid text NOT NULL REFERENCES public.students(uid) ON DELETE CASCADE,
 owner_id uuid NOT NULL DEFAULT auth.uid(),
 template_version text NOT NULL DEFAULT 'jiangsu-health-2026',
 answers jsonb NOT NULL,
 identity jsonb NOT NULL,
 signature_present boolean,
 original_path text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.questionnaire_records TO authenticated;
GRANT ALL ON public.questionnaire_records TO service_role;
ALTER TABLE public.questionnaire_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY questionnaire_owner_read ON public.questionnaire_records FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY questionnaire_owner_insert ON public.questionnaire_records FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE INDEX questionnaire_student_idx ON public.questionnaire_records(student_uid, created_at DESC);
CREATE TABLE public.questionnaire_ai_blocks (
 user_id uuid PRIMARY KEY,
 reason text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.questionnaire_ai_blocks TO authenticated;
GRANT ALL ON public.questionnaire_ai_blocks TO service_role;
ALTER TABLE public.questionnaire_ai_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY questionnaire_block_owner ON public.questionnaire_ai_blocks FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY questionnaire_original_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'questionnaire-originals' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY questionnaire_original_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'questionnaire-originals' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY questionnaire_original_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'questionnaire-originals' AND (storage.foldername(name))[1] = auth.uid()::text);
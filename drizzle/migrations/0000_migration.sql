CREATE TABLE public.students (
  uid text PRIMARY KEY,
  school text NOT NULL,
  sno text NOT NULL,
  name text NOT NULL,
  gender text NOT NULL,
  grade text NOT NULL,
  cls text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school, sno)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO anon, authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open access students" ON public.students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_uid text NOT NULL REFERENCES public.students(uid) ON DELETE CASCADE,
  station_id text NOT NULL,
  doctor text,
  item_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  crit_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_uid, station_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_results TO anon, authenticated;
GRANT ALL ON public.exam_results TO service_role;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prototype open access exam_results" ON public.exam_results FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.students (uid, school, sno, name, gender, grade, cls) VALUES
('320102010303030110','阳光小学','20230301','李小阳','男','三年级','3班'),
('320102010303030220','阳光小学','20230302','王小雨','女','三年级','3班'),
('320102010303030310','阳光小学','20230303','张子涵','男','三年级','3班'),
('320102010303030420','阳光小学','20230304','陈可欣','女','三年级','3班'),
('320102010303030510','阳光小学','20230305','刘浩然','男','三年级','3班'),
('320102020201010120','春晖小学','20220101','赵一诺','女','二年级','1班'),
('320102020201010210','春晖小学','20220102','孙思远','男','二年级','1班');
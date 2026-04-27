-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── COURSES ─────────────────────────────────────────────────────────────────
create table courses (
  id          uuid primary key default gen_random_uuid(),
  date        date not null unique,
  title       text,
  status      text not null default 'draft' check (status in ('draft', 'published')),
  created_at  timestamptz not null default now()
);

-- ─── IMAGES ──────────────────────────────────────────────────────────────────
create table images (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses(id) on delete cascade,
  storage_path  text not null,
  captured_at   timestamptz not null,
  processed     boolean not null default false,
  type          text not null default 'unknown' check (type in ('vocab', 'grammar', 'unknown')),
  created_at    timestamptz not null default now()
);

create index images_course_id_idx on images(course_id);
create index images_captured_at_idx on images(captured_at);

-- ─── FLASHCARDS ──────────────────────────────────────────────────────────────
create table flashcards (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references courses(id) on delete cascade,
  image_id        uuid references images(id) on delete set null,
  word_de         text not null,
  translation_en  text not null,
  translation_uk  text not null,
  example_de      text,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now()
);

create index flashcards_course_id_idx on flashcards(course_id);

-- ─── GRAMMAR NOTES ───────────────────────────────────────────────────────────
create table grammar_notes (
  id             uuid primary key default gen_random_uuid(),
  course_id      uuid not null references courses(id) on delete cascade,
  image_id       uuid references images(id) on delete set null,
  title          text not null,
  explanation    text not null,
  structure      text,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now()
);

create index grammar_notes_course_id_idx on grammar_notes(course_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
alter table courses enable row level security;
alter table images enable row level security;
alter table flashcards enable row level security;
alter table grammar_notes enable row level security;

-- Published courses and their content are readable by anyone
create policy "published courses are public"
  on courses for select
  using (status = 'published');

create policy "flashcards of published courses are public"
  on flashcards for select
  using (
    exists (select 1 from courses c where c.id = course_id and c.status = 'published')
  );

create policy "grammar of published courses are public"
  on grammar_notes for select
  using (
    exists (select 1 from courses c where c.id = course_id and c.status = 'published')
  );

-- Anyone can insert images (upload link is public)
create policy "anyone can upload images"
  on images for insert
  with check (true);

-- Anyone can insert courses (needed to auto-create draft on first upload of the day)
create policy "anyone can upsert courses"
  on courses for insert
  with check (true);

-- Service role (used by admin API routes with service key) bypasses RLS entirely
-- Admin select/update/delete uses service role key — no additional policies needed for those

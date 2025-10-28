-- reports テーブルに reason カラム追加
alter table public.reports add column if not exists reason text;

comment on column public.reports.reason is '通報理由: illegal, discrimination, copyright, spam, other';

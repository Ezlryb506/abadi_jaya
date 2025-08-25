-- =====================================================
-- VERIFICATION SCRIPT - Database Abadi Jaya (PostgreSQL/Supabase)
-- Jalankan di Supabase SQL Editor. Script ini hanya READ.
-- =====================================================

-- 1) Tabel yang diharapkan ada
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'customers','product_categories','products',
    'transactions','payment_history','project_updates','admin_users','reviews'
  )
order by table_name;

-- 2) Enum dan urutan nilainya
select t.typname as enum_name, e.enumsortorder, e.enumlabel
from pg_type t
join pg_enum e on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
  and t.typname in ('payment_method_enum','project_status_enum')
order by enum_name, e.enumsortorder;

-- 3) Kolom per tabel (semua tabel target)
select table_name, column_name, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'customers','product_categories','products',
    'transactions','payment_history','project_updates','admin_users','reviews'
  )
order by table_name, ordinal_position;

-- 4) Constraints (PK/FK/CHECK) per tabel target
select rel.relname as table_name, con.conname, con.contype,
       pg_get_constraintdef(con.oid) as definition
from pg_constraint con
join pg_class rel on rel.oid = con.conrelid
join pg_namespace n on n.oid = rel.relnamespace
where n.nspname = 'public'
  and rel.relname in (
    'customers','product_categories','products',
    'transactions','payment_history','project_updates','admin_users','reviews'
  )
order by table_name, conname;

-- 5) Indexes untuk tabel target
select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in (
    'customers','product_categories','products',
    'transactions','payment_history','project_updates','admin_users','reviews'
  )
order by tablename, indexname;

-- 6) Triggers & definisinya (non-internal)
select c.relname as table_name,
       tg.tgname as trigger_name,
       pg_get_triggerdef(tg.oid) as trigger_def
from pg_trigger tg
join pg_class c on c.oid = tg.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and not tg.tgisinternal
  and c.relname in (
    'customers','product_categories','products',
    'transactions','payment_history','project_updates','admin_users','reviews'
  )
order by table_name, trigger_name;

-- 7) Definisi fungsi penting
select p.proname, pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'update_updated_at_column','handle_new_user','validate_project_status','is_admin',
    'tr_payment_history_recalc_total_paid','fn_recalc_total_paid'
  )
order by p.proname;

-- 8) Status RLS di tabel target
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'customers','product_categories','products',
    'transactions','payment_history','project_updates','admin_users','reviews'
  )
order by c.relname;

-- 9) Policies RLS
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'customers','product_categories','products',
    'transactions','payment_history','project_updates','admin_users','reviews'
  )
order by tablename, policyname;

-- 10) Catatan: konversi query tanggal MySQL -> Postgres
-- Gunakan col::date = CURRENT_DATE alih-alih DATE(col) = CURDATE()
-- Contoh:
--   WHERE t.created_at::date = CURRENT_DATE
--   WHERE pu.created_at::date = CURRENT_DATE
--   WHERE t.order_date::date BETWEEN $2::date AND $3::date

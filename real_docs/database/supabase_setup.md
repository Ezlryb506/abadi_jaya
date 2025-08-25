# Setup Supabase (Konsolidasi)

Dokumen ini menggantikan `dokumen/03_supabase_setup.md` dan melengkapi `real_docs/database/supabase_setup_notes.md`.

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `NEXT_PUBLIC_SITE_URL`

Contoh `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SITE_URL=https://your-site-url.example
```

## Inisialisasi Klien (Next.js)
`src/lib/supabaseClient.ts`:
```ts
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## RLS: Pola yang Digunakan
Gunakan helper `is_admin()` dan pola ownership berdasarkan `customers.auth_user_id`.

### Helper
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### customers
```sql
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customers_select_own ON public.customers
  FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY customers_insert_own ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY customers_update_own ON public.customers
  FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Admin can view all customers" ON public.customers
  FOR SELECT USING (is_admin());
```

### transactions
```sql
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on transactions" ON public.transactions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "User can see own transactions" ON public.transactions
  FOR SELECT USING (
    (SELECT auth_user_id FROM public.customers WHERE id = customer_id) = auth.uid()
  );
CREATE POLICY "User can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    (SELECT auth_user_id FROM public.customers WHERE id = customer_id) = auth.uid()
  );
CREATE POLICY "User can update own transactions" ON public.transactions
  FOR UPDATE USING (
    (SELECT auth_user_id FROM public.customers WHERE id = customer_id) = auth.uid()
  ) WITH CHECK (
    (SELECT auth_user_id FROM public.customers WHERE id = customer_id) = auth.uid()
  );
CREATE POLICY "User can delete own transactions" ON public.transactions
  FOR DELETE USING (
    (SELECT auth_user_id FROM public.customers WHERE id = customer_id) = auth.uid()
  );
```

### payment_history
```sql
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_history_select ON public.payment_history
  FOR SELECT USING (
    is_admin() OR auth.uid() = (
      SELECT c.auth_user_id FROM public.customers c
      WHERE c.id = (SELECT t.customer_id FROM public.transactions t WHERE t.id = payment_history.transaction_id)
    )
  );
CREATE POLICY payment_history_write_admin ON public.payment_history
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
```

### project_updates
```sql
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY project_updates_select ON public.project_updates
  FOR SELECT USING (
    is_admin() OR auth.uid() = (
      SELECT c.auth_user_id FROM public.customers c
      WHERE c.id = (SELECT t.customer_id FROM public.transactions t WHERE t.id = project_updates.transaction_id)
    )
  );
CREATE POLICY project_updates_write_admin ON public.project_updates
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
```

### product_categories
```sql
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.product_categories
  FOR SELECT USING (true);
```

### products
```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_public_read ON public.products
  FOR SELECT USING (true);
CREATE POLICY products_write_admin ON public.products
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
```

### reviews (opsional, jika diadopsi)
```sql
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY reviews_select ON public.reviews
  FOR SELECT USING (
    is_admin() OR auth.uid() = (
      SELECT c.auth_user_id FROM public.customers c WHERE c.id = reviews.customer_id
    ) OR COALESCE(is_published,false) IS TRUE
  );
CREATE POLICY reviews_write ON public.reviews
  FOR ALL USING (
    is_admin() OR auth.uid() = (SELECT c.auth_user_id FROM public.customers c WHERE c.id = reviews.customer_id)
  ) WITH CHECK (
    is_admin() OR auth.uid() = (SELECT c.auth_user_id FROM public.customers c WHERE c.id = reviews.customer_id)
  );
```

Catatan: Sesuaikan penamaan policy agar konsisten dan hindari duplikasi.

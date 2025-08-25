# Catatan Supabase Setup & Klien

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `NEXT_PUBLIC_SITE_URL`

Terlacak di `src/lib/supabaseClient.ts`:
```ts
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Rekomendasi RLS vs Client
- Pastikan RLS konsisten dengan kebutuhan UI (admin vs user).
- Gunakan service role hanya pada server actions/API Route untuk operasi privileged.

## Storage (opsional)
- Buckets: `payment-proofs`, `project-photos` (private, image/*, ~10MB)

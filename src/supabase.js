import { createClient } from '@supabase/supabase-js'

// URLの末尾の「/」や「/rest/v1」が付いていても動くように整える（付いていると Invalid path エラーになる）
const clean = (u = '') => u.trim().replace(/\/(rest|auth|realtime|storage)\/v1.*$/, '').replace(/\/+$/, '')

export const supabase = createClient(
  clean(import.meta.env.VITE_SUPABASE_URL) || 'http://localhost',
  (import.meta.env.VITE_SUPABASE_ANON_KEY || 'none').trim()
)

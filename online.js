// 部屋のやりとり。Supabase版（みんなで対戦）と、この端末だけで動くローカル版（ひとりで遊ぶ）は同じ形で使えます。
import { supabase } from './supabase'

async function fetchDoc(code) {
  const [r, p] = await Promise.all([
    supabase.from('rooms').select('*').eq('code', code).maybeSingle(),
    supabase.from('room_players').select('*').eq('room_code', code),
  ])
  return r.data ? { ...r.data, players: p.data || [] } : null
}

function remote(code) {
  return {
    code,
    subscribe(cb) {
      const load = async () => { const d = await fetchDoc(code); if (d) cb(d) }
      load()
      const ch = supabase.channel('room-' + code)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${code}` }, load)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: `room_code=eq.${code}` }, load)
        .subscribe()
      return () => supabase.removeChannel(ch)
    },
    start: (s) => supabase.from('rooms').update({ s }).eq('code', code),
    write: (s) => supabase.from('rooms').update({ s, hb: null, hd: null }).eq('code', code),
    hand: (k, v) => supabase.from('rooms').update({ [k]: v }).eq('code', code),
  }
}

export async function createRoom(id, name, n, m) {
  const code = String(1000 + Math.floor(Math.random() * 9000))
  let { error } = await supabase.from('rooms').insert({ code, host: id, n, m })
  if (error) throw error
  ;({ error } = await supabase.from('room_players').insert({ room_code: code, id, name, team: 0 }))
  if (error) throw error
  return remote(code)
}

export async function joinRoom(code, id, name) {
  const d = await fetchDoc(code)
  if (!d) throw new Error('部屋が見つかりません')
  if (d.players.some((p) => p.id === id)) return remote(code) // 再接続
  if (d.s) throw new Error('この部屋はすでに始まっています')
  if (d.players.length >= 8) throw new Error('満員です（最大8人）')
  const team = d.players.filter((p) => p.team === 0).length <= d.players.filter((p) => p.team === 1).length ? 0 : 1
  const { error } = await supabase.from('room_players').insert({ room_code: code, id, name, team })
  if (error) throw error
  return remote(code)
}

export function localRoom(id, name, n, m) {
  const d = { code: 'ひとり', host: id, n, m, s: null, hb: null, hd: null, players: [{ id, name, team: 0 }] }
  const subs = new Set(), emit = () => subs.forEach((f) => f({ ...d }))
  return {
    code: d.code,
    subscribe(cb) { subs.add(cb); cb({ ...d }); return () => subs.delete(cb) },
    start: async (s) => { d.s = s; emit() },
    write: async (s) => { d.s = s; d.hb = d.hd = null; emit() },
    hand: async (k, v) => { d[k] = v; emit() },
  }
}

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
  let refresh = () => {}
  // 書き込んだらすぐ最新の状態を読み直す（Realtimeが動いていなくても、自分の画面は進む）
  const done = async (p) => { const r = await p; if (r && r.error) console.error(r.error); refresh(); return r }
  return {
    code,
    fetch: () => fetchDoc(code),
    subscribe(cb) {
      let alive = true
      const load = async () => { try { const d = await fetchDoc(code); if (alive && d) cb(d) } catch (e) { console.error(e) } }
      refresh = load
      load()
      // Realtimeに加えて、2秒ごとの確認も行う（Realtimeの設定が無効でも、ほかの人の動きが届く）
      const poll = setInterval(load, 2000)
      const ch = supabase.channel('room-' + code)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${code}` }, load)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: `room_code=eq.${code}` }, load)
        .subscribe()
      return () => { alive = false; clearInterval(poll); supabase.removeChannel(ch) }
    },
    start: (s) => done(supabase.from('rooms').update({ s }).eq('code', code)),
    write: (s) => done(supabase.from('rooms').update({ s, hb: null, hd: null }).eq('code', code)),
    hand: (k, v) => done(supabase.from('rooms').update({ [k]: v }).eq('code', code)),
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

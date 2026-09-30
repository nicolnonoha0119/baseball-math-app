// ゲームのルールと問題づくり（画面やSupabaseには依存しない）
export const OPN = {
  S: ['', '掛け算', '見取算（加減算）', '割り算', '開平（√）', 'ランダム', 'ランダム'],
  H: ['', '二次方程式', '指数・対数', '三角関数', '微分', '数列', 'ランダム'],
}
export const DG = {
  S: ['', '2桁', '2桁', '3桁', '3桁', '4桁', '4桁'],
  H: ['', '基礎', '基礎', '標準', '標準', '発展', '発展'],
}
export const OPP = ['', 'ピッチャー', 'キャッチャー', '内野手', '外野手', '守備の誰か（ランダム）', '守備の誰か（ランダム）']
export const AIL = [0, 3, 2, 2, 1, 2, 3] // 対戦相手ごとのAIの強さ
// スペシャルイベント（ピッチャーの目-バッターの目）j=じゃんけん w=不戦勝 l=不戦敗 b=ボーナスダイス
export const SP = { '1-1': 'j', '3-3': 'j', '5-2': 'j', '2-5': 'j', '2-2': 'w', '6-3': 'w', '4-4': 'l', '1-5': 'l', '1-6': 'b', '6-1': 'b', '4-3': 'b', '3-4': 'b' }
export const SPN = { j: '✊ じゃんけん勝負', w: '🏳 不戦勝（自動で単打）', l: '💀 不戦敗（アウト）', b: '🎲 ボーナスダイス（計算に勝てば追加ダイス）' }
export const SPI = { j: '✊', w: '🏳', l: '💀', b: '🎲' }
const BONUS = [0, 1, 1, 2, 2, 3, 4]
const BN = ['', '単打', '単打', '二塁打', '二塁打', '三塁打', 'ホームラン']
const SB = { 2: '₂', 3: '₃', 5: '₅', 6: '₆', 7: '₇', 10: '₁₀' }

export const rd = (n) => 1 + Math.floor(Math.random() * n)
const rnd = (d) => { const lo = d <= 1 ? 1 : 10 ** (d - 1), hi = 10 ** Math.max(d, 1) - 1; return lo + Math.floor(Math.random() * (hi - lo + 1)) }
const sg = (n, v = '') => (n < 0 ? '－ ' : '＋ ') + (Math.abs(n) === 1 && v ? '' : Math.abs(n)) + v

function genS(op, d) {
  if (op === 1) { const a = rnd(d), b = rnd(2); return { q: `${a} × ${b}`, a: a * b } }
  if (op === 2) {
    let v = rnd(d), s = v, q = `${v}`
    for (let i = 1; i < 4 + d; i++) { const x = rnd(d); if (Math.random() < 0.5 && s - x >= 0) { s -= x; q += ` － ${x}` } else { s += x; q += ` ＋ ${x}` } }
    return { q, a: s }
  }
  if (op === 3) { const dv = rnd(2), qt = rnd(d - 1); return { q: `${dv * qt} ÷ ${dv}`, a: qt } }
  const k = d === 2 ? 10 + rd(20) : d === 3 ? 30 + rd(70) : 100 + rd(200)
  return { q: `√${k * k}`, a: k }
}
function genH(op, L) {
  if (op === 1) {
    const R = [0, 6, 9, 12][L], rr = () => { let x = 0; while (!x) x = rd(2 * R + 1) - R - 1; return L === 1 ? Math.abs(x) : x }
    const r1 = rr(), r2 = rr(), a = L === 3 ? 1 + rd(3) : 1, p = -(r1 + r2) * a, q = r1 * r2 * a
    return { q: `${a === 1 ? '' : a}x² ${p ? sg(p, 'x') : ''} ${sg(q)} ＝ 0 の大きい方の解`, a: Math.max(r1, r2) }
  }
  if (op === 2) {
    if (L === 1) { const k1 = rd(5), k2 = rd(4); return { q: `log₂ ${2 ** k1} ＋ log₃ ${3 ** k2}`, a: k1 + k2 } }
    if (L === 2) {
      const b = [6, 10][rd(2) - 1], k = 2 + rd(2), N = b ** k, dv = []
      for (let i = 2; i < N; i++) if (N % i === 0) dv.push(i)
      const m = dv[rd(dv.length) - 1]
      return { q: `log${SB[b]} ${m} ＋ log${SB[b]} ${N / m}`, a: k }
    }
    const a = [2, 3][rd(2) - 1], c = [5, 7][rd(2) - 1], k = 2 + rd(4)
    return { q: `log${SB[a]} ${c} × log${SB[c]} ${a ** k}`, a: k }
  }
  if (op === 3) {
    if (L < 3) { let m = rd(9), n = rd(9); if ((m + n) % 2) n++; return { q: L === 1 ? `${m}sin30° ＋ ${n}cos60°` : `${m}sin150° － ${n}cos120°`, a: (m + n) / 2 } }
    const m = rd(5), k = rd(5), x = [20, 35, 50, 70][rd(4) - 1]
    return { q: `${4 * m}sin15°cos15° ＋ ${k}sin²${x}° ＋ ${k}cos²${x}°`, a: m + k }
  }
  if (op === 4) {
    if (L === 1) { const a = rd(5), b = rd(9), c = rd(9), t = rd(5); return { q: `f(x)＝${a}x² ${sg(b, 'x')} ${sg(c)} のとき f′(${t}) ＝ ？`, a: 2 * a * t + b } }
    if (L === 2) { const a = rd(4), b = rd(6), c = rd(9), d = rd(9), t = rd(7) - 4; return { q: `f(x)＝${a}x³ ${sg(b, 'x²')} ${sg(c, 'x')} ${sg(d)} のとき f′(${t}) ＝ ？`, a: 3 * a * t * t + 2 * b * t + c } }
    const m = 1 + rd(6); return { q: `f(x)＝x³ － ${3 * m * m}x ＋ ${rd(9)} が極小となる x ＝ ？`, a: m }
  }
  if (L === 1) { const a = rd(9), d = rd(6), n = 5 + rd(15); return { q: `等差数列 初項${a}・公差${d} の第${n}項`, a: a + (n - 1) * d } }
  if (L === 2) { const a = rd(9), d = rd(6), n = 10 + rd(15); return { q: `等差数列 初項${a}・公差${d} の初項から第${n}項までの和`, a: (n * (2 * a + (n - 1) * d)) / 2 } }
  const a = rd(4), r = 1 + rd(2), n = 3 + rd(4)
  return { q: `等比数列 初項${a}・公比${r} の初項から第${n}項までの和`, a: (a * (r ** n - 1)) / (r - 1) }
}
const gen = (M, op, b) => {
  if (M === 'S') { if (op >= 5) op = rd(4); return genS(op, +DG.S[b][0]) }
  if (op === 6) op = rd(5)
  return genH(op, Math.ceil(b / 2))
}

export const cur = (S) => {
  const o = S.half, d = 1 - o
  return { o, d, bat: S.t[o].pl[S.bi[o] % S.t[o].pl.length], pit: S.t[d].pl[(S.inn - 1) % S.t[d].pl.length] }
}

// 待合室の参加者から試合を作る（足りない分はAIで4人にそろえる）
export function buildGame(d) {
  const t = [0, 1].map((i) => ({ name: i ? 'チームB' : 'チームA', pl: [] })), who = {}
  ;[...d.players].sort((a, b) => a.team - b.team).forEach((p) => {
    const base = p.name || '選手'; let n = base, k = 2
    while (who[n]) n = base + k++
    who[n] = p.id; t[p.team].pl.push(n)
  })
  t.forEach((x, i) => { for (let j = 1; x.pl.length < 4; j++) x.pl.push('AI-' + 'AB'[i] + j) })
  return { t, sc: [0, 0], inn: 1, N: d.n, half: 0, outs: 0, bases: [0, 0, 0], bi: [0, 0], ph: 'roll', msg: '', cur: null, M: d.m, who, hostId: d.host, n: 0 }
}

function adv(S, n) {
  let runs = 0; const nb = [0, 0, 0]
  if (n === 4) runs = S.bases.filter(Boolean).length + 1
  else { for (let i = 2; i >= 0; i--) if (S.bases[i]) { const t = i + n; t >= 3 ? runs++ : (nb[t] = 1) } nb[n - 1] = 1 }
  S.bases = nb; S.sc[S.half] += runs; return runs
}

export function resolve(S0, win, pre) {
  const S = structuredClone(S0), { o, bat } = cur(S), c = S.cur
  let m = pre ? pre + ' ' : ''
  if (c.pr) m += `【問題：${c.pr.q}／答え：${c.pr.a}】 `
  if (win) {
    let n = 1, t = '単打'
    if (c.sp === 'b') { const d = rd(6); n = BONUS[d]; t = BN[d]; m += `ボーナスダイス「${d}」→` }
    const r = adv(S, n); m += `${bat}は${t}！` + (r ? `${r}点入った！` : '')
  } else { S.outs++; m += `${bat}はアウト（${S.outs}アウト）` }
  S.bi[o]++; S.n++
  if (S.outs >= 3) {
    S.outs = 0; S.bases = [0, 0, 0]; m += ' チェンジ！'
    if (S.half === 0) S.half = 1; else { S.half = 0; S.inn++ }
    if (S.inn > S.N) { S.ph = 'end'; S.msg = m; return S }
  }
  S.ph = 'roll'; S.msg = m; return S
}

export function doRoll(S0) {
  const S = structuredClone(S0), { d, pit } = cur(S), p = rd(6), b = rd(6), sp = SP[p + '-' + b]
  const defs = S.t[d].pl.filter((x) => x !== pit)
  const opp = b === 1 ? pit : defs.length ? defs[rd(defs.length) - 1] : pit
  const c = { p, b, sp, opp, role: OPP[b] }; S.cur = c
  if (sp === 'w') return resolve(S, true, '不戦勝！')
  if (sp === 'l') return resolve(S, false, '不戦敗…')
  if (sp !== 'j') {
    c.pr = gen(S.M, p, b)
    const st = AIL[b], D = S.M === 'S' ? +DG.S[b][0] - 1 : Math.ceil(b / 2)
    c.pc = [0, 0.6, 0.8, 0.92][st]; c.aiT = (8 + 6 * D) * (1.3 - 0.25 * st) * (0.7 + 0.6 * Math.random())
  }
  S.ph = 'duel'; S.msg = ''; return S
}

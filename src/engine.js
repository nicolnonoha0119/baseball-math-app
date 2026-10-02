// ゲームのルール・問題づくり・試合進行（画面やSupabaseには依存しない）
export const LV = ['', '優しい', '普通', '難しい', '鬼', '神']
const ACC = [0, 0.4, 0.65, 0.82, 0.94, 0.995] // AIレベル別の正解率
const TM = [0, 1.7, 1.2, 0.85, 0.55, 0.28]    // AIレベル別の解答時間の倍率
const DIF = ['基礎', '標準', '発展']
const wt = (a, b) => ['', a, b, a, b, 'ランダム', 'ランダム']
const WT = wt('英→和', '和→英')
const MC = new Set(['W3', 'W2', 'WP1', 'W1', 'G', 'K', 'KJ', 'JH']) // 4択の科目
export const SUBJ = {
  S: { n: 'そろばん', t: ['', '掛け算', '見取算（加減算）', '割り算', '開平（√）', 'ランダム', 'ランダム'], d: ['2桁', '3桁', '4桁'] },
  J: { n: '中学数学', t: ['', '正負の数・累乗', '一次方程式', '連立方程式', '二次方程式', '平方根の計算', 'ランダム'], d: DIF },
  H: { n: '高校数学', t: ['', '二次方程式', '指数・対数', '三角関数', '微分', '数列', 'ランダム'], d: DIF },
  III: { n: '数学III', t: ['', '極限', '微分', '定積分', '無限級数', '複素数平面', 'ランダム'], d: DIF },
  W3: { n: '英検準2級 単語', t: WT, d: ['易', '標準', '難'] },
  W2: { n: '英検2級 単語', t: WT, d: ['易', '標準', '難'] },
  WP1: { n: '英検準1級 単語', t: WT, d: ['易', '標準', '難'] },
  W1: { n: '英検1級 単語', t: WT, d: ['易', '標準', '難'] },
  A: { n: '数学A（場合の数・整数）', t: ['', '順列・組合せ', '円順列・重複順列', '同じものを含む順列', '整数（約数・倍数）', 'さいころ・玉', 'ランダム'], d: DIF },
  CH: { n: '化学計算（理論化学）', t: ['', '物質量', '気体の体積', 'モル濃度', '化学反応式の量', '質量パーセント濃度', 'ランダム'], d: DIF },
  K: { n: '古文単語', t: wt('古語→意味', '意味→古語'), d: ['易', '標準', '難'] },
  KJ: { n: '漢字の読み（入試頻出）', t: wt('漢字→読み', '読み→漢字'), d: ['易', '標準', '難'] },
  JH: { n: '日本史 一問一答', t: ['', '古代・中世', '近世', '近代・現代', 'ランダム', 'ランダム', 'ランダム'], d: DIF },
  G: { n: '高校英文法', t: ['', '時制・動詞の活用', '関係詞・接続詞', '助動詞・仮定法', '前置詞・語法・動詞の形', 'ランダム', 'ランダム'], d: DIF },
}
// 大学レベル別の科目：ピッチャーの目ごとに（科目, 問題の種類）を割り当て、バッターの目に shift を足して難しくする
// ※レベルはあくまで目安で、実際の入試の出題と一致するわけではありません
const MIX = (n, shift, pool, mc) => ({ n, shift, pool, mc, d: ['易', '標準', '難'], t: [] })
SUBJ.S.t = ['', '掛け算', '見取算（加減算）', '割り算', '開平・立方根', '2乗・3乗', 'ランダム']
SUBJ.U1 = MIX('数学 共通テストレベル', 0, [['H', 1], ['H', 2], ['H', 3], ['H', 4], ['A', 1], ['A', 5]])
SUBJ.U2 = MIX('数学 MARCH・関関同立レベル', 1, [['H', 1], ['H', 5], ['H', 4], ['A', 2], ['A', 4], ['III', 1]])
SUBJ.U3 = MIX('数学 早慶・旧帝大レベル', 2, [['III', 2], ['III', 3], ['H', 4], ['A', 3], ['H', 2], ['III', 4]])
SUBJ.U4 = MIX('数学 東大・京大レベル', 3, [['III', 2], ['III', 3], ['III', 4], ['III', 5], ['A', 3], ['H', 3]])
SUBJ.E1 = MIX('英語 共通テストレベル', 0, [['W2', 1], ['W2', 2], ['G', 1], ['G', 2], ['G', 3], ['G', 4]], true)
SUBJ.E2 = MIX('英語 MARCH・関関同立レベル', 1, [['W2', 1], ['W2', 2], ['WP1', 1], ['G', 1], ['G', 3], ['G', 4]], true)
SUBJ.E3 = MIX('英語 早慶・難関国立レベル', 2, [['WP1', 1], ['WP1', 2], ['W1', 1], ['G', 2], ['G', 3], ['G', 4]], true)
for (const k of ['U1', 'U2', 'U3', 'U4', 'E1', 'E2', 'E3']) SUBJ[k].t = ['', ...SUBJ[k].pool.map(([m, o]) => `${SUBJ[m].n}：${SUBJ[m].t[o]}`)]
const isMC = (M) => MC.has(M) || !!(SUBJ[M].pool && SUBJ[M].mc)
export const OPP = ['', 'ピッチャー', 'キャッチャー', '内野手', '外野手', '守備の誰か（ランダム）', '守備の誰か（ランダム）']
export const AIL = [0, 3, 2, 2, 1, 2, 3] // 対戦相手ごとのAIの強さ（★）
export const ACC_TEXT = (lv) => `正解率 約${Math.round(ACC[lv] * 100)}％・解答の速さ ${['', 'とても遅い', '遅め', 'ふつう', '速い', '超高速'][lv]}`
// スペシャル（ピッチャーの目-バッターの目）j=じゃんけん w=不戦勝 l=不戦敗 b=ボーナスダイス
export const SP = { '1-1': 'j', '3-3': 'j', '5-2': 'j', '2-5': 'j', '2-2': 'w', '6-3': 'w', '4-4': 'l', '1-5': 'l', '1-6': 'b', '6-1': 'b', '4-3': 'b', '3-4': 'b' }
export const SPN = { j: '✊ じゃんけん勝負', w: '🏳 不戦勝（自動で単打）', l: '💀 不戦敗（アウト）', b: '🎲 ボーナスダイス（計算に勝てば追加ダイス）' }
export const SPI = { j: '✊', w: '🏳', l: '💀', b: '🎲' }
const BONUS = [0, 1, 1, 2, 2, 3, 4], BN = ['', '単打', '単打', '二塁打', '二塁打', '三塁打', 'ホームラン']
const SB = { 2: '₂', 3: '₃', 5: '₅', 6: '₆', 7: '₇', 10: '₁₀' }

export const rd = (n) => 1 + Math.floor(Math.random() * n)
const rnd = (d) => { const lo = d <= 1 ? 1 : 10 ** (d - 1), hi = 10 ** Math.max(d, 1) - 1; return lo + Math.floor(Math.random() * (hi - lo + 1)) }
const sg = (n, v = '') => (n < 0 ? '－ ' : '＋ ') + (Math.abs(n) === 1 && v ? '' : Math.abs(n)) + v
const shuf = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

// ---------- そろばん ----------
function genS(op, d) {
  if (op === 1) { const a = rnd(d), b = rnd(2); return { q: `${a} × ${b}`, a: a * b, e: `${a}×${b}＝${a * b}` } }
  if (op === 2) {
    let v = rnd(d), s = v, q = `${v}`
    for (let i = 1; i < 4 + d; i++) { const x = rnd(d); if (Math.random() < 0.5 && s - x >= 0) { s -= x; q += ` － ${x}` } else { s += x; q += ` ＋ ${x}` } }
    return { q, a: s, e: `左から順に足し引きして ${s}` }
  }
  if (op === 3) { const dv = rnd(2), qt = rnd(d - 1); return { q: `${dv * qt} ÷ ${dv}`, a: qt, e: `${dv}×${qt}＝${dv * qt} なので答えは ${qt}` } }
  const k = d === 2 ? 10 + rd(20) : d === 3 ? 30 + rd(70) : 100 + rd(200)
  return { q: `√${k * k}`, a: k, e: `${k}²＝${k * k} なので √${k * k}＝${k}` }
}
// ---------- 二次方程式（中・高共通）----------
function quad(L, big) {
  const R = [0, 6, 9, 12][L], rr = () => { let x = 0; while (!x) x = rd(2 * R + 1) - R - 1; return L === 1 ? Math.abs(x) : x }
  const r1 = rr(), r2 = rr(), a = L === 3 ? 1 + rd(3) : 1, p = -(r1 + r2) * a, q = r1 * r2 * a
  return { q: `${a === 1 ? '' : a}x² ${p ? sg(p, 'x') : ''} ${sg(q)} ＝ 0 の${big ? '大きい' : '小さい'}方の解`, a: big ? Math.max(r1, r2) : Math.min(r1, r2),
    e: `因数分解して ${a === 1 ? '' : a}(x ${sg(-r1)})(x ${sg(-r2)})＝0 より x＝${r1}, ${r2}` }
}
// ---------- 中学数学 ----------
function genJ(op, L) {
  if (op === 1) {
    const a = rd(9) + L * 2, b = rd(5) + 1, c = rd(5) + 1
    if (L === 1) return { q: `${a} ＋ (－${b}) × ${c}`, a: a - b * c, e: `かけ算が先：(－${b})×${c}＝${-b * c}。${a}＋(${-b * c})＝${a - b * c}` }
    if (L === 2) return { q: `(－${b})² － ${a} × (－${c})`, a: b * b + a * c, e: `(－${b})²＝${b * b}、－${a}×(－${c})＝＋${a * c}。合計 ${b * b + a * c}` }
    const e = rd(4) + 1, k = rd(5) + 1
    return { q: `{${a} － (－${b})²} × ${c} ＋ ${e * k} ÷ ${e}`, a: (a - b * b) * c + k, e: `中かっこ：${a}－${b * b}＝${a - b * b}。×${c}＝${(a - b * b) * c}。${e * k}÷${e}＝${k}。合計 ${(a - b * b) * c + k}` }
  }
  if (op === 2) {
    const x = rd(9)
    if (L === 1) { const a = rd(5) + 1, b = rd(9); return { q: `${a}x ＋ ${b} ＝ ${a * x + b}`, a: x, e: `${a}x＝${a * x + b}－${b}＝${a * x}、x＝${x}` } }
    if (L === 2) { const a = rd(4) + 1, b = rd(5), c = a + rd(3), d = a * (x + b) - c * x; return { q: `${a}(x ＋ ${b}) ＝ ${c}x ${sg(d)}`, a: x, e: `展開：${a}x＋${a * b}＝${c}x ${sg(d)}。移項して (${a}－${c})x＝${d - a * b}、x＝${x}` } }
    const a = rd(6) + 1, c = rd(3) + 1, d = rd(3) + 1, e = rd(5), b = c * (d * x + e) - a * x
    return { q: `(${a}x ${sg(b)}) ÷ ${c} ＝ ${d}x ${sg(e)}`, a: x, e: `両辺に${c}をかけて ${a}x ${sg(b)}＝${c * d}x ${sg(c * e)}。x＝${x}` }
  }
  if (op === 3) {
    const x = rd(L * 3 + 3), y = rd(L * 3 + 3); let a, b, c, d
    do { a = rd(4); b = rd(4) * (L > 1 && rd(2) === 1 ? -1 : 1); c = rd(4); d = rd(4) } while (a * d - b * c === 0)
    return { q: `${a}x ${sg(b, 'y')} ＝ ${a * x + b * y}、${c}x ${sg(d, 'y')} ＝ ${c * x + d * y} のとき x ＝ ？`, a: x, e: `加減法でyを消すと x＝${x}（y＝${y}）` }
  }
  if (op === 4) return quad(L, false)
  if (L === 1) { const a = rd(9), b = rd(9); return { q: `√${a * a} ＋ √${b * b}`, a: a + b, e: `${a}＋${b}＝${a + b}` } }
  if (L === 2) { const b = rd(9), a = b + rd(9); return { q: `(√${a} ＋ √${b})(√${a} － √${b})`, a: a - b, e: `和と差の積：${a}－${b}＝${a - b}` } }
  const p = rd(9) + 1, r = rd(20) + 1
  return { q: `(${p} ＋ √${r})(${p} － √${r})`, a: p * p - r, e: `和と差の積：${p}²－${r}＝${p * p - r}` }
}
// ---------- 高校数学 ----------
function genH(op, L) {
  if (op === 1) return quad(L, true)
  if (op === 2) {
    if (L === 1) { const k1 = rd(5), k2 = rd(4); return { q: `log₂ ${2 ** k1} ＋ log₃ ${3 ** k2}`, a: k1 + k2, e: `log₂ 2^${k1}＝${k1}、log₃ 3^${k2}＝${k2}` } }
    if (L === 2) {
      const b = [6, 10][rd(2) - 1], k = 2 + rd(2), N = b ** k, dv = []
      for (let i = 2; i < N; i++) if (N % i === 0) dv.push(i)
      const m = dv[rd(dv.length) - 1]
      return { q: `log${SB[b]} ${m} ＋ log${SB[b]} ${N / m}`, a: k, e: `和は積の対数：log ${m}×${N / m}＝log ${N}＝log ${b}^${k}＝${k}` }
    }
    const a = [2, 3][rd(2) - 1], c = [5, 7][rd(2) - 1], k = 2 + rd(4)
    return { q: `log${SB[a]} ${c} × log${SB[c]} ${a ** k}`, a: k, e: `底の変換：log_${a} ${c}×log_${c} ${a}^${k}＝log_${a} ${a}^${k}＝${k}` }
  }
  if (op === 3) {
    if (L < 3) { let m = rd(9), n = rd(9); if ((m + n) % 2) n++; return { q: L === 1 ? `${m}sin30° ＋ ${n}cos60°` : `${m}sin150° － ${n}cos120°`, a: (m + n) / 2, e: L === 1 ? `sin30°＝cos60°＝1/2 なので (${m}＋${n})/2` : `sin150°＝1/2、cos120°＝－1/2 なので (${m}＋${n})/2` } }
    const m = rd(5), k = rd(5), x = [20, 35, 50, 70][rd(4) - 1]
    return { q: `${4 * m}sin15°cos15° ＋ ${k}sin²${x}° ＋ ${k}cos²${x}°`, a: m + k, e: `sin15°cos15°＝(1/2)sin30°＝1/4 なので ${m}。sin²＋cos²＝1 なので ${k}。合計 ${m + k}` }
  }
  if (op === 4) {
    if (L === 1) { const a = rd(5), b = rd(9), c = rd(9), t = rd(5); return { q: `f(x)＝${a}x² ${sg(b, 'x')} ${sg(c)} のとき f′(${t}) ＝ ？`, a: 2 * a * t + b, e: `f′(x)＝${2 * a}x ${sg(b)}。x＝${t}を代入して ${2 * a * t + b}` } }
    if (L === 2) { const a = rd(4), b = rd(6), c = rd(9), d = rd(9), t = rd(7) - 4; return { q: `f(x)＝${a}x³ ${sg(b, 'x²')} ${sg(c, 'x')} ${sg(d)} のとき f′(${t}) ＝ ？`, a: 3 * a * t * t + 2 * b * t + c, e: `f′(x)＝${3 * a}x² ${sg(2 * b, 'x')} ${sg(c)}。x＝${t}を代入して ${3 * a * t * t + 2 * b * t + c}` } }
    const m = 1 + rd(6); return { q: `f(x)＝x³ － ${3 * m * m}x ＋ ${rd(9)} が極小となる x ＝ ？`, a: m, e: `f′(x)＝3x²－${3 * m * m}＝0 より x＝±${m}。増減表から x＝${m} で極小` }
  }
  if (L === 1) { const a = rd(9), d = rd(6), n = 5 + rd(15); return { q: `等差数列 初項${a}・公差${d} の第${n}項`, a: a + (n - 1) * d, e: `a＋(n－1)d＝${a}＋${n - 1}×${d}＝${a + (n - 1) * d}` } }
  if (L === 2) { const a = rd(9), d = rd(6), n = 10 + rd(15); return { q: `等差数列 初項${a}・公差${d} の初項から第${n}項までの和`, a: (n * (2 * a + (n - 1) * d)) / 2, e: `Sₙ＝n{2a＋(n－1)d}/2＝${n}×${2 * a + (n - 1) * d}/2＝${(n * (2 * a + (n - 1) * d)) / 2}` } }
  const a = rd(4), r = 1 + rd(2), n = 3 + rd(4)
  return { q: `等比数列 初項${a}・公比${r} の初項から第${n}項までの和`, a: (a * (r ** n - 1)) / (r - 1), e: `Sₙ＝a(rⁿ－1)/(r－1)＝${a}×(${r ** n}－1)/${r - 1}＝${(a * (r ** n - 1)) / (r - 1)}` }
}
// ---------- 数学III ----------
const TRI = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]]
function gen3(op, L) {
  if (op === 1) {
    if (L === 1) { const a = rd(6); return { q: `lim(x→${a}) (x² － ${a * a}) ÷ (x － ${a})`, a: 2 * a, e: `分子を (x－${a})(x＋${a}) と因数分解して約分。x→${a} で ${2 * a}` } }
    if (L === 2) { const k = rd(9) + 1; return { q: `lim(x→0) sin(${k}x) ÷ x`, a: k, e: `sin(${k}x)/x＝${k}・sin(${k}x)/(${k}x)→${k}×1＝${k}` } }
    const c = rd(4) + 1, k = rd(5) + 1
    return { q: `lim(x→∞) (${c * k}x² ＋ ${rd(9)}x) ÷ (${c}x² ＋ ${rd(9)})`, a: k, e: `分母分子をx²で割ると 最高次の係数の比 ${c * k}/${c}＝${k}` }
  }
  if (op === 2) {
    if (L === 1) { const a = rd(5), b = rd(5), t = rd(4); return { q: `f(x)＝(x² ＋ ${a})(x ＋ ${b}) のとき f′(${t}) ＝ ？`, a: 2 * t * (t + b) + t * t + a, e: `積の微分：f′(x)＝2x(x＋${b})＋(x²＋${a})。x＝${t} で ${2 * t * (t + b) + t * t + a}` } }
    if (L === 2) { const n = rd(3) + 2, a = rd(3) + 1, b = rd(4), t = rd(3); return { q: `f(x)＝(${a}x ＋ ${b})^${n} のとき f′(${t}) ＝ ？`, a: n * a * (a * t + b) ** (n - 1), e: `合成関数の微分：f′(x)＝${n}・${a}(${a}x＋${b})^${n - 1}。x＝${t} で ${n * a * (a * t + b) ** (n - 1)}` } }
    const n = rd(2) + 1, a = rd(3) + 1, b = rd(4), c = rd(3) + 1, d = rd(4), t = rd(3)
    return { q: `f(x)＝(${a}x ＋ ${b})^${n}(${c}x ＋ ${d}) のとき f′(${t}) ＝ ？`, a: n * a * (a * t + b) ** (n - 1) * (c * t + d) + c * (a * t + b) ** n, e: `積と合成の微分：f′＝${n}・${a}(${a}x＋${b})^${n - 1}(${c}x＋${d})＋${c}(${a}x＋${b})^${n}。x＝${t} で ${n * a * (a * t + b) ** (n - 1) * (c * t + d) + c * (a * t + b) ** n}` }
  }
  if (op === 3) {
    if (L === 1) { const k = 2 * rd(3), a = rd(5), b = rd(5); return { q: `∫₀^${k} (${a}x ＋ ${b}) dx`, a: (a * k * k) / 2 + b * k, e: `[${a}x²/2＋${b}x]₀^${k}＝${(a * k * k) / 2}＋${b * k}` } }
    if (L === 2) { const k = rd(3), a = rd(4), b = rd(5); return { q: `∫₀^${k} (${3 * a}x² ＋ ${b}) dx`, a: a * k ** 3 + b * k, e: `[${a}x³＋${b}x]₀^${k}＝${a * k ** 3}＋${b * k}` } }
    const k = 2 * rd(2), a = rd(5)
    return { q: `∫₀^${k} 2x(x² ＋ ${a}) dx`, a: k ** 4 / 2 + a * k * k, e: `展開して ∫(2x³＋${2 * a}x)dx＝[x⁴/2＋${a}x²]₀^${k}＝${k ** 4 / 2 + a * k * k}` }
  }
  if (op === 4) {
    if (L === 1) { const a = rd(9); return { q: `初項${a}・公比1/2 の無限等比級数の和`, a: 2 * a, e: `a/(1－r)＝${a}/(1/2)＝${2 * a}` } }
    if (L === 2) { const a = 2 * rd(6); return { q: `初項${a}・公比1/3 の無限等比級数の和`, a: (3 * a) / 2, e: `a/(1－r)＝${a}/(2/3)＝${(3 * a) / 2}` } }
    const r = rd(3) + 1, a = (r + 1) * rd(4)
    return { q: `初項${a}・公比－1/${r} の無限等比級数の和`, a: (a * r) / (r + 1), e: `a/(1－r)＝${a}/(1＋1/${r})＝${(a * r) / (r + 1)}` }
  }
  if (L === 1) { const [a, b, c] = TRI[rd(4) - 1]; return { q: `|${a} ＋ ${b}i|`, a: c, e: `√(${a}²＋${b}²)＝√${c * c}＝${c}` } }
  if (L === 2) { const [a, b, c] = TRI[rd(4) - 1], [p, q, r] = TRI[rd(4) - 1]; return { q: `|(${a} ＋ ${b}i)(${p} ＋ ${q}i)|`, a: c * r, e: `|z₁z₂|＝|z₁||z₂|＝${c}×${r}＝${c * r}` } }
  const k = rd(3) + 1
  return { q: `(1 ＋ i)^${4 * k} の値`, a: (-4) ** k, e: `(1＋i)²＝2i、(1＋i)⁴＝－4 なので (－4)^${k}＝${(-4) ** k}` }
}
// ---------- 英検 単語 ----------
const wb = (s) => s.split(',').map((x) => x.split(':'))
const WB = {
  W3: wb('attend:出席する,decide:決める,improve:向上させる,protect:守る,borrow:借りる,enough:十分な,discover:発見する,especially:特に,popular:人気のある,serious:深刻な,tradition:伝統,recently:最近,consider:考慮する,increase:増加する,valuable:貴重な,support:支援する,amount:量,situation:状況'),
  W2: wb('achieve:達成する,benefit:利益,complain:不満を言う,ancient:古代の,attract:引きつける,despite:～にもかかわらず,estimate:見積もる,expand:拡大する,guarantee:保証する,install:設置する,obtain:手に入れる,particular:特定の,recover:回復する,reputation:評判,significant:重要な,temporary:一時的な,vehicle:乗り物,wealthy:裕福な'),
  WP1: wb('abandon:放棄する,accumulate:蓄積する,adequate:十分な,ambiguous:あいまいな,candidate:候補者,coincide:同時に起こる,consequence:結果,deteriorate:悪化する,elaborate:手の込んだ,hostile:敵意のある,inevitable:避けられない,legitimate:合法の,mundane:平凡な,notorious:悪名高い,plausible:もっともらしい,reluctant:気が進まない,substantial:相当な,vulnerable:傷つきやすい'),
  W1: wb('aberration:逸脱,acquiesce:黙従する,ameliorate:改善する,belligerent:好戦的な,capricious:気まぐれな,deleterious:有害な,ephemeral:はかない,fastidious:気難しい,garrulous:多弁な,impeccable:非の打ちどころのない,lucid:明快な,meticulous:細心の,obsolete:時代遅れの,pragmatic:実利的な,recalcitrant:反抗的な,sycophant:おべっか使い,tenacious:粘り強い,ubiquitous:至る所にある'),
}
WB.K = wb('あはれなり:しみじみと趣深い,をかし:趣がある・おもしろい,いと:たいそう・とても,やがて:すぐに・そのまま,つれづれなり:退屈だ,ありがたし:めったにない,いみじ:はなはだしい・ひどい,かなし:いとしい・かわいい,わろし:よくない,あさまし:驚きあきれる,おどろく:はっと気づく,ののしる:大声で騒ぐ,めでたし:すばらしい,ゆかし:見たい・知りたい,あやし:不思議だ・怪しい,つとめて:早朝,ながむ:物思いにふける,はしたなし:きまりが悪い')
WB.KJ = wb('脆弱:ぜいじゃく,概ね:おおむね,忌避:きひ,懸念:けねん,顕著:けんちょ,齟齬:そご,逸脱:いつだつ,示唆:しさ,享受:きょうじゅ,恣意:しい,払拭:ふっしょく,拘泥:こうでい,斡旋:あっせん,漸進:ぜんしん,奔走:ほんそう,如実:にょじつ,杞憂:きゆう,蓋然:がいぜん')
const PR = { K: ['の意味は？', 'にあたる古語は？'], KJ: ['の読みは？', 'と読む語は？'] }
function genW(M, op, L) {
  const bank = WB[M], th = bank.length / 3, pool = bank.slice(Math.floor((L - 1) * th), Math.floor(L * th))
  const w = pool[rd(pool.length) - 1], toJa = op % 2 === 1, i = toJa ? 0 : 1
  const others = shuf(bank.filter((x) => x !== w && x[1 - i] !== w[1 - i])).slice(0, 3).map((x) => x[1 - i])
  const ch = shuf([w[1 - i], ...others])
  const pr = PR[M] || ['の意味は？', 'を表す英単語は？']
  return { q: toJa ? `「${w[0]}」${pr[0]}` : `「${w[1]}」${pr[1]}`, ch, a: ch.indexOf(w[1 - i]), e: `${w[0]}＝${w[1]}` }
}
// ---------- 高校英文法 ----------
const GB = [
  [1, 1, 'I ( ) in Tokyo since 2015.', 'live|lived|have lived|am living', 2, 'since があるので継続の現在完了 have lived'],
  [1, 2, 'By the time you arrive, the train ( ).', 'will leave|will have left|leaves|has left', 1, 'By the time ～ は未来完了 will have left（到着時には出発済み）'],
  [1, 3, 'When I called her, she ( ) dinner.', 'cooked|was cooking|has cooked|cooks', 1, '電話をした時点で進行中の動作は過去進行形 was cooking'],
  [2, 1, 'This is the girl ( ) lives next door.', 'who|which|whom|whose', 0, '先行詞が人で主語の働き → 主格 who'],
  [2, 2, 'The book ( ) cover is red is mine.', 'who|whose|which|that', 1, '「その表紙」と所有を表すので whose'],
  [2, 3, '( ) he is rich, he is not happy.', 'Because|Although|Unless|So', 1, '「～だけれども」の譲歩は Although'],
  [2, 3, 'That is the house in ( ) he was born.', 'that|where|which|what', 2, '前置詞 in の後ろには that は置けず which。in which ＝ where'],
  [3, 1, 'You ( ) not park here.', 'can|must|may|will', 1, '禁止は must not'],
  [3, 2, 'If I ( ) you, I would apologize.', 'am|was|were|be', 2, '現在の事実に反する仮定法過去は be動詞が were'],
  [3, 3, 'If it ( ) not for your help, I would have failed.', 'were|had been|has been|is', 1, 'If it had not been for ～（～がなかったら）'],
  [3, 3, 'He insisted that she ( ) the meeting.', 'attends|attend|attended|attending', 1, '主張を表す insist の that節は動詞原形（should省略）'],
  [4, 1, 'I am interested ( ) music.', 'on|at|in|for', 2, 'be interested in ～'],
  [4, 2, 'He was absorbed ( ) reading.', 'in|on|at|with', 0, 'be absorbed in ～（～に夢中）'],
  [4, 3, 'She is capable ( ) speaking three languages.', 'for|of|to|in', 1, 'be capable of ～ing（～する能力がある）'],
  [4, 3, 'It is no use ( ) over spilt milk.', 'cry|crying|to cry|cried', 1, 'It is no use ～ing（～しても無駄）'],
  [1, 2, 'I ( ) him for ten years when he moved away.', 'know|knew|had known|have known', 2, '引っ越した過去より前から続く → 過去完了 had known'],
]
function genG(op, L) {
  if (op === 1 && rd(2) === 1) return genIrr(L)
  if (op === 4 && rd(3) === 1) return genToIng(L)
  let l = GB.filter((x) => x[0] === op && x[1] === L)
  if (!l.length) l = GB.filter((x) => x[0] === op)
  const g = l[rd(l.length) - 1], opts = g[3].split('|'), ch = shuf(opts)
  return { q: g[2], ch, a: ch.indexOf(opts[g[4]]), e: g[5] }
}

// ---------- 数学A ----------
const fa = (n) => (n <= 1 ? 1 : n * fa(n - 1)), Pm = (n, r) => fa(n) / fa(n - r), Cm = (n, r) => fa(n) / (fa(r) * fa(n - r))
function genA(op, L) {
  if (op === 1) {
    if (L === 1) { const n = rd(4) + 3; return { q: `${n}P2`, a: n * (n - 1), e: `${n}P2＝${n}×${n - 1}＝${n * (n - 1)}` } }
    if (L === 2) { const n = rd(5) + 5, r = rd(2) + 2; return { q: `${n}C${r}`, a: Cm(n, r), e: `${n}C${r}＝${n}!÷(${r}!×${n - r}!)＝${Cm(n, r)}` } }
    const n = rd(4) + 6, r = rd(3) + 2, m = rd(3) + 4
    return { q: `${n}C${r} ＋ ${m}P3`, a: Cm(n, r) + Pm(m, 3), e: `${n}C${r}＝${Cm(n, r)}、${m}P3＝${Pm(m, 3)}。合計 ${Cm(n, r) + Pm(m, 3)}` }
  }
  if (op === 2) {
    if (L === 1) { const n = rd(3) + 3; return { q: `${n}人が円卓に座る座り方は何通り？`, a: fa(n - 1), e: `円順列は (n－1)!＝${n - 1}!＝${fa(n - 1)}` } }
    if (L === 2) { const n = rd(4) + 1; return { q: `${n}人が1回じゃんけんをするとき、手の出し方は何通り？`, a: 3 ** n, e: `1人3通りなので 3^${n}＝${3 ** n}` } }
    const n = rd(2) + 4; return { q: `${n}人が円卓に座るとき、特定の2人が隣り合う座り方は何通り？`, a: 2 * fa(n - 2), e: `2人を1組と考え ${n - 1}人の円順列 (${n - 2})!、組の中の並び方 2通り。${2 * fa(n - 2)}` }
  }
  if (op === 3) {
    if (L === 1) { const x = rd(3) + 1, y = rd(3) + 1; return { q: `a を${x}個、b を${y}個、1列に並べる並べ方は何通り？`, a: Cm(x + y, x), e: `${x + y}!÷(${x}!×${y}!)＝${Cm(x + y, x)}` } }
    if (L === 2) { const [x, y, z] = [[2, 2, 1], [3, 2, 1], [2, 1, 1], [3, 1, 1]][rd(4) - 1]; return { q: `a を${x}個、b を${y}個、c を${z}個、1列に並べる並べ方は何通り？`, a: fa(x + y + z) / (fa(x) * fa(y) * fa(z)), e: `${x + y + z}!÷(${x}!×${y}!×${z}!)＝${fa(x + y + z) / (fa(x) * fa(y) * fa(z))}` } }
    const a = rd(3) + 2, b = rd(3) + 2; return { q: `格子状の道を(0,0)から(${a},${b})まで最短で進む道順は何通り？`, a: Cm(a + b, a), e: `右${a}回・上${b}回の並べ方なので ${a + b}C${a}＝${Cm(a + b, a)}` }
  }
  if (op === 4) {
    const g = rd(8) + 2, [p, q] = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5]][rd(5) - 1]
    if (L === 1) return { q: `${g * p} と ${g * q} の最大公約数`, a: g, e: `${g * p}＝${g}×${p}、${g * q}＝${g}×${q}（${p}と${q}は互いに素）なので ${g}` }
    if (L === 2) return { q: `${g * p} と ${g * q} の最小公倍数`, a: g * p * q, e: `${g}×${p}×${q}＝${g * p * q}` }
    const i = rd(4), j = rd(3), k = rd(2) - 1, n = 2 ** i * 3 ** j * 5 ** k
    return { q: `${n} の正の約数の個数`, a: (i + 1) * (j + 1) * (k + 1), e: `${n}＝2^${i}×3^${j}×5^${k} なので (${i}＋1)(${j}＋1)(${k}＋1)＝${(i + 1) * (j + 1) * (k + 1)}` }
  }
  if (L === 1) { const t = rd(11) + 1; let c = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === t) c++; return { q: `大小2個のさいころを投げて、目の和が${t}になる場合は何通り？`, a: c, e: `36通りのうち、和が${t}になる目の組を数えて ${c}通り` } }
  if (L === 2) { const t = rd(12) + 3; let c = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let d = 1; d <= 6; d++) if (a + b + d === t) c++; return { q: `3個のさいころを投げて、目の和が${t}になる出方は何通り？（区別あり）`, a: c, e: `216通りのうち、和が${t}になる目の組を数えて ${c}通り` } }
  const r = rd(3) + 3, w = rd(3) + 3, j = rd(2) + 1
  return { q: `赤玉${r}個、白玉${w}個から3個を同時に取り出すとき、赤玉をちょうど${j}個含む取り出し方は何通り？`, a: Cm(r, j) * Cm(w, 3 - j), e: `${r}C${j}×${w}C${3 - j}＝${Cm(r, j)}×${Cm(w, 3 - j)}＝${Cm(r, j) * Cm(w, 3 - j)}` }
}
// ---------- 化学計算（原子量 H=1, C=12, N=14, O=16, Na=23, Mg=24, S=32, Ca=40、標準状態の気体 22.4 L/mol）----------
const SUBS = [['H₂O', 18, 1], ['CO₂', 44, 2], ['NaOH', 40, 1], ['CaCO₃', 100, 3], ['H₂SO₄', 98, 4], ['NH₃', 17, 0], ['CH₄', 16, 0], ['O₂', 32, 2], ['MgO', 40, 1], ['Na₂CO₃', 106, 3]]
function genC(op, L) {
  let [f, M, nO] = SUBS[rd(SUBS.length) - 1]; const k = rd(5)
  if (op === 1) {
    if (L === 1) return { q: `${M * k}g の ${f}（式量・分子量${M}）は何mol？`, a: k, e: `物質量＝質量÷モル質量＝${M * k}÷${M}＝${k}mol` }
    if (L === 2) return { q: `${k}mol の ${f}（式量・分子量${M}）の質量は何g？`, a: M * k, e: `質量＝物質量×モル質量＝${k}×${M}＝${M * k}g` }
    if (!nO) { [f, M, nO] = SUBS[rd(5) - 1] }
    return { q: `${M * k}g の ${f}（式量・分子量${M}）に含まれる酸素原子は何mol？`, a: k * nO, e: `${M * k}÷${M}＝${k}mol。1つあたり酸素${nO}個なので ${k * nO}mol` }
  }
  if (op === 2) {
    const V = (22.4 * k).toFixed(1)
    if (L === 1) return { q: `標準状態で ${V}L の気体は何mol？`, a: k, e: `${V}÷22.4＝${k}mol` }
    if (L === 2) return { q: `標準状態で ${V}L のCO₂（分子量44）は何g？`, a: 44 * k, e: `${V}÷22.4＝${k}mol。${k}×44＝${44 * k}g` }
    const m = [[2, 'H₂'], [16, 'CH₄'], [32, 'O₂'], [44, 'CO₂']][rd(4) - 1]
    return { q: `標準状態で ${V}L の気体の質量が ${m[0] * k}g のとき、この気体の分子量は？`, a: m[0], e: `${V}÷22.4＝${k}mol。分子量＝${m[0] * k}÷${k}＝${m[0]}` }
  }
  if (op === 3) {
    if (L === 1) { const c = rd(5), v = rd(3) + 1; return { q: `${c * v}mol の溶質を水に溶かして ${v}L にした。モル濃度は何mol/L？`, a: c, e: `モル濃度＝物質量÷体積＝${c * v}÷${v}＝${c}mol/L` } }
    if (L === 2) { const c = 2 * rd(4), mL = [500, 1000, 2000][rd(3) - 1]; return { q: `${c}mol/L の水溶液 ${mL}mL に含まれる溶質は何mol？`, a: (c * mL) / 1000, e: `${c}mol/L×${mL / 1000}L＝${(c * mL) / 1000}mol` } }
    const [v, c] = [[500, 2 * k], [250, 4 * k], [1000, k]][rd(3) - 1]; return { q: `NaOH（式量40）${40 * k}g を水に溶かして ${v}mL にした。モル濃度は何mol/L？`, a: c, e: `${40 * k}÷40＝${k}mol。${k}mol÷${v / 1000}L＝${c}mol/L` }
  }
  if (op === 4) {
    const a = rd(5)
    if (L === 1) return { q: `2H₂ ＋ O₂ → 2H₂O　H₂ ${a}mol からできる H₂O は何mol？`, a, e: `係数比 H₂：H₂O＝2：2 なので ${a}mol` }
    if (L === 2) return { q: `CH₄ ＋ 2O₂ → CO₂ ＋ 2H₂O　CH₄ ${a}mol を燃やすのに必要な O₂ は何mol？`, a: 2 * a, e: `係数比 CH₄：O₂＝1：2 なので ${2 * a}mol` }
    return { q: `2Mg ＋ O₂ → 2MgO　Mg（原子量24）${24 * a}g と過不足なく反応する O₂（分子量32）は何g？`, a: 16 * a, e: `Mg ${a}mol。係数比 Mg：O₂＝2：1 なので O₂ ${a / 2}mol＝${16 * a}g` }
  }
  const p = [5, 10, 20, 25][rd(4) - 1], t = rd(4)
  if (L === 1) return { q: `溶質${p * t}g と水${100 * t - p * t}g でできた溶液の質量パーセント濃度は何％？`, a: p, e: `${p * t}÷${100 * t}×100＝${p}％` }
  if (L === 2) return { q: `${p}％の食塩水 ${100 * t}g に溶けている食塩は何g？`, a: p * t, e: `${100 * t}×${p}/100＝${p * t}g` }
  const q = [10, 20, 30, 40][rd(4) - 1]
  return { q: `${q}％の食塩水 ${100 * t}g に水を ${100 * t}g 加えると、濃度は何％？`, a: q / 2, e: `食塩は ${q * t}g のまま、全体が ${200 * t}g になるので ${q * t}÷${200 * t}×100＝${q / 2}％` }
}
// ---------- 日本史 一問一答（[時代, 難度, 問い, 答え, 解説, 種類]）----------
const JHB = [
  [1, 1, '鎌倉幕府を開き、初代将軍となった人物は？', '源頼朝', '1192年に征夷大将軍に任じられた', 'p'],
  [1, 2, '承久の乱のあと、御成敗式目を定めた執権は？', '北条泰時', '1232年。武家社会で最初の体系的な法', 'p'],
  [1, 1, '大化の改新を中大兄皇子とともに進めた人物は？', '中臣鎌足', 'のちに藤原の姓を賜った', 'p'],
  [2, 1, '桶狭間の戦いで今川義元を破った人物は？', '織田信長', '1560年', 'p'],
  [2, 1, '太閤検地や刀狩を行った人物は？', '豊臣秀吉', '土地と身分の支配を固めた', 'p'],
  [2, 2, '享保の改革を行った8代将軍は？', '徳川吉宗', '上げ米・公事方御定書など', 'p'],
  [2, 2, '寛政の改革を行った老中は？', '松平定信', '囲米・棄捐令など', 'p'],
  [2, 3, '天保の改革を行った老中は？', '水野忠邦', '株仲間の解散・上知令など', 'p'],
  [3, 1, '大政奉還を行った江戸幕府の15代将軍は？', '徳川慶喜', '1867年', 'p'],
  [3, 2, '安政の大獄を行った大老は？', '井伊直弼', '1858年。桜田門外の変（1860）で暗殺', 'p'],
  [3, 2, '初代の内閣総理大臣になった人物は？', '伊藤博文', '1885年、内閣制度の創設時', 'p'],
  [3, 3, '日露戦争後のポーツマス条約で日本側全権を務めたのは？', '小村寿太郎', '1905年', 'p'],
  [1, 1, '聖徳太子が制定した、才能に応じて役人に位を与える制度は？', '冠位十二階', '603年', 't'],
  [1, 2, '藤原氏が摂政・関白として行った政治は？', '摂関政治', '天皇の外戚として実権を握った', 't'],
  [2, 2, '江戸幕府が大名を統制するために定めた法は？', '武家諸法度', '将軍の代替わりごとに出された', 't'],
  [3, 2, '1871年に藩を廃止して県を置いた政策は？', '廃藩置県', '中央集権化を進めた', 't'],
  [3, 1, '1889年に発布された憲法は？', '大日本帝国憲法', '天皇が定める欽定憲法', 't'],
  [1, 2, '応仁の乱が始まった年は？', '1467年', '戦国時代の始まりとされる', 'y'],
  [2, 2, '関ヶ原の戦いが起こった年は？', '1600年', '徳川家康が勝利', 'y'],
  [3, 2, '日米和親条約が結ばれた年は？', '1854年', 'ペリー来航の翌年。開国', 'y'],
  [3, 1, '大日本帝国憲法が発布された年は？', '1889年', '', 'y'],
  [1, 3, '平安京に都が移された年は？', '794年', '桓武天皇', 'y'],
  [3, 3, '廃藩置県が行われた年は？', '1871年', '', 'y'],
]
function genJH(op, L) {
  let l = JHB.filter((x) => x[0] === op && x[1] === L)
  if (!l.length) l = JHB.filter((x) => op <= 3 && x[0] === op)
  if (!l.length) l = JHB
  const g = l[rd(l.length) - 1]
  const ch = shuf([g[3], ...shuf([...new Set(JHB.filter((x) => x[5] === g[5] && x[3] !== g[3]).map((x) => x[3]))]).slice(0, 3)])
  return { q: g[2], ch, a: ch.indexOf(g[3]), e: `${g[3]}${g[4] ? '：' + g[4] : ''}` }
}


// ===== 問題パターンの追加（基本の問題に加えて、約半分はこちらの別形式から出題）=====
const gcd = (a, b) => (b ? gcd(b, a % b) : a)
function xS(op, d) {
  if (op === 1) { if (rd(2) === 1) { const a = rnd(d), b = rnd(Math.min(d, 3)); return { q: `${a} × ${b}`, a: a * b, e: `${a}×${b}＝${a * b}` } } const k = rnd(2); return { q: `${k}²`, a: k * k, e: `${k}×${k}＝${k * k}` } }
  if (op === 2) { let v = rnd(d + 1), s2 = v, q = `${v}`; for (let i = 1; i < 4 + d; i++) { const x = rnd(d + 1); if (Math.random() < 0.5 && s2 - x >= 0) { s2 -= x; q += ` － ${x}` } else { s2 += x; q += ` ＋ ${x}` } } return { q, a: s2, e: `左から順に足し引きして ${s2}` } }
  if (op === 3) { const b = rnd(2), qt = rnd(Math.max(d - 1, 1)), r = rd(b) - 1, w = rd(2) === 1; return { q: `${b * qt + r} ÷ ${b} の${w ? '商' : '余り'}`, a: w ? qt : r, e: `${b}×${qt}＝${b * qt}、${b * qt + r}－${b * qt}＝${r}。商は${qt}・余りは${r}` } }
  if (op === 4) { const k = d === 2 ? 3 + rd(7) : d === 3 ? 10 + rd(11) : 21 + rd(20); return { q: `∛${k ** 3}（立方根）`, a: k, e: `${k}³＝${k ** 3} なので ${k}` } }
  if (op === 5) { if (rd(2) === 1) { const k = d === 2 ? rnd(2) : 100 + rd(200); return { q: `${k}²`, a: k * k, e: `${k}×${k}＝${k * k}` } } const k = d === 2 ? 3 + rd(7) : d === 3 ? 10 + rd(11) : 21 + rd(20); return { q: `${k}³`, a: k ** 3, e: `${k}×${k}×${k}＝${k ** 3}` } }
}
function xJ(op, L) {
  const m = L + 1
  if (op === 1) { const a = rd(5) * m, b = rd(5) * m, c = rd(5) + 1, d = rd(9) - 4 || 2; return { q: `x＝${a}, y＝${b} のとき ${c}x ${sg(d, 'y')} の値`, a: c * a + d * b, e: `代入して ${c}×${a} ${sg(d)}×${b}＝${c * a + d * b}` } }
  if (op === 2) {
    if (rd(2) === 1) { const n = rd(5) * 10, p = rd(9) * 10, q = rd(4) + 1; return { q: `鉛筆${q}本とノート1冊を買うと${q * p + n}円。ノートは${n}円。鉛筆1本は何円？`, a: p, e: `${q * p + n}－${n}＝${q * p}円が鉛筆${q}本分。${q * p}÷${q}＝${p}` } }
    const a = rd(4) + 1, mm = rd(3) + 1, x = rd(8) + 1; return { q: `${a} : ${a * mm} ＝ x : ${mm * x}`, a: x, e: `内項の積＝外項の積より ${a * mm}x＝${a}×${mm * x}、x＝${x}` }
  }
  if (op === 3) { const t = rd(8) + 2, k = rd(8) + 1; return { q: `鶴と亀が合わせて${t + k}匹、足の数の合計は${2 * t + 4 * k}本。亀は何匹？`, a: k, e: `全部鶴とすると足は${2 * (t + k)}本。差${2 * k}本は亀1匹につき2本ずつ増えるので 亀＝${k}匹` } }
  if (op === 4) { const a = rd(9) * (rd(2) === 1 ? 1 : -1), k = rd(6); return { q: `(x ${sg(a)})² ＝ ${k * k} の大きい方の解`, a: -a + k, e: `x ${sg(a)}＝±${k} より x＝${-a - k}, ${-a + k}。大きい方は ${-a + k}` } }
  if (rd(2) === 1) { const mm = rd(6) + 1, pp = rd(8) + 1; return { q: `√${mm * pp * pp} ÷ √${mm}`, a: pp, e: `√${mm * pp * pp}＝${pp}√${mm} なので ${pp}` } }
  const mm = rd(5) + 1, pp = rd(5) + 1, qq = rd(5) + 1; return { q: `√${mm * pp * pp} × √${mm * qq * qq}`, a: mm * pp * qq, e: `${pp}√${mm}×${qq}√${mm}＝${pp * qq}×${mm}＝${mm * pp * qq}` }
}
function xH(op, L) {
  if (op === 1) {
    if (rd(2) === 1) { const r1 = rd(8), r2 = rd(8); return { q: `x² ${sg(-(r1 + r2), 'x')} ${sg(r1 * r2)} ＝ 0 の2解を α, β とするとき α²＋β² の値`, a: r1 * r1 + r2 * r2, e: `α＋β＝${r1 + r2}、αβ＝${r1 * r2}。α²＋β²＝(α＋β)²－2αβ＝${r1 * r1 + r2 * r2}` } }
    const a = rd(4), b = rd(9) - 4 || 3, c = rd(9) - 4 || 2; return { q: `${a}x² ${sg(b, 'x')} ${sg(c)} ＝ 0 の判別式 D の値`, a: b * b - 4 * a * c, e: `D＝b²－4ac＝${b * b}－4×${a}×(${c})＝${b * b - 4 * a * c}` }
  }
  if (op === 2) {
    if (rd(2) === 1) { const a = rd(4) + 2, b = rd(3) + 1, c = rd(a); return { q: `2^${a} × 2^${b} ÷ 2^${c}`, a: 2 ** (a + b - c), e: `指数をたして引く：2^(${a}＋${b}－${c})＝2^${a + b - c}＝${2 ** (a + b - c)}` } }
    const k = rd(5) + 1; return rd(2) === 1 ? { q: `3^x ＝ ${3 ** k} を満たす x`, a: k, e: `${3 ** k}＝3^${k} なので x＝${k}` } : { q: `2^(x＋1) ＝ ${2 ** (k + 1)} を満たす x`, a: k, e: `${2 ** (k + 1)}＝2^${k + 1} なので x＋1＝${k + 1}、x＝${k}` }
  }
  if (op === 3) {
    if (rd(2) === 1) { const n = [2, 3, 4, 5, 6, 9, 10, 12][rd(8) - 1]; return { q: `π/${n} ラジアンは何度？`, a: 180 / n, e: `π＝180° なので 180°÷${n}＝${180 / n}°` } }
    const [f, v] = [['sinθ＝1/2', 180], ['cosθ＝1/2', 360], ['tanθ＝1', 270], ['sinθ＝－1/2', 540], ['cosθ＝－1/2', 360]][rd(5) - 1]
    return { q: `0°≦θ＜360° のとき ${f} を満たす θ の和`, a: v, e: `単位円で解は2つ。その和は ${v}°` }
  }
  if (op === 4) {
    const t = rd(4), a = rd(4)
    if (rd(3) === 1) { const b = rd(6), c = rd(9); return { q: `y＝${a}x² ${sg(b, 'x')} ${sg(c)} 上の x＝${t} における接線の y 切片`, a: c - a * t * t, e: `接線：y＝f′(${t})(x－${t})＋f(${t})。y切片＝f(${t})－${t}f′(${t})＝${c - a * t * t}` } }
    if (rd(2) === 1) { const c = rd(9); return { q: `y＝－x² ＋ ${2 * a}x ＋ ${c} の最大値`, a: a * a + c, e: `平方完成：y＝－(x－${a})²＋${a * a + c}。最大値 ${a * a + c}` } }
    const k = rd(4) + 1; return { q: `∫₁^${k + 1} 3x² dx`, a: (k + 1) ** 3 - 1, e: `[x³]₁^${k + 1}＝${(k + 1) ** 3}－1＝${(k + 1) ** 3 - 1}` }
  }
  const n = rd(8) + 2, r = rd(2) + 1, a = rd(4)
  if (rd(3) === 1) return { q: `Σ(k＝1→${n}) k`, a: (n * (n + 1)) / 2, e: `n(n＋1)/2＝${n}×${n + 1}/2＝${(n * (n + 1)) / 2}` }
  if (rd(2) === 1) return { q: `Σ(k＝1→${n}) k²`, a: (n * (n + 1) * (2 * n + 1)) / 6, e: `n(n＋1)(2n＋1)/6＝${(n * (n + 1) * (2 * n + 1)) / 6}` }
  return { q: `等比数列 初項${a}・公比${r + 1} の第${n > 7 ? 6 : n}項`, a: a * (r + 1) ** ((n > 7 ? 6 : n) - 1), e: `一般項 a·r^(n－1)＝${a}×${r + 1}^${(n > 7 ? 6 : n) - 1}＝${a * (r + 1) ** ((n > 7 ? 6 : n) - 1)}` }
}
function x3(op, L) {
  if (op === 1) {
    const v = rd(3)
    if (v === 1) { const n = rd(8) + 1; return { q: `lim(x→1) (x^${n} － 1) ÷ (x － 1)`, a: n, e: `(x^${n}－1)＝(x－1)(x^${n - 1}＋…＋1)。x→1 で項が${n}個の和＝${n}` } }
    if (v === 2) { const k = rd(8) + 1; return { q: `lim(x→0) (e^(${k}x) － 1) ÷ x`, a: k, e: `(e^t－1)/t→1 を使う。t＝${k}x として ${k}×1＝${k}` } }
    const c = rd(4) + 1, k = rd(5) + 1; return { q: `lim(n→∞) (${c * k}n ＋ ${rd(9)}) ÷ (${c}n ＋ ${rd(9)})`, a: k, e: `分母分子を n で割ると ${c * k}/${c}＝${k}` }
  }
  if (op === 2) {
    const a = rd(6), v = rd(3)
    if (v === 1) return { q: `f(x)＝e^(${a}x) のとき f′(0)`, a, e: `f′(x)＝${a}e^(${a}x)。x＝0 で ${a}` }
    if (v === 2) return { q: `f(x)＝sin(${a}x) のとき f′(0)`, a, e: `f′(x)＝${a}cos(${a}x)。x＝0 で ${a}` }
    const t = rd(4); return { q: `f(x)＝${a * t}ln x のとき f′(${t})`, a, e: `f′(x)＝${a * t}/x。x＝${t} で ${a}` }
  }
  if (op === 3) {
    const k = rd(5), v = rd(3)
    if (v === 1) return { q: `∫₀^π ${k} sin x dx`, a: 2 * k, e: `[－${k}cos x]₀^π＝${k}＋${k}＝${2 * k}` }
    if (v === 2) return { q: `∫₁^e ${k}/x dx`, a: k, e: `[${k}ln x]₁^e＝${k}(1－0)＝${k}` }
    const n = rd(4) + 1; return { q: `∫₀^1 ${k * (n + 1)}x^${n} dx`, a: k, e: `[${k}x^${n + 1}]₀^1＝${k}` }
  }
  if (op === 4) { const a = rd(9); return { q: `Σ(n＝1→∞) ${a}・(1/2)^n`, a, e: `初項${a}/2・公比1/2 なので (${a}/2)/(1－1/2)＝${a}` } }
  if (rd(2) === 1) { const a = rd(6), b = rd(6); return { q: `(${a} ＋ ${b}i)(${a} － ${b}i)`, a: a * a + b * b, e: `和と差の積：${a}²－(${b}i)²＝${a * a}＋${b * b}＝${a * a + b * b}` } }
  const a = rd(6), b = rd(6); return { q: `(${a} ＋ i)(${b} ＋ i) の実部`, a: a * b - 1, e: `展開：${a * b}＋${a}i＋${b}i＋i²。実部は ${a * b}－1＝${a * b - 1}` }
}
function xA(op, L) {
  if (op === 1) {
    const v = rd(3)
    if (v === 1) { const n = rd(3) + 5, m = rd(n - 3); return { q: `${n}! ÷ ${m}!`, a: fa(n) / fa(m), e: `${n}!÷${m}!＝${fa(n) / fa(m)}` } }
    if (v === 2) { const n = rd(6) + 5, r = rd(3) + 1; return { q: `${n}人から${r}人の委員を選ぶ選び方は何通り？`, a: Cm(n, r), e: `順序は関係ないので ${n}C${r}＝${Cm(n, r)}` } }
    const n = rd(4) + 5; return { q: `異なる${n}個の数字から3つを選んで並べる3桁の整数は何個？`, a: Pm(n, 3), e: `${n}P3＝${n}×${n - 1}×${n - 2}＝${Pm(n, 3)}` }
  }
  if (op === 2) { const n = rd(2) + 3, k = rd(2) + 2; return { q: `異なる${n}個の玉を${k}個の箱に入れる入れ方は何通り？（空の箱もよい）`, a: k ** n, e: `玉1個につき${k}通りなので ${k}^${n}＝${k ** n}` } }
  if (op === 3) {
    const w = ['TOKYO', 'APPLE', 'BANANA', 'LETTER', 'MAMMA'][rd(5) - 1], cnt = {}; for (const c of w) cnt[c] = (cnt[c] || 0) + 1
    const v = Object.values(cnt).reduce((t, x) => t / fa(x), fa(w.length))
    return { q: `「${w}」の文字をすべて並べかえてできる文字列は何通り？`, a: v, e: `${w.length}!÷（同じ文字の個数の階乗）＝${v}` }
  }
  if (op === 4) {
    if (rd(2) === 1) { const a = rd(800) + 100, b = rd(8) + 2; return { q: `${a} を ${b} で割った余り`, a: a % b, e: `${a}＝${b}×${Math.floor(a / b)}＋${a % b}` } }
    const i = rd(3), j = rd(3), n = 2 ** i * 3 ** j, sig = ((2 ** (i + 1) - 1) * (3 ** (j + 1) - 1)) / 2
    return { q: `${n} の正の約数の総和`, a: sig, e: `${n}＝2^${i}×3^${j}。(1＋…＋2^${i})(1＋…＋3^${j})＝${2 ** (i + 1) - 1}×${(3 ** (j + 1) - 1) / 2}＝${sig}` }
  }
  const n = rd(80) + 20, a = rd(5) + 2
  if (rd(2) === 1) return { q: `1から${n}までの整数のうち、${a}の倍数は何個？`, a: Math.floor(n / a), e: `${n}÷${a}の商＝${Math.floor(n / a)}個` }
  const b = [2, 3, 5, 7].filter((x) => gcd(x, a) === 1)[0]
  return { q: `1から${n * 3}までの整数のうち、${a}でも${b}でも割り切れる数は何個？`, a: Math.floor((n * 3) / (a * b)), e: `${a}と${b}は互いに素。${a * b}の倍数を数えて ${Math.floor((n * 3) / (a * b))}個` }
}
const RX = [['2H₂ ＋ O₂ → 2H₂O', 'H₂', 'H₂O', 2, 2], ['N₂ ＋ 3H₂ → 2NH₃', 'H₂', 'NH₃', 3, 2], ['CH₄ ＋ 2O₂ → CO₂ ＋ 2H₂O', 'O₂', 'CO₂', 2, 1], ['C₃H₈ ＋ 5O₂ → 3CO₂ ＋ 4H₂O', 'C₃H₈', 'CO₂', 1, 3], ['2KClO₃ → 2KCl ＋ 3O₂', 'KClO₃', 'O₂', 2, 3]]
function xC(op, L) {
  if (op === 4) { const [eq, f, t, cf, ct] = RX[rd(5) - 1], k = rd(4); return { q: `${eq}　${f} ${cf * k}mol を反応させると ${t} は何mol できる（または反応する）？`, a: ct * k, e: `係数比 ${f}：${t}＝${cf}：${ct}。${cf * k}×${ct}/${cf}＝${ct * k}mol` } }
  if (op === 3 && L === 3) { const c1 = rd(2), c2 = rd(2), v = 100 * rd(2); return { q: `${c1}mol/L の塩酸 ${v}mL を中和するのに、${c2}mol/L の水酸化ナトリウム水溶液は何mL必要？`, a: (c1 * v) / c2, e: `H⁺の物質量＝OH⁻の物質量：${c1}×${v}＝${c2}×x より x＝${(c1 * v) / c2}mL` } }
}
const X = { S: xS, J: xJ, H: xH, III: x3, A: xA, CH: xC }
const pick = (M, op, L, base) => { const r = Math.random(), v = (r < 0.4 && Y[M](op, L)) || (r >= 0.4 && r < 0.75 && X[M](op, L)); return v || base(op, L) }

// ===== 語彙・文法・日本史の問題数を増やす =====
WB.W3.push(...wb('allow:許す,arrive:到着する,believe:信じる,belong:所属する,bridge:橋,century:世紀,collect:集める,comfortable:快適な,communicate:意思疎通する,culture:文化,dangerous:危険な,describe:説明する,develop:発達させる,difficult:難しい,discuss:話し合う,educate:教育する,environment:環境,exchange:交換する,experience:経験,express:表現する,familiar:よく知られた,foreign:外国の,government:政府,graduate:卒業する,introduce:紹介する,invent:発明する,island:島,journey:旅,language:言語,local:地元の,manage:管理する,medicine:薬,message:伝言,nature:自然,necessary:必要な,opinion:意見,perform:演じる,prepare:準備する,produce:生産する,promise:約束する,recycle:再利用する,repair:修理する'))
WB.W2.push(...wb('abroad:海外へ,accurate:正確な,advertise:宣伝する,afford:～する余裕がある,aware:気づいて,campaign:運動,challenge:挑戦,circumstance:状況,conclude:結論づける,confirm:確認する,conflict:対立,contribute:貢献する,convenient:便利な,cooperate:協力する,creature:生き物,decline:減少する,demand:需要,deliver:配達する,disaster:災害,distance:距離,effect:影響,emerge:現れる,encourage:励ます,essential:不可欠な,evidence:証拠,expert:専門家,extinct:絶滅した,fashion:流行,frequently:頻繁に,hesitate:ためらう,identify:特定する,ignore:無視する,inform:知らせる,lack:不足,limit:制限,majority:大多数,mention:言及する,obvious:明らかな,occur:起こる,pollution:汚染,predict:予測する,previous:以前の'))
WB.WP1.push(...wb('acquire:獲得する,advocate:擁護する,sustain:維持する,allocate:割り当てる,alleviate:軽減する,anticipate:予期する,arbitrary:恣意的な,authentic:本物の,bias:偏見,comprehensive:包括的な,compromise:妥協,conceal:隠す,controversy:論争,convey:伝える,deceive:だます,demonstrate:実証する,deprive:奪う,deliberate:意図的な,diminish:減少させる,discard:捨てる,distinguish:区別する,diverse:多様な,dominate:支配する,endure:耐える,enforce:実施する,exaggerate:誇張する,exhaust:使い果たす,exploit:搾取する,fluctuate:変動する,foster:育成する,hinder:妨げる,implement:実行する,inherent:固有の,instinct:本能,negotiate:交渉する,neutral:中立の,obstacle:障害,oppose:反対する,perceive:知覚する,persist:固執する,prevail:普及している,reinforce:強化する'))
WB.W1.push(...wb('abate:和らぐ,abstain:控える,adversity:逆境,ambivalent:相反する感情を持つ,arduous:骨の折れる,austere:厳格な,benevolent:慈悲深い,blatant:露骨な,candid:率直な,circumvent:回避する,clandestine:秘密の,coerce:強制する,cogent:説得力のある,condone:容認する,conspicuous:目立つ,copious:豊富な,culminate:頂点に達する,daunting:気後れさせる,debilitate:衰弱させる,deference:敬意,disparage:けなす,dissent:異議,eloquent:雄弁な,enigma:謎,exacerbate:悪化させる,exonerate:無罪にする,frugal:質素な,gregarious:社交的な,haphazard:行き当たりばったりの,idiosyncrasy:特異性,impetus:勢い,inadvertent:不注意による,indigenous:土着の,innocuous:無害な,lethargic:無気力な,magnanimous:寛大な,nefarious:極悪の,obscure:不明瞭な,ostentatious:見せびらかしの,paramount:最高の,perfunctory:おざなりの,quixotic:非現実的に理想主義の'))
WB.K.push(...wb('あてなり:上品だ,いとほし:かわいそうだ,おとなし:大人びている,かしこし:恐れ多い,さうざうし:物足りない,すさまじ:興ざめだ,つれなし:冷淡だ,ねんごろなり:丁寧だ,はかなし:頼りない,めづ:愛する,やさし:恥ずかしい,よろづ:すべて,らうたし:いじらしい,あながち:むやみに,いたづらなり:むなしい,おぼつかなし:はっきりしない,かたし:難しい,けしき:様子,ことわり:道理,さらなり:言うまでもない,しのぶ:思い慕う,たより:ついで,ひねもす:一日中,わりなし:どうしようもない,おぼす:お思いになる,つひに:最後に,ありく:歩き回る,あまた:たくさん,いざ:さあ,げに:本当に,さすがに:そうはいってもやはり'))
WB.KJ.push(...wb('稀有:けう,趨勢:すうせい,蓋し:けだし,彷彿:ほうふつ,諧謔:かいぎゃく,瑕疵:かし,矜持:きょうじ,軋轢:あつれき,拙速:せっそく,陳腐:ちんぷ,凡庸:ぼんよう,蛇足:だそく,疎外:そがい,暫定:ざんてい,抜粋:ばっすい,揶揄:やゆ,刹那:せつな,相殺:そうさい,破綻:はたん,払底:ふってい,糾弾:きゅうだん,逼迫:ひっぱく,忖度:そんたく,寡黙:かもく,迂回:うかい,顛末:てんまつ,啓蒙:けいもう,吟味:ぎんみ,煩雑:はんざつ,台頭:たいとう,凌駕:りょうが,暗澹:あんたん'))
GB.push(
  [1, 1, 'She ( ) to school every day.', 'go|goes|going|went', 1, '主語が三人称単数・現在の習慣 → goes'],
  [1, 1, 'I ( ) my homework when my mother came home.', 'do|did|was doing|have done', 2, '過去のある時点で進行中 → 過去進行形 was doing'],
  [1, 2, 'He ( ) already left when I arrived.', 'has|had|have|was', 1, '到着より前に完了 → 過去完了 had left'],
  [1, 2, 'If it ( ) tomorrow, we will stay home.', 'rains|will rain|rained|is raining', 0, '時・条件の副詞節は未来のことも現在形 rains'],
  [1, 3, 'This time next week, I ( ) on the beach.', 'lie|will lie|will be lying|have lain', 2, '未来のある時点で進行中 → 未来進行形'],
  [1, 3, 'She ( ) here for two hours by the time he comes.', 'waits|has waited|will have been waiting|waited', 2, 'by the time ～ は未来完了（進行）will have been waiting'],
  [2, 1, 'The man ( ) I met yesterday is a doctor.', 'whom|whose|which|what', 0, '先行詞が人で目的格 → whom（that や省略も可）'],
  [2, 1, 'This is the book ( ) I bought yesterday.', 'who|which|whose|where', 1, '先行詞が物 → which'],
  [2, 2, 'I know the reason ( ) he was absent.', 'what|why|where|when', 1, 'reason が先行詞なら関係副詞 why'],
  [2, 2, 'He ran fast ( ) he could catch the train.', 'so that|because|although|unless', 0, '目的を表す so that ～ can'],
  [2, 3, '( ) you like it or not, you have to do it.', 'If|Whether|Unless|Since', 1, 'Whether ～ or not（～であろうとなかろうと）'],
  [2, 3, 'He is the only man ( ) I can trust.', 'who|which|that|whom', 2, 'the only がつく先行詞には that が好まれる'],
  [3, 1, 'You ( ) see a doctor. You look pale.', 'may|should|can|will', 1, '助言は should'],
  [3, 1, '( ) I open the window?', 'Shall|Will|May|Must', 2, '許可を求める May I ～?'],
  [3, 2, 'He ( ) have been tired, because he went to bed early.', 'must|can|should|may', 0, '過去の推量 must have p.p.（～だったにちがいない）'],
  [3, 2, 'I wish I ( ) a bird.', 'am|were|will be|had', 1, '現在の願望（仮定法過去）I wish I were'],
  [3, 3, 'If I had known the truth, I ( ) him.', 'would help|will help|would have helped|helped', 2, '仮定法過去完了 would have p.p.'],
  [3, 3, 'It is high time you ( ) to bed.', 'go|went|will go|have gone', 1, 'It is time＋仮定法過去（もう～してよい頃だ）'],
  [4, 1, 'She is good ( ) playing the piano.', 'in|at|on|to', 1, 'be good at ～（～が得意）'],
  [4, 1, 'We arrived ( ) Osaka at noon.', 'at|in|on|to', 1, '大きな都市には in を使う（arrive in ～）'],
  [4, 2, 'I am looking forward ( ) you.', 'to see|to seeing|seeing|see', 1, 'look forward to ～ing'],
  [4, 2, 'He is proud ( ) his son.', 'at|of|for|with', 1, 'be proud of ～'],
  [4, 3, 'The teacher is familiar ( ) the students.', 'of|with|at|for', 1, 'be familiar with ～（～に精通している）'],
  [4, 3, 'He apologized ( ) me for being late.', 'at|for|to|with', 2, 'apologize to 人 for 事'],
)
JHB.push(
  [1, 1, '平安京に都を移した天皇は？', '桓武天皇', '794年', 'p'], [1, 2, '壬申の乱に勝利して即位した天皇は？', '天武天皇', '672年', 'p'],
  [1, 2, '「源氏物語」の作者は？', '紫式部', '藤原道長の時代の女房', 'p'], [1, 2, '「枕草子」の作者は？', '清少納言', '一条天皇の中宮定子に仕えた', 'p'],
  [1, 2, '鎌倉幕府の滅亡後、建武の新政を行った天皇は？', '後醍醐天皇', '1333年', 'p'], [1, 3, '室町幕府を開き、初代将軍となった人物は？', '足利尊氏', '1338年に征夷大将軍に任命', 'p'],
  [1, 3, '日明貿易（勘合貿易）を始めた3代将軍は？', '足利義満', '15世紀初め', 'p'], [2, 1, '江戸幕府を開いた人物は？', '徳川家康', '1603年', 'p'],
  [2, 2, '参勤交代を制度化した3代将軍は？', '徳川家光', '島原の乱後に鎖国体制を整えた', 'p'], [2, 2, '「南総里見八犬伝」の作者は？', '曲亭馬琴', '化政文化の読本作者', 'p'],
  [2, 3, '生類憐みの令を出した5代将軍は？', '徳川綱吉', '元禄文化の時代', 'p'], [2, 3, '株仲間を奨励し商業を重視した老中は？', '田沼意次', '田沼時代', 'p'],
  [3, 1, '黒船で来航し開国を求めたアメリカ人は？', 'ペリー', '1853年、浦賀に来航', 'p'], [3, 2, '薩長同盟の仲介をした土佐藩出身の人物は？', '坂本龍馬', '1866年', 'p'],
  [3, 2, '民撰議院設立建白書を提出した人物の一人は？', '板垣退助', '1874年。自由民権運動のきっかけ', 'p'], [3, 3, '立憲改進党を結成した人物は？', '大隈重信', '1882年', 'p'],
  [1, 2, '飛鳥時代に中大兄皇子らが行った政治改革は？', '大化の改新', '645年', 't'], [1, 2, '唐の律令制にならって701年に完成した法は？', '大宝律令', '', 't'],
  [1, 2, '743年に開墾地の私有を認めた法は？', '墾田永年私財法', '荘園成立のきっかけ', 't'], [1, 3, '後鳥羽上皇が幕府打倒を図って敗れた1221年の戦いは？', '承久の乱', '幕府の支配が西国に及んだ', 't'],
  [1, 3, '御家人の困窮を救うため1297年に出された法令は？', '永仁の徳政令', '元寇後の財政難', 't'], [2, 2, '大名が1年おきに江戸と領地を往復した制度は？', '参勤交代', '徳川家光が制度化', 't'],
  [2, 3, '1858年に結ばれた、領事裁判権を認めた不平等条約は？', '日米修好通商条約', '関税自主権もなかった', 't'], [3, 2, '1873年に行われた土地の税制改革は？', '地租改正', '地価の3％を現金で納める', 't'],
  [3, 2, '1873年に公布された、満20歳の男子に兵役を課した法令は？', '徴兵令', '国民皆兵をめざした', 't'], [3, 3, '1925年に成立した、25歳以上の男子に選挙権を与えた法は？', '普通選挙法', '同年に治安維持法も制定', 't'],
  [1, 1, '大化の改新が始まった年は？', '645年', '', 'y'], [1, 2, '鎌倉幕府が滅亡した年は？', '1333年', '', 'y'], [1, 2, '元寇の文永の役が起こった年は？', '1274年', '', 'y'],
  [2, 2, '鎖国体制が完成（ポルトガル船来航禁止）した年は？', '1639年', '', 'y'], [2, 3, '島原の乱が起こった年は？', '1637年', '', 'y'],
  [3, 2, '新橋〜横浜間に鉄道が開通した年は？', '1872年', '', 'y'], [3, 3, '日清戦争が始まった年は？', '1894年', '', 'y'],
  [3, 3, '日露戦争が始まった年は？', '1904年', '', 'y'], [3, 3, '関東大震災が起こった年は？', '1923年', '', 'y'],
)


// ===== 第2弾：語彙・文法・日本史をさらに拡充 =====
WB.W3.push(...wb('absent:欠席の,accident:事故,address:住所,advice:助言,afraid:恐れて,agree:賛成する,ahead:前方に,alone:ひとりで,appear:現れる,area:地域,argue:議論する,article:記事,athlete:運動選手,attention:注意,average:平均,bake:焼く,beach:浜辺,bill:請求書,blind:目の見えない,boil:沸騰させる,boring:退屈な,brave:勇敢な,breathe:呼吸する,broken:壊れた,burn:燃やす,business:商売,careful:注意深い,cause:原因,celebrate:祝う,chance:機会,cheap:安い,cheer:声援を送る,climb:登る,close:近い,cloud:雲,cost:費用がかかる,crowd:群衆,custom:風習,damage:損害,deep:深い,department:部門,depend:頼る,destroy:破壊する,direction:方向,dirty:汚い,disappear:消える,divide:分ける,doubt:疑い,dream:夢,earn:稼ぐ,earth:地球,electric:電気の,empty:空の,enemy:敵,engine:エンジン,enter:入る,equal:等しい,escape:逃げる,event:出来事,exactly:正確に,example:例,excellent:優れた,expensive:高価な,explain:説明する,fail:失敗する,fair:公平な,fall:落ちる,farm:農場,fear:恐れ,final:最後の,fix:修理する,flight:飛行,forest:森,forget:忘れる,fresh:新鮮な,fuel:燃料,gather:集まる,gentle:優しい,gift:贈り物,glad:うれしい,grow:育つ,guide:案内する,habit:癖,hardly:ほとんど～ない,health:健康,heavy:重い,hide:隠す,honest:正直な,hurry:急ぐ,imagine:想像する,important:重要な,include:含む,independent:独立した,interest:興味,join:参加する,lead:導く,lend:貸す,lift:持ち上げる,lonely:孤独な,loud:大声の,main:主な,match:試合,matter:問題,mean:意味する,meal:食事,memory:記憶,mistake:間違い,narrow:狭い,notice:気づく,offer:申し出る,order:注文する'))
WB.W2.push(...wb('absorb:吸収する,abuse:虐待,access:利用する権利,accompany:同行する,adapt:適応する,adjust:調整する,admire:称賛する,admit:認める,adopt:採用する,affect:影響を与える,agency:代理店,agreement:合意,alternative:代案,amaze:驚嘆させる,analyze:分析する,announce:発表する,anxious:心配な,apologize:謝る,appeal:訴える,appoint:任命する,approach:近づく,approve:承認する,arrange:手配する,assist:手伝う,assume:仮定する,atmosphere:雰囲気,attempt:試みる,audience:聴衆,authority:権威,available:利用できる,avoid:避ける,bend:曲げる,blame:責める,boundary:境界,budget:予算,capacity:収容力,cancel:取り消す,charge:請求する,climate:気候,collapse:崩壊する,combine:結合させる,comment:論評,commit:犯す,compare:比較する,compete:競争する,complex:複雑な,concentrate:集中する,concern:懸念,condition:状態,conduct:実施する,conscious:意識して,consume:消費する,contain:含む,content:内容,convince:納得させる,crisis:危機,crucial:決定的な,cure:治す,curious:好奇心の強い,defeat:負かす,defend:守る,define:定義する,delay:遅らせる,depart:出発する,deserve:値する,desire:願望,destination:目的地,detail:詳細,device:装置,differ:異なる,disappoint:失望させる,discipline:規律,display:展示する,distribute:分配する,disturb:邪魔する,domestic:国内の,economy:経済,edit:編集する,electronic:電子の,eliminate:排除する,employ:雇う,enable:可能にする,enormous:莫大な,entire:全体の,equip:備え付ける,error:誤り,establish:設立する,evaluate:評価する'))
WB.WP1.push(...wb('abolish:廃止する,absurd:ばかげた,abundant:豊富な,accelerate:加速させる,accessible:近づきやすい,accommodate:収容する,accountable:説明責任がある,accuse:告発する,acknowledge:認識する,adhere:忠実に守る,adjacent:隣接した,affiliate:提携する,affluent:豊かな,aggregate:集計,alienate:疎遠にする,ambitious:野心的な,amend:修正する,analogy:類似,annual:年間の,apparent:明白な,apprehend:理解する,appropriate:適切な,assert:主張する,assess:査定する,attribute:～のせいにする,backlog:未処理分,barrier:障壁,bizarre:奇妙な,boast:自慢する,brief:簡潔な,brutal:残酷な,bureaucracy:官僚制,cease:終わる,clarify:明確にする,coherent:一貫した,collaborate:共同で働く,collide:衝突する,commemorate:記念する,compel:強いる,compensate:補償する,competent:有能な,complement:補完する,complicate:複雑にする,comply:従う,comprise:構成する,compulsory:義務的な,conceive:思いつく,condemn:糾弾する,confer:授ける,confine:閉じ込める,consecutive:連続した,consensus:総意,consolidate:統合する,constrain:制約する,contemplate:熟考する,contradict:矛盾する,contrary:反対の,convene:召集する,convict:有罪とする,correspond:一致する,counterpart:対応するもの,credible:信頼できる,cumulative:累積的な,curb:抑制する,decisive:決定的な,deduce:推論する,default:怠慢,defy:反抗する,degrade:品位を落とす,delegate:委任する,denote:示す,deplete:枯渇させる,depict:描写する,derive:引き出す,designate:指名する,detain:拘留する,deviate:逸脱する,devise:考案する,devote:捧げる,digress:脱線する,disclose:暴露する,discriminate:差別する,dismantle:解体する,disperse:散らばる,dispose:処分する,disrupt:混乱させる'))
WB.W1.push(...wb('abhor:忌み嫌う,abridge:要約する,abrupt:突然の,acerbic:辛辣な,acrimony:敵意,adamant:頑固な,adept:熟達した,admonish:戒める,adulation:追従,affable:愛想のよい,alacrity:敏速,altruistic:利他的な,amalgamate:合併する,anathema:忌み嫌われるもの,annihilate:全滅させる,antagonize:敵に回す,apathy:無関心,appease:なだめる,arbitrate:仲裁する,archaic:古風な,ardent:熱烈な,articulate:明確に述べる,ascertain:確かめる,aspire:熱望する,assuage:和らげる,astute:抜け目のない,audacious:大胆な,augment:増大させる,auspicious:幸先のよい,avarice:強欲,banal:陳腐な,bask:浴びる,bewilder:当惑させる,bolster:補強する,brevity:簡潔さ,camaraderie:友情,cajole:甘言で誘う,castigate:厳しく非難する,catalyst:触媒,caustic:腐食性の,censure:非難,chagrin:無念,chastise:叱責する,circumspect:慎重な,clemency:寛大さ,coalesce:合体する,cohesive:結束した,commensurate:釣り合った,complacent:自己満足した,concur:同意する,conducive:助けになる,contentious:議論を呼ぶ,convoluted:入り組んだ,corroborate:裏付ける,covert:隠れた,credulous:信じやすい,cryptic:謎めいた,curtail:削減する,cynical:冷笑的な,debacle:大失敗,decorum:礼儀,defunct:消滅した,delineate:詳しく描く,demise:終焉,deride:嘲笑する,derogatory:軽蔑的な,desultory:とりとめのない,deter:思いとどまらせる,devious:回りくどい,diffident:内気な,discern:見分ける,disdain:軽蔑,disseminate:広める,dogmatic:独断的な,dubious:疑わしい,eccentric:風変わりな,efface:消し去る,egregious:ひどい,elicit:引き出す,eminent:著名な,empirical:経験的な,emulate:見習う,endemic:風土性の,enervate:弱らせる,equivocal:どちらとも取れる,erudite:博学な,esoteric:難解な,euphemism:婉曲表現,evanescent:消えゆく,exemplary:模範的な,exhort:強く勧める,expedient:好都合な,explicit:明示的な,extol:激賞する,facetious:ふざけた,fallacy:誤り,fervent:燃えるような'))
WB.K.push(...wb('あからさまなり:ほんのちょっとの間,あした:朝,いとど:いっそう,いはけなし:幼い,いぶせし:うっとうしい,うたて:いやに,うるはし:きちんとして美しい,おいらかなり:穏やかだ,おどろおどろし:ものものしい,おぼゆ:思われる,かこつ:ぐちをこぼす,きは:身分,きよらなり:気品があって美しい,くちをし:残念だ,けうとし:気味が悪い,こころにくし:奥ゆかしい,こころもとなし:じれったい,こちたし:仰々しい,さかし:賢い,さぶらふ:おそばに仕える,しどけなし:だらしない,せちなり:切実だ,ただなり:普通だ,たのもし:頼りになる,つきづきし:ふさわしい,つつまし:はばかられる,とく:早く,ところせし:窮屈だ,とみなり:急だ,なかなかなり:中途半端だ,なつかし:心ひかれる,なべて:一般に,なめし:無礼だ,なやむ:病気で苦しむ,にくし:気に入らない,ねたし:しゃくだ,のたまふ:おっしゃる,はづかし:こちらが気後れするほど立派だ,はるかなり:遠い,ひがごと:間違い,ふみ:手紙,ほいなし:不本意だ,まうく:用意する,まばゆし:まぶしい,まめなり:誠実だ,みやび:優雅,むつかし:不快だ,めやすし:感じがよい,ものうし:おっくうだ,やむごとなし:高貴だ,やをら:そっと,ゆめ:決して,らうがはし:乱雑だ,わづらふ:悩む,をこなり:愚かだ,あるじ:主人,あぢきなし:つまらない,さらぬ:避けられない,ところ:場所'))
WB.KJ.push(...wb('遜色:そんしょく,概して:がいして,逐一:ちくいち,絶句:ぜっく,趣向:しゅこう,嗜好:しこう,憧憬:しょうけい,脚光:きゃっこう,一蹴:いっしゅう,辛辣:しんらつ,彷徨:ほうこう,傲慢:ごうまん,謙虚:けんきょ,懸隔:けんかく,狭隘:きょうあい,鬱屈:うっくつ,蒙昧:もうまい,隘路:あいろ,瓦解:がかい,遺憾:いかん,威嚇:いかく,畏怖:いふ,陰鬱:いんうつ,隠蔽:いんぺい,云々:うんぬん,穏便:おんびん,恩赦:おんしゃ,懐疑:かいぎ,概略:がいりゃく,画期的:かっきてき,渇望:かつぼう,葛藤:かっとう,完遂:かんすい,寛容:かんよう,稀薄:きはく,規範:きはん,偽装:ぎそう,奇抜:きばつ,欺瞞:ぎまん,詭弁:きべん,虚栄:きょえい,欣喜:きんき,勤勉:きんべん,軽蔑:けいべつ,啓発:けいはつ,契機:けいき,傑出:けっしゅつ,懸命:けんめい,厳粛:げんしゅく,巧妙:こうみょう,拘束:こうそく,懇願:こんがん,混沌:こんとん,錯誤:さくご,惨憺:さんたん,示威:じい,嫉妬:しっと,灼熱:しゃくねつ,洒脱:しゃだつ,周到:しゅうとう,熟慮:じゅくりょ,峻厳:しゅんげん,遵守:じゅんしゅ,叙述:じょじゅつ,浸透:しんとう,尽力:じんりょく,迅速:じんそく,枢要:すうよう,清廉:せいれん,折衷:せっちゅう,漸次:ぜんじ,疎通:そつう,措置:そち,怠惰:たいだ,耽溺:たんでき,弾劾:だんがい,嘲笑:ちょうしょう,懲罰:ちょうばつ,沈殿:ちんでん,墜落:ついらく,徹底:てってい,転嫁:てんか,倒錯:とうさく,陶酔:とうすい,蕩尽:とうじん,凸凹:でこぼこ,捏造:ねつぞう,把握:はあく,排斥:はいせき,媒介:ばいかい,迫害:はくがい,剝奪:はくだつ,波紋:はもん,繁忙:はんぼう,披露:ひろう,頻繁:ひんぱん,憤慨:ふんがい,偏屈:へんくつ,弁償:べんしょう,庇護:ひご,冒頭:ぼうとう,膨大:ぼうだい,麻痺:まひ,摩耗:まもう,末梢:まっしょう,敏腕:びんわん,無尽蔵:むじんぞう,滅却:めっきゃく,網羅:もうら,模倣:もほう,揺籃:ようらん,余韻:よいん,履歴:りれき,流布:るふ,隆盛:りゅうせい,賄賂:わいろ,歪曲:わいきょく'))
// 同じ英語・同じ意味の重複は除く（選択肢に正解が2つ並ばないように）
for (const k of Object.keys(WB)) { const e = new Set(), j = new Set(); WB[k] = WB[k].filter(([a, b]) => !e.has(a) && !j.has(b) && e.add(a) && j.add(b)) }

const IRR = 'go went gone,see saw seen,take took taken,give gave given,write wrote written,eat ate eaten,begin began begun,break broke broken,speak spoke spoken,drive drove driven,know knew known,grow grew grown,fly flew flown,wear wore worn,choose chose chosen,fall fell fallen,forget forgot forgotten,swim swam swum,sing sang sung,drink drank drunk,come came come,run ran run,ride rode ridden,rise rose risen,steal stole stolen,throw threw thrown,draw drew drawn,show showed shown,bite bit bitten,hide hid hidden,shake shook shaken,bring brought brought,buy bought bought,catch caught caught,teach taught taught,think thought thought,build built built,lend lent lent,send sent sent,spend spent spent,feel felt felt,keep kept kept,sleep slept slept,leave left left,lose lost lost,hold held held,meet met met,pay paid paid,say said said,sell sold sold,tell told told,understand understood understood,win won won,hear heard heard,make made made,find found found,stand stood stood,sit sat sat'.split(',').map((x) => x.split(' '))
function genIrr(L) {
  const th = Math.ceil(IRR.length / 3), pool = IRR.slice((L - 1) * th, L * th), v = pool[rd(pool.length) - 1], k = rd(2), ans = v[k]
  const wrong = [...new Set([v[0], v[1], v[2], ...shuf(IRR.flatMap((x) => [x[1], x[2]]))])].filter((x) => x !== ans)
  const ch = shuf([ans, ...wrong.slice(0, 3)])
  return { q: `「${v[0]}」の${k === 1 ? '過去形' : '過去分詞'}は？`, ch, a: ch.indexOf(ans), e: `${v[0]}－${v[1]}－${v[2]}（原形－過去形－過去分詞）` }
}
const TI = ['to不定詞のみ', '動名詞（～ing）のみ', 'どちらも可（意味は同じ）', 'どちらも可（意味が変わる）']
const TOING = [['want', 0], ['hope', 0], ['decide', 0], ['plan', 0], ['promise', 0], ['refuse', 0], ['enjoy', 1], ['finish', 1], ['avoid', 1], ['mind', 1], ['practice', 1], ['like', 2], ['love', 2], ['begin', 2], ['start', 2], ['manage', 0], ['afford', 0], ['expect', 0], ['agree', 0], ['offer', 0], ['learn', 0], ['pretend', 0], ['fail', 0], ['consider', 1], ['admit', 1], ['deny', 1], ['suggest', 1], ['escape', 1], ['imagine', 1], ['give up', 1], ['put off', 1], ['miss', 1], ['keep', 1], ['continue', 2], ['prefer', 2], ['hate', 2], ['remember', 3], ['forget', 3], ['try', 3], ['regret', 3], ['stop', 3]]
function genToIng(L) {
  const th = Math.ceil(TOING.length / 3), pool = TOING.slice((L - 1) * th, L * th), [v, c] = pool[rd(pool.length) - 1]
  const ch = shuf(TI)
  return { q: `動詞「${v}」の後ろに動詞を続けるときの形は？`, ch, a: ch.indexOf(TI[c]), e: `${v} は ${TI[c]}` }
}
GB.push(
  [1, 1, 'He ( ) basketball every Sunday.', 'play|plays|playing|played', 1, '三人称単数の現在形 plays'],
  [1, 1, 'We ( ) dinner at seven yesterday.', 'have|had|has|having', 1, 'yesterday があるので過去形 had'],
  [1, 2, 'I have lived here ( ) 2010.', 'for|since|during|from', 1, '起点を表す語には since'],
  [1, 2, 'He has ( ) his key. He cannot get in.', 'lose|lost|losing|loses', 1, '現在完了 has p.p. → lost'],
  [1, 2, 'The movie ( ) when we arrived at the theater.', 'already started|had already started|has already started|is already starting', 1, '到着より前に始まっていた → 過去完了'],
  [1, 2, 'Look! It ( ) now.', 'snows|is snowing|snowed|has snowed', 1, '今まさに進行中 → 現在進行形'],
  [1, 3, 'I ( ) him since last year.', 'did not see|have not seen|do not see|will not see', 1, 'since を伴う継続 → 現在完了'],
  [1, 3, 'By next year, he ( ) here for ten years.', 'lives|has lived|will have lived|lived', 2, '未来のある時点までの継続 → 未来完了'],
  [1, 3, 'She ( ) a book when the phone rang.', 'read|was reading|has read|reads', 1, '電話が鳴った時点で進行中 → 過去進行形'],
  [2, 1, 'I have a friend ( ) lives in Canada.', 'who|which|whom|whose', 0, '先行詞が人・主格 → who'],
  [2, 1, 'The bag ( ) she is carrying is heavy.', 'who|which|whose|where', 1, '先行詞が物 → which'],
  [2, 2, 'This is the town ( ) I was born.', 'which|where|who|what', 1, '場所を表す関係副詞 where'],
  [2, 2, 'I will call you ( ) I get home.', 'as soon as|so that|because of|although', 0, 'as soon as ～（～するとすぐに）'],
  [2, 2, 'He was tired, ( ) he went on working.', 'but|so|for|or', 0, '逆接の but'],
  [2, 3, 'All ( ) I want is your happiness.', 'what|that|which|who', 1, 'all が先行詞のとき関係代名詞は that'],
  [2, 3, '( ) he said was not true.', 'That|What|Which|Who', 1, 'what he said＝彼が言ったこと（名詞節）'],
  [2, 3, 'The girl ( ) mother is a doctor is my friend.', 'who|whose|whom|which', 1, '所有格 whose'],
  [2, 3, 'I do not know ( ) he will come or not.', 'if|whether|that|what', 1, 'whether ～ or not（～かどうか）'],
  [3, 1, '( ) you help me with this?', 'May|Can|Must|Shall', 1, '依頼は Can you ～?'],
  [3, 1, 'You ( ) not smoke here.', 'must|can|may|will', 0, '禁止は must not'],
  [3, 2, 'If I ( ) rich, I would travel around the world.', 'am|were|will be|have been', 1, '現在の事実に反する仮定法過去'],
  [3, 2, 'She ( ) have missed the train.', 'can|must|may|should', 1, 'must have p.p. ～したにちがいない'],
  [3, 2, 'You ( ) have told me earlier.', 'must|should|can|will', 1, 'should have p.p. ～すべきだったのに'],
  [3, 3, 'I would rather you ( ) smoke here.', 'do not|did not|will not|have not', 1, 'would rather ＋ 仮定法過去（～してほしくない）'],
  [3, 3, 'But for your help, I ( ) failed.', 'would have|will have|had|would', 0, 'But for ～＝If it had not been for ～（仮定法過去完了）'],
  [3, 3, 'Without water, no living thing ( ) survive.', 'can|could|will|should', 1, 'Without ～（仮定法過去）→ could'],
  [3, 3, 'She suggested that he ( ) a doctor.', 'sees|see|saw|seeing', 1, '提案の suggest の that節は動詞原形（should省略）'],
  [4, 1, 'He is afraid ( ) dogs.', 'for|of|to|at', 1, 'be afraid of ～'],
  [4, 1, 'I live ( ) Tokyo.', 'at|in|on|to', 1, '都市の中 → in'],
  [4, 2, 'She is jealous ( ) her sister.', 'of|at|for|with', 0, 'be jealous of ～（～をうらやむ）'],
  [4, 2, 'He explained the rule ( ) me.', 'for|to|at|on', 1, 'explain 事 to 人'],
  [4, 2, 'This book consists ( ) three parts.', 'in|of|from|with', 1, 'consist of ～（～から成る）'],
  [4, 3, 'She is indifferent ( ) fashion.', 'at|to|for|with', 1, 'be indifferent to ～（～に無関心だ）'],
  [4, 3, 'He was deprived ( ) his rights.', 'from|of|for|with', 1, 'deprive 人 of 物（人から物を奪う）'],
  [4, 3, 'I take ( ) my father in appearance.', 'after|for|on|to', 0, 'take after ～（～に似ている）'],
  [4, 3, 'Please look ( ) this matter carefully.', 'at|into|for|after', 1, 'look into ～（調査する）'],
)
JHB.push(
  [1, 1, '邪馬台国の女王は？', '卑弥呼', '魏に使いを送り「親魏倭王」の称号を得た', 'p'], [1, 1, '十七条の憲法を定めた人物は？', '聖徳太子', '604年', 'p'],
  [1, 2, '遣唐使の停止を提案した人物は？', '菅原道真', '894年', 'p'], [1, 2, '東大寺の大仏造立を命じた天皇は？', '聖武天皇', '743年に詔を出した', 'p'],
  [1, 2, '「古今和歌集」の編者の一人で「土佐日記」を書いた人物は？', '紀貫之', '', 'p'], [1, 2, '摂関政治の全盛期を築いた人物は？', '藤原道長', '摂政・関白として一族を繁栄させた', 'p'],
  [1, 2, '院政を始めた上皇は？', '白河上皇', '1086年', 'p'], [1, 2, '平氏政権を築き太政大臣になった人物は？', '平清盛', '日宋貿易も推進', 'p'],
  [1, 2, '壇ノ浦で平氏を滅ぼした源氏の武将は？', '源義経', '1185年', 'p'], [1, 2, '鎌倉幕府の初代執権は？', '北条時政', '源頼朝の妻・政子の父', 'p'],
  [1, 3, '浄土宗を開いた僧は？', '法然', '専修念仏', 'p'], [1, 3, '浄土真宗を開いた僧は？', '親鸞', '悪人正機', 'p'],
  [1, 3, '日蓮宗（法華宗）を開いた僧は？', '日蓮', '題目を唱える', 'p'], [1, 3, '臨済宗を日本に伝えた僧は？', '栄西', '', 'p'],
  [1, 3, '曹洞宗を伝え永平寺を開いた僧は？', '道元', '只管打坐', 'p'], [1, 3, '能を大成した、観阿弥の子は？', '世阿弥', '', 'p'],
  [1, 3, '銀閣を建てた8代将軍は？', '足利義政', '応仁の乱のときの将軍', 'p'], [1, 3, '水墨画を大成した人物は？', '雪舟', '', 'p'],
  [1, 3, '元寇に対処した鎌倉幕府の執権は？', '北条時宗', '', 'p'],
  [1, 1, '古代、豪族の墓として造られた大規模な墓は？', '古墳', '前方後円墳など', 't'], [1, 2, '現存する世界最古の木造建築の寺は？', '法隆寺', '聖徳太子ゆかり', 't'],
  [1, 2, '710年に遷都された都は？', '平城京', '元明天皇', 't'], [1, 2, '農民に口分田を与えた制度は？', '班田収授法', '', 't'],
  [1, 2, '唐に派遣された使節は？', '遣唐使', '', 't'], [1, 2, '菅原道真が大宰府に左遷された901年の事件は？', '昌泰の変', '', 't'],
  [1, 2, '上皇が政治を行う形態は？', '院政', '', 't'], [1, 2, '939年に関東で起こった反乱は？', '平将門の乱', '', 't'],
  [1, 3, '鎌倉幕府で御家人を統率した機関は？', '侍所', '', 't'], [1, 3, '室町幕府で将軍を補佐した最高職は？', '管領', '', 't'],
  [1, 3, '守護が国内の武士を従え大名化した存在を何という？', '守護大名', '', 't'], [1, 3, '室町時代の農民が団結して作った自治組織は？', '惣', '', 't'],
  [1, 3, '1428年に近畿で起こった、最初の大規模な土一揆は？', '正長の土一揆', '', 't'], [1, 3, '戦国大名が領国支配のために定めた法は？', '分国法', '', 't'],
  [1, 1, '平城京に遷都した年は？', '710年', '', 'y'], [1, 2, '白村江の戦いが起こった年は？', '663年', '', 'y'],
  [1, 2, '壬申の乱が起こった年は？', '672年', '', 'y'], [1, 2, '承久の乱が起こった年は？', '1221年', '', 'y'],
  [1, 2, '建武の新政が始まった（建武元年）年は？', '1334年', '', 'y'], [1, 3, '応仁の乱が終わった年は？', '1477年', '', 'y'],
  [1, 3, '鉄砲が伝来した年は？', '1543年', '種子島', 'y'], [1, 3, 'キリスト教が伝来した年は？', '1549年', 'ザビエル', 'y'],
  [2, 1, '本能寺の変で織田信長を討った武将は？', '明智光秀', '1582年', 'p'], [2, 1, 'キリスト教を日本に伝えたイエズス会の宣教師は？', 'フランシスコ・ザビエル', '1549年', 'p'],
  [2, 2, '関ヶ原の戦いで西軍の中心となった人物は？', '石田三成', '', 'p'], [2, 2, '歌舞伎の始祖とされる人物は？', '出雲阿国', '', 'p'],
  [2, 2, '「奥の細道」の作者は？', '松尾芭蕉', '元禄文化の俳諧', 'p'], [2, 2, '「曽根崎心中」などの浄瑠璃脚本家は？', '近松門左衛門', '', 'p'],
  [2, 2, '「日本永代蔵」などを書いた浮世草子の作者は？', '井原西鶴', '', 'p'], [2, 3, '「東海道五十三次」を描いた浮世絵師は？', '歌川広重', '', 'p'],
  [2, 3, '「富嶽三十六景」を描いた浮世絵師は？', '葛飾北斎', '', 'p'], [2, 3, '「解体新書」を翻訳した人物の一人は？', '杉田玄白', '', 'p'],
  [2, 3, '全国の沿岸を測量して日本地図を作った人物は？', '伊能忠敬', '', 'p'], [2, 3, '「古事記伝」を著した国学者は？', '本居宣長', '', 'p'],
  [2, 3, '「東海道中膝栗毛」の作者は？', '十返舎一九', '', 'p'], [2, 3, '1792年に根室に来航したロシア使節は？', 'ラクスマン', '', 'p'],
  [2, 1, '田畑の面積や耕作者を調べた豊臣秀吉の政策は？', '太閤検地', '', 't'], [2, 1, '農民から武器を取り上げた豊臣秀吉の政策は？', '刀狩', '', 't'],
  [2, 2, '織田信長が安土で行った商業政策は？', '楽市・楽座', '', 't'], [2, 2, 'キリスト教徒を見つけるために行った、絵を踏ませる行為は？', '絵踏', '', 't'],
  [2, 2, '長崎の出島で幕府と貿易を続けたヨーロッパの国は？', 'オランダ', '', 't'], [2, 2, '江戸幕府の政務を統括した常置の最高職は？', '老中', '', 't'],
  [2, 2, '江戸時代、「天下の台所」と呼ばれた都市は？', '大坂', '', 't'], [2, 3, '享保の改革で定められた裁判の基準となる法典は？', '公事方御定書', '', 't'],
  [2, 3, '寛政の改革で出された、旗本・御家人の借金を帳消しにする令は？', '棄捐令', '', 't'], [2, 3, '天保の改革で出された、農民を村に帰す法は？', '人返しの法', '', 't'],
  [2, 3, '1825年に出された、外国船の撃退を命じた令は？', '異国船打払令', '', 't'], [2, 3, '生麦事件の報復としてイギリスが鹿児島を攻撃した戦争は？', '薩英戦争', '1863年', 't'],
  [2, 3, '豊臣秀吉が1592年に始めた朝鮮出兵を何という？', '文禄の役', '', 't'],
  [2, 1, '江戸幕府が成立した年は？', '1603年', '', 'y'], [2, 2, '大坂夏の陣で豊臣氏が滅亡した年は？', '1615年', '', 'y'],
  [2, 2, '享保の改革が始まった年は？', '1716年', '', 'y'], [2, 2, '寛政の改革が始まった年は？', '1787年', '', 'y'],
  [2, 3, '天保の改革が始まった年は？', '1841年', '', 'y'], [2, 3, '桜田門外の変が起こった年は？', '1860年', '', 'y'],
  [2, 3, '大政奉還が行われた年は？', '1867年', '', 'y'], [2, 3, '戊辰戦争が始まった年は？', '1868年', '', 'y'],
  [3, 1, '「学問のすゝめ」を著した人物は？', '福沢諭吉', '', 'p'], [3, 1, '初代の文部大臣になった人物は？', '森有礼', '', 'p'],
  [3, 2, '西南戦争を起こした人物は？', '西郷隆盛', '1877年', 'p'], [3, 2, '下関条約で清側全権を務めた人物は？', '李鴻章', '1895年', 'p'],
  [3, 2, '1911年に関税自主権の回復に成功した外務大臣は？', '小村寿太郎', '', 'p'], [3, 2, '足尾銅山鉱毒事件を訴えた衆議院議員は？', '田中正造', '', 'p'],
  [3, 3, '「民本主義」を唱えた政治学者は？', '吉野作造', '', 'p'], [3, 3, '1918年に本格的な政党内閣を組織した首相は？', '原敬', '', 'p'],
  [3, 3, '五・一五事件で暗殺された首相は？', '犬養毅', '1932年', 'p'], [3, 2, '1894年に領事裁判権の撤廃に成功した外務大臣は？', '陸奥宗光', '', 'p'],
  [3, 1, '1868年に出された新政府の基本方針は？', '五箇条の御誓文', '', 't'], [3, 1, '1872年に公布された学校制度の法令は？', '学制', '', 't'],
  [3, 2, '群馬に作られた官営模範工場は？', '富岡製糸場', '1872年', 't'], [3, 2, '1881年に10年後の国会開設を約束した詔は？', '国会開設の勅諭', '', 't'],
  [3, 2, '朝鮮の農民反乱をきっかけに1894年に始まった戦争は？', '日清戦争', '', 't'], [3, 2, '1895年にロシアなどが遼東半島の返還を要求した事件は？', '三国干渉', '', 't'],
  [3, 2, '1902年に日本がイギリスと結んだ同盟は？', '日英同盟', '', 't'], [3, 3, '1910年に日本が朝鮮を植民地にした出来事は？', '韓国併合', '', 't'],
  [3, 3, '1918年に米価の高騰から全国に広がった騒動は？', '米騒動', '', 't'], [3, 3, '1931年に関東軍が満州で起こした事件は？', '柳条湖事件', '満州事変の始まり', 't'],
  [3, 3, '1940年に結ばれた、日本・ドイツ・イタリアの同盟は？', '日独伊三国同盟', '', 't'], [3, 3, '日中戦争のきっかけとなった1937年の事件は？', '盧溝橋事件', '', 't'],
  [3, 3, '1947年に制定された教育の基本を定めた法律は？', '教育基本法', '', 't'], [3, 3, '1950年に始まった、日本の特需景気の背景となった戦争は？', '朝鮮戦争', '', 't'],
  [3, 3, '1956年に調印された、日ソの国交を回復した宣言は？', '日ソ共同宣言', '', 't'],
  [3, 3, '太平洋戦争が始まった年は？', '1941年', '', 'y'], [3, 3, 'ポツダム宣言を受諾し降伏した年は？', '1945年', '', 'y'],
  [3, 3, '日本国憲法が公布された年は？', '1946年', '', 'y'], [3, 3, 'サンフランシスコ平和条約が結ばれた年は？', '1951年', '', 'y'],
  [3, 3, '日韓基本条約が結ばれた年は？', '1965年', '', 'y'], [3, 3, '沖縄が日本に復帰した年は？', '1972年', '', 'y'],
)
// ===== 第3弾：数学・化学の出題パターンを追加（問題の約4割がここから出ます）=====
const pk = (a) => a[rd(a.length) - 1]
const sub = (n) => String(n).replace(/\d/g, (c) => '₀₁₂₃₄₅₆₇₈₉'[c])
const isPr = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true }
// 難易度：order は形式の番号を易しい順に並べたもの。基礎(L=1)は前の方、発展(L=3)は後ろの方から選ぶ
const vv = (L, order) => order[Math.max(0, Math.min(order.length - 1, Math.round(((L - 1) / 2) * (order.length - 1) + 2 * Math.random() - 1)))]
const sgn = () => (rd(2) === 1 ? 1 : -1)

// ---------- そろばん ----------
function yS(op, d) {
  if (op === 1) { const a = rnd(Math.max(d - 1, 1)), b = 1 + rd(8), c = 1 + rd(8); return { q: `${a} × ${b} × ${c}`, a: a * b * c, e: `${a}×${b}＝${a * b}、さらに×${c}＝${a * b * c}` } }
  if (op === 2) { const n = 5 + d; let s = 0, q = ''; for (let i = 0; i < n; i++) { const x = rnd(d); s += x; q += (i ? ' ＋ ' : '') + x } return { q, a: s, e: `${n}個の数をすべて足して ${s}` } }
  if (op === 3) { const dv = rnd(2), qt = rnd(Math.max(d, 2)); return { q: `${dv * qt} ÷ ${dv}`, a: qt, e: `${dv}×${qt}＝${dv * qt} なので答えは ${qt}` } }
  if (op === 4) {
    const hi = d === 2 ? 9 : 14, k = 2 + rd(hi), m = 2 + rd(hi)
    return Math.random() < (d <= 2 ? 0.75 : 0.45) ? { q: `√${k * k} ＋ √${m * m}`, a: k + m, e: `√${k * k}＝${k}、√${m * m}＝${m}。合計 ${k + m}` } : { q: `∛${k ** 3} ＋ ∛${m ** 3}`, a: k + m, e: `∛${k ** 3}＝${k}、∛${m ** 3}＝${m}。合計 ${k + m}` }
  }
  if (Math.random() < (d <= 2 ? 0.7 : 0.3)) { const t = rd(9), n = 10 * t + 5; return { q: `${n}²`, a: n * n, e: `末尾が5の2乗：${t}×${t + 1}＝${t * (t + 1)} の後ろに25をつけて ${n * n}` } }
  const k = 10 + rd(20), m = rd(9) + 1; return { q: `${k}² － ${m}²`, a: k * k - m * m, e: `和と差の積：(${k}＋${m})(${k}－${m})＝${k + m}×${k - m}＝${k * k - m * m}` }
}
// ---------- 中学数学 ----------
function yJ(op, L) {
  if (op === 1) {
    const v = vv(L, [3, 1, 2])
    if (v === 1) { const a = rd(9) + 1, b = rd(9) + 1, c = rd(9) + 1, d = rd(9) + 1; return { q: `|${a} － ${b}| ＋ |${c} － ${d}|`, a: Math.abs(a - b) + Math.abs(c - d), e: `絶対値は距離：${Math.abs(a - b)}＋${Math.abs(c - d)}＝${Math.abs(a - b) + Math.abs(c - d)}` } }
    if (v === 2) { const a = rd(4) + 1, b = rd(9) + 1; return { q: `(－${a})³ ＋ ${b}²`, a: -(a ** 3) + b * b, e: `(－${a})³＝${-(a ** 3)}、${b}²＝${b * b}。合計 ${-(a ** 3) + b * b}` } }
    const a = rd(20), b = rd(9), c = rd(9), d = rd(9); return { q: `${a} － ${b} × (${c} － ${d})`, a: a - b * (c - d), e: `かっこの中：${c}－${d}＝${c - d}。${b}×(${c - d})＝${b * (c - d)}。${a}－(${b * (c - d)})＝${a - b * (c - d)}` }
  }
  if (op === 2) {
    const v = vv(L, [1, 3, 2])
    if (v === 1) { const k = rd(6), a = rd(5) + 1, b = rd(9); return { q: `x ÷ ${a} ＋ ${b} ＝ ${k + b}`, a: a * k, e: `x÷${a}＝${k}、x＝${a * k}` } }
    if (v === 2) { const m = rd(20); return { q: `連続する3つの整数の和が ${3 * m + 3} のとき、いちばん小さい整数は？`, a: m, e: `真ん中の数は ${3 * m + 3}÷3＝${m + 1}。最小は ${m}` } }
    const p = rd(9) * 10, x = rd(9), q = rd(5) * 10; return { q: `1個${p}円のりんごを x 個買い、${q}円の箱に入れたら合計 ${p * x + q} 円だった。x は？`, a: x, e: `${p * x + q}－${q}＝${p * x}円がりんご代。${p * x}÷${p}＝${x}個` }
  }
  if (op === 3) {
    const v = vv(L, [2, 1, 3])
    if (v === 1) { const x = rd(9) + 1, y = rd(9); return { q: `x ＋ y ＝ ${x + y}、x － y ＝ ${x - y} のとき xy の値`, a: x * y, e: `2式を足して 2x＝${2 * x}、x＝${x}。y＝${y}。xy＝${x * y}` } }
    if (v === 2) { const k = rd(4) + 1, x = rd(9); return { q: `y ＝ ${k}x、x ＋ y ＝ ${(k + 1) * x} のとき y の値`, a: k * x, e: `代入して x＋${k}x＝${(k + 1) * x}、x＝${x}。y＝${k * x}` } }
    let a, b, c, d; const n = rd(9) * 20, p = rd(9) * 10
    do { a = rd(4); b = rd(4); c = rd(4); d = rd(4) } while (a * d - b * c === 0)
    return { q: `ノート${a}冊と鉛筆${b}本で ${a * n + b * p} 円、ノート${c}冊と鉛筆${d}本で ${c * n + d * p} 円。ノート1冊は何円？`, a: n, e: `ノートをx円、鉛筆をy円として連立。加減法で x＝${n}（y＝${p}）` }
  }
  if (op === 4) {
    const v = vv(L, [1, 3, 2])
    if (v === 1) { const a = sgn() * rd(9), b = sgn() * rd(9); if (!a || !b) return yJ(4); return { q: `(x ${sg(a)})(x ${sg(b)}) を展開したときの x の係数`, a: a + b, e: `x²＋(${a}＋${b})x＋${a * b}。係数は ${a + b}` } }
    if (v === 2) {
      let m, n; do { m = rd(19) - 10; n = rd(19) - 10 } while (!m || !n || m >= n || m + n === 0)
      return { q: `x² ${sg(m + n, 'x')} ${sg(m * n)} ＝ (x ＋ m)(x ＋ n)（m＜n）と因数分解できるとき n の値`, a: n, e: `和が ${m + n}、積が ${m * n} になる2数は ${m} と ${n}。大きい方は ${n}` }
    }
    const r = rd(10), d = rd(8); return { q: `長方形で、横は縦より ${d}cm 長く、面積は ${r * (r + d)}cm²。横の長さは何cm？`, a: r + d, e: `縦を x として x(x＋${d})＝${r * (r + d)}、x＝${r}。横は ${r + d}` }
  }
  const v = vv(L, [2, 1, 3])
  if (v === 1) { const k = rd(9), n = k * k + rd(2 * k); return { q: `√${n} の整数部分`, a: k, e: `${k}²＝${k * k}＜${n}＜${(k + 1) ** 2}＝${(k + 1) ** 2} なので整数部分は ${k}` } }
  if (v === 2) { const m = pk([2, 3, 5, 6, 7]), p = rd(6), q = rd(6); return { q: `√${p * p * m} ＋ √${q * q * m} ＝ □√${m} のとき □ の値`, a: p + q, e: `${p}√${m}＋${q}√${m}＝${p + q}√${m}` } }
  const m = rd(5) + 1, k = rd(4) + 1; return { q: `(√${m} ＋ √${m * k * k})²`, a: m * (1 + k) ** 2, e: `√${m * k * k}＝${k}√${m}。(√${m}＋${k}√${m})²＝(${1 + k}√${m})²＝${(1 + k) ** 2}×${m}＝${m * (1 + k) ** 2}` }
}
// ---------- 高校数学 ----------
function yH(op, L) {
  if (op === 1) {
    const v = vv(L, [2, 3, 1])
    if (v === 1) { let r1, r2; do { r1 = rd(10) - 5; r2 = r1 + rd(8) } while (!r1 || !r2 || r1 + r2 === 0); return { q: `y ＝ x² ${sg(-(r1 + r2), 'x')} ${sg(r1 * r2)} が x軸と交わる2点の間の距離`, a: r2 - r1, e: `因数分解して (x ${sg(-r1)})(x ${sg(-r2)})＝0。交点は x＝${r1}, ${r2}。距離 ${r2 - r1}` } }
    if (v === 2) { const k = sgn() * rd(9); return { q: `x² ${sg(-2 * k, 'x')} ＋ c ＝ 0 が重解をもつときの c の値`, a: k * k, e: `重解 ⇔ 判別式 D＝0。(${-2 * k})²－4c＝0 より c＝${k * k}` } }
    const h = sgn() * rd(8), c = rd(20); return { q: `y ＝ x² ${sg(-2 * h, 'x')} ${sg(c)} の頂点の y 座標`, a: c - h * h, e: `平方完成：y＝(x ${sg(-h)})²＋(${c - h * h})。頂点の y 座標は ${c - h * h}` }
  }
  if (op === 2) {
    const v = vv(L, [2, 3, 1])
    if (v === 1) {
      const q = pk([2, 3, 4]), k = 2 + rd({ 2: 8, 3: 4, 4: 2 }[q]) - 1, p = pk({ 2: [1, 3], 3: [1, 2, 4], 4: [1, 3] }[q])
      return { q: `${k ** q}^(${p}/${q}) の値`, a: k ** p, e: `${k ** q}＝${k}^${q} なので (${k}^${q})^(${p}/${q})＝${k}^${p}＝${k ** p}` }
    }
    if (v === 2) {
      if (rd(2) === 1) { const a = rd(8) + 2, b = rd(a - 1); return { q: `log₂ ${2 ** a} － log₂ ${2 ** b}`, a: a - b, e: `log₂ 2^${a}＝${a}、log₂ 2^${b}＝${b}。差は ${a - b}` } }
      const a = rd(4) + 1, b = rd(3) + 1; return { q: `log₂ ${2 ** a} × log₅ ${5 ** b}`, a: a * b, e: `log₂ 2^${a}＝${a}、log₅ 5^${b}＝${b}。積は ${a * b}` }
    }
    const a = rd(6); return { q: `log₁₀ ${2 ** a} ＋ log₁₀ ${5 ** a}`, a, e: `和は積の対数：log₁₀ (2^${a}×5^${a})＝log₁₀ 10^${a}＝${a}` }
  }
  if (op === 3) {
    const v = vv(L, [2, 1, 3])
    if (v === 1) {
      const [a, b, h] = pk([[15, 75, 0], [20, 70, 0], [40, 50, 0], [10, 20, 1], [5, 25, 1], [100, 50, 1]]), m = h ? 2 * rd(5) : rd(9)
      return { q: `${m}(sin${a}°cos${b}° ＋ cos${a}°sin${b}°)`, a: h ? m / 2 : m, e: `加法定理：sin(${a}°＋${b}°)＝sin${a + b}°＝${h ? '1/2' : '1'}。${m}倍して ${h ? m / 2 : m}` }
    }
    if (v === 2) {
      const n = pk([2, 4]), j = rd(4), r = n * j
      return rd(2) === 1 ? { q: `半径${r}・中心角 π/${n} の扇形の弧の長さは □π のとき □ の値`, a: j, e: `弧の長さ＝rθ＝${r}×π/${n}＝${j}π` } : { q: `半径${r}・中心角 π/${n} の扇形の面積は □π のとき □ の値`, a: (r * r) / (2 * n), e: `面積＝(1/2)r²θ＝(1/2)×${r * r}×π/${n}＝${(r * r) / (2 * n)}π` }
    }
    const a = rd(8), b = rd(8), A = pk([60, 120]), r = A === 60 ? a * a + b * b - a * b : a * a + b * b + a * b
    return { q: `AB＝${a}、AC＝${b}、∠A＝${A}° の三角形で BC²`, a: r, e: `余弦定理：BC²＝${a}²＋${b}²－2×${a}×${b}×cos${A}°＝${r}` }
  }
  if (op === 4) {
    const v = vv(L, [1, 2, 3])
    if (v === 1) { const k = rd(L + 1), a = rd(5), b = rd(5); return { q: `∫₀^${k} (${3 * a}x² ＋ ${2 * b}x) dx`, a: a * k ** 3 + b * k * k, e: `[${a}x³＋${b}x²]₀^${k}＝${a * k ** 3}＋${b * k * k}＝${a * k ** 3 + b * k * k}` } }
    if (v === 2) { const m = rd(4), c = rd(10); return { q: `f(x)＝x³ － ${3 * m * m}x ＋ ${c} の極大値`, a: 2 * m ** 3 + c, e: `f′(x)＝3x²－${3 * m * m}＝0 より x＝±${m}。x＝－${m} で極大。f(－${m})＝${2 * m ** 3}＋${c}＝${2 * m ** 3 + c}` } }
    const k = pk([6, 12]); return { q: `放物線 y＝x² と直線 y＝${k}x で囲まれた部分の面積`, a: k ** 3 / 6, e: `交点は x＝0, ${k}。∫₀^${k}(${k}x－x²)dx＝[${k}x²/2－x³/3]＝${k ** 3 / 2}－${k ** 3 / 3}＝${k ** 3 / 6}` }
  }
  const v = vv(L, [4, 1, 3, 2])
  if (v === 1) { const a = rd(4), r = rd(3) + 1, n = rd(4) + 2; return { q: `a₁＝${a}、a${sub('n+1')}＝${r}a${sub('n')} のとき a${sub(n)}`, a: a * r ** (n - 1), e: `公比${r}の等比数列。a${sub(n)}＝${a}×${r}^${n - 1}＝${a * r ** (n - 1)}` } }
  if (v === 2) { const a = rd(9), n = rd(8) + 3; return { q: `a₁＝${a}、a${sub('n+1')}＝a${sub('n')} ＋ n のとき a${sub(n)}`, a: a + (n * (n - 1)) / 2, e: `階差数列は 1, 2, …, ${n - 1}。a${sub(n)}＝${a}＋${n - 1}×${n}/2＝${a + (n * (n - 1)) / 2}` } }
  if (v === 3) { const a = rd(10), d = rd(5), p = rd(3), q = p + rd(4), r = q + rd(5); return { q: `等差数列で、第${p}項が ${a + (p - 1) * d}、第${q}項が ${a + (q - 1) * d} のとき、第${r}項は？`, a: a + (r - 1) * d, e: `公差＝(${a + (q - 1) * d}－${a + (p - 1) * d})÷${q - p}＝${d}。第${r}項＝${a + (r - 1) * d}` } }
  const n = rd(9) + 1; return { q: `Σ(k＝1→${n}) (2k － 1)`, a: n * n, e: `奇数の和は n²。${n}²＝${n * n}` }
}
// ---------- 数学III ----------
function y3(op, L) {
  if (op === 1) {
    const v = vv(L, [3, 4, 2, 1])
    if (v === 1) { const k = rd(9); return { q: `lim(x→∞) (√(x² ＋ ${2 * k}x) － x)`, a: k, e: `有理化して ${2 * k}x÷(√(x²＋${2 * k}x)＋x)。x で割って ${2 * k}/(1＋1)＝${k}` } }
    if (v === 2) { const a = rd(5) + 1; return { q: `lim(x→${a}) (x³ － ${a ** 3}) ÷ (x － ${a})`, a: 3 * a * a, e: `x³－${a ** 3}＝(x－${a})(x²＋${a}x＋${a * a})。約分して x→${a} で 3×${a}²＝${3 * a * a}` } }
    if (v === 3) { const k = rd(9); return { q: `lim(x→0) tan(${k}x) ÷ x`, a: k, e: `tan t／t→1。t＝${k}x として ${k}` } }
    const q = rd(4), j = rd(4) + 1; return { q: `lim(x→0) sin(${q * j}x) ÷ sin(${q}x)`, a: j, e: `分子分母を x で割ると (${q * j}・1)/(${q}・1)＝${j}` }
  }
  if (op === 2) {
    const v = vv(L, [2, 1, 3])
    if (v === 1) { const a = rd(6); return { q: `f(x)＝${a}e^x sin x のとき f′(0)`, a, e: `積の微分：f′(x)＝${a}e^x(sin x＋cos x)。x＝0 で ${a}` } }
    if (v === 2) { const a = rd(6); return { q: `f(x)＝${a}x ln x のとき f′(e)`, a: 2 * a, e: `f′(x)＝${a}(ln x＋1)。x＝e で ${a}×2＝${2 * a}` } }
    const a = rd(4), k = rd(5); return { q: `f(x)＝${a * k}x ÷ (x ＋ ${a}) のとき f′(0)`, a: k, e: `商の微分：f′(x)＝${a * k}・${a}/(x＋${a})²。x＝0 で ${a * k * a}/${a * a}＝${k}` }
  }
  if (op === 3) {
    const v = vv(L, [1, 3, 2])
    if (v === 1) { const k = rd(5); return { q: `∫₀^(π/2) ${2 * k} sin x cos x dx`, a: k, e: `sin x＝t と置換。${2 * k}∫₀¹ t dt＝${2 * k}×1/2＝${k}` } }
    if (v === 2) { const j = rd(4); return { q: `∫₀¹ ${6 * j} x (x² ＋ 1)² dx`, a: 7 * j, e: `x²＋1＝t と置換。${6 * j}・(1/2)∫₁² t² dt＝${3 * j}×7/3＝${7 * j}` } }
    const j = rd(5); return { q: `∫₁^e ${2 * j} (ln x) ÷ x dx`, a: j, e: `ln x＝t と置換。${2 * j}∫₀¹ t dt＝${2 * j}×1/2＝${j}` }
  }
  if (op === 4) {
    const v = vv(L, [2, 3, 1]), a = rd(6)
    if (v === 1) return { q: `Σ(n＝1→∞) ${a} ÷ {n(n ＋ 1)}`, a, e: `1/(n(n＋1))＝1/n－1/(n＋1)。和は 1 になるので ${a}` }
    if (v === 2) return { q: `初項${a}・公比 2/3 の無限等比級数の和`, a: 3 * a, e: `a/(1－r)＝${a}/(1/3)＝${3 * a}` }
    return { q: `Σ(n＝1→∞) ${a}(2/3)^n`, a: 2 * a, e: `初項 ${2 * a}/3・公比 2/3。(${2 * a}/3)/(1/3)＝${2 * a}` }
  }
  const v = vv(L, [3, 2, 1])
  if (v === 1) { const k = rd(3); return { q: `(1 ＋ √3 i)^${3 * k} の値`, a: (-8) ** k, e: `1＋√3 i＝2(cos60°＋i sin60°)。${3 * k}乗で 2^${3 * k}(cos${180 * k}°)＝${(-8) ** k}` } }
  if (v === 2) { const [s, t] = pk([['1 ＋ i', 45], ['√3 ＋ i', 30], ['1 ＋ √3 i', 60], ['－1 ＋ i', 135], ['－1 － i', 225], ['1 － i', 315], ['－√3 ＋ i', 150], ['－1 ＋ √3 i', 120]]); return { q: `z＝${s} の偏角 θ（0°≦θ＜360°）は何度？`, a: t, e: `複素数平面に図示して、偏角は ${t}°` } }
  const a = rd(9), b = rd(9); return rd(2) === 1 ? { q: `(${a} ＋ ${b}i)² の虚部`, a: 2 * a * b, e: `展開：${a * a}＋${2 * a * b}i＋${b * b}i²。虚部は ${2 * a * b}` } : { q: `(${a} ＋ ${b}i)² の実部`, a: a * a - b * b, e: `展開：${a * a}＋${2 * a * b}i－${b * b}。実部は ${a * a - b * b}` }
}
// ---------- 数学A ----------
function yA(op, L) {
  if (op === 1) {
    const v = vv(L, [2, 1, 3, 4])
    if (v === 1) { const m = rd(4) + 3, w = rd(5) + 2; return { q: `男子${m}人・女子${w}人から、男子2人と女子1人を選ぶ選び方は何通り？`, a: Cm(m, 2) * w, e: `${m}C2×${w}C1＝${Cm(m, 2)}×${w}＝${Cm(m, 2) * w}` } }
    if (v === 2) { const n = rd(8) + 3; return { q: `${n}人から委員長と副委員長を1人ずつ選ぶ選び方は何通り？`, a: Pm(n, 2), e: `役が区別されるので ${n}P2＝${n}×${n - 1}＝${Pm(n, 2)}` } }
    if (v === 3) { let n, r; do { n = rd(8) + 5; r = rd(4) } while (2 * r === n); return { q: `${n}C${r} ＝ ${n}C□ のとき □ の値（□≠${r}）`, a: n - r, e: `nCr＝nC(n－r) なので □＝${n}－${r}＝${n - r}` } }
    const m = rd(3) + 3, w = rd(3) + 1; return { q: `男子${m}人・女子${w}人から3人を選ぶとき、少なくとも1人は女子を含む選び方は何通り？`, a: Cm(m + w, 3) - Cm(m, 3), e: `全体 ${m + w}C3＝${Cm(m + w, 3)} から男子だけ ${m}C3＝${Cm(m, 3)} を引く。${Cm(m + w, 3) - Cm(m, 3)}` }
  }
  if (op === 2) {
    const v = vv(L, [2, 1, 3])
    if (v === 1) { const n = rd(3) + 3; return { q: `異なる${n}個の玉でつくる首飾り（裏返しも同じ）は何通り？`, a: fa(n - 1) / 2, e: `じゅず順列：(n－1)!÷2＝${fa(n - 1)}÷2＝${fa(n - 1) / 2}` } }
    if (v === 2) { const k = rd(4) + 2, n = rd(3) + 1; return { q: `1〜${k}の数字を重複を許して使ってつくる${n}桁の整数は何個？`, a: k ** n, e: `各桁${k}通りなので ${k}^${n}＝${k ** n}` } }
    const n = rd(2) + 2; return { q: `男子${n}人・女子${n}人が円卓に交互に座る座り方は何通り？`, a: fa(n - 1) * fa(n), e: `男子の円順列 ${n - 1}!＝${fa(n - 1)}。間に女子を並べる ${n}!＝${fa(n)}。積 ${fa(n - 1) * fa(n)}` }
  }
  if (op === 3) {
    const v = vv(L, [2, 1, 3])
    if (v === 1) { const [n, a, r] = pk([[6, 3, 10], [4, 2, 3], [8, 4, 35], [6, 2, 15]]); return { q: `${n}人を ${a}人ずつの組に分ける分け方は何通り？（組の区別はない）`, a: r, e: `区別をつけて数えてから、組を入れかえた分の重複で割る。${r}通り` } }
    if (v === 2) { const n = rd(5) + 4, a = rd(3) + 1; return { q: `${n}人を A室に${a}人、B室に${n - a}人入れる分け方は何通り？`, a: Cm(n, a), e: `A室に入る${a}人を選ぶ：${n}C${a}＝${Cm(n, a)}` } }
    const a = rd(3) + 3, b = rd(3) + 3, c = rd(a - 1), d = rd(b - 1)
    return { q: `格子状の道を(0,0)から(${a},${b})まで最短で進む。点(${c},${d})を通る道順は何通り？`, a: Cm(c + d, c) * Cm(a - c + b - d, a - c), e: `(0,0)→(${c},${d})：${Cm(c + d, c)}通り、(${c},${d})→(${a},${b})：${Cm(a - c + b - d, a - c)}通り。積 ${Cm(c + d, c) * Cm(a - c + b - d, a - c)}` }
  }
  if (op === 4) {
    const v = vv(L, [2, 3, 1])
    if (v === 1) { const n = rd(40) + 10; return { q: `${n}! を計算したとき、末尾に並ぶ0の個数`, a: Math.floor(n / 5) + Math.floor(n / 25), e: `5の倍数が ${Math.floor(n / 5)}個、25の倍数が ${Math.floor(n / 25)}個。合計 ${Math.floor(n / 5) + Math.floor(n / 25)}` } }
    if (v === 2) { const N = pk([20, 30, 40, 50]); let c = 0; for (let i = 2; i <= N; i++) if (isPr(i)) c++; return { q: `${N}以下の素数は全部で何個？`, a: c, e: `${N}以下の素数を順に数えて ${c}個` } }
    const N = pk([30, 45, 60, 90, 150]), r = N - Math.floor(N / 3) - Math.floor(N / 5) + Math.floor(N / 15)
    return { q: `1から${N}までの整数のうち、3でも5でも割り切れない数は何個？`, a: r, e: `${N}－(3の倍数 ${Math.floor(N / 3)})－(5の倍数 ${Math.floor(N / 5)})＋(15の倍数 ${Math.floor(N / 15)})＝${r}` }
  }
  const v = vv(L, [1, 2, 3])
  if (v === 1) { const t = rd(5) + 7; let c = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b >= t) c++; return { q: `大小2個のさいころを投げて、目の和が${t}以上になる場合は何通り？`, a: c, e: `36通りのうち、和が${t}以上になる組を数えて ${c}通り` } }
  if (v === 2) { const k = pk([4, 5, 6, 8, 9, 12]); let c = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if ((a * b) % k === 0) c++; return { q: `大小2個のさいころを投げて、目の積が${k}の倍数になる場合は何通り？`, a: c, e: `36通りのうち、積が${k}の倍数になる組を数えて ${c}通り` } }
  const r = rd(3) + 1, w = rd(3) + 3; return { q: `赤玉${r}個・白玉${w}個から3個を同時に取り出すとき、少なくとも1個は赤玉である取り出し方は何通り？`, a: Cm(r + w, 3) - Cm(w, 3), e: `全体 ${r + w}C3＝${Cm(r + w, 3)} から白玉だけ ${w}C3＝${Cm(w, 3)} を引く。${Cm(r + w, 3) - Cm(w, 3)}` }
}
// ---------- 化学計算 ----------
function yC(op, L) {
  if (op === 1) {
    if (vv(L, [2, 1]) === 1) { const [f, n] = pk([['H₂O', 3], ['CO₂', 3], ['NH₃', 4], ['CH₄', 5], ['O₂', 2]]), k = rd(5); return { q: `${k}mol の ${f} に含まれる原子の総数は、アボガドロ定数(6.0×10²³)の何倍？`, a: k * n, e: `分子 ${k}mol。1分子に原子が${n}個なので ${k}×${n}＝${k * n}倍` } }
    const k = rd(4); return { q: `${(6 * k).toFixed(1)}×10²³ 個の H₂O 分子（分子量18）の質量は何g？`, a: 18 * k, e: `6.0×10²³個＝1mol。${k}mol なので 18×${k}＝${18 * k}g` }
  }
  if (op === 2) {
    const v = vv(L, [3, 1, 2])
    if (v === 1) { const p1 = pk([100, 200, 400]); let p2; do { p2 = pk([100, 200, 400]) } while (p2 === p1); const v1 = 4 * rd(5); return { q: `温度一定で、${p1}kPa で ${v1}L の気体を ${p2}kPa にすると、体積は何L？`, a: (p1 * v1) / p2, e: `ボイルの法則 P₁V₁＝P₂V₂：V₂＝${p1}×${v1}÷${p2}＝${(p1 * v1) / p2}L` } }
    if (v === 2) { const [t, T] = pk([[127, 400], [327, 600]]), k = rd(5); return { q: `圧力一定で、27℃ のとき ${3 * k}L の気体を ${t}℃ にすると、体積は何L？`, a: (k * T) / 100, e: `シャルルの法則：絶対温度 300K→${T}K。V₂＝${3 * k}×${T}/300＝${(k * T) / 100}L` } }
    const j = rd(3), a = rd(4), b = 5 * j - a; return { q: `標準状態で、H₂ ${a}mol と O₂ ${b}mol の混合気体の体積は何L？`, a: 112 * j, e: `全体で ${5 * j}mol。${5 * j}×22.4＝${112 * j}L` }
  }
  if (op === 3) {
    const v = vv(L, [1, 2, 3])
    if (v === 1) { const c = 4 * rd(3), w = pk([100, 200, 250, 500]), f = pk([2, 4]); return { q: `${c}mol/L の水溶液 ${w}mL に水を加えて全体を ${w * f}mL にした。モル濃度は何mol/L？`, a: c / f, e: `溶質の物質量は変わらず、体積が${f}倍になるので ${c}÷${f}＝${c / f}mol/L` } }
    if (v === 2) { const c = rd(4), w = pk([250, 500, 1000]); return { q: `${c}mol/L の NaOH 水溶液 ${w}mL をつくるのに必要な NaOH（式量40）は何g？`, a: (c * w * 40) / 1000, e: `物質量＝${c}×${w / 1000}＝${(c * w) / 1000}mol。質量＝${(c * w) / 1000}×40＝${(c * w * 40) / 1000}g` } }
    const p = 4 * rd(5); return { q: `密度 1.0g/mL の ${p}％ NaOH 水溶液（式量40）のモル濃度は何mol/L？`, a: p / 4, e: `1L＝1000g に NaOH が ${10 * p}g。${10 * p}÷40＝${p / 4}mol/L` }
  }
  if (op === 4) {
    const v = vv(L, [1, 2, 3, 4])
    if (v === 1) { const k = rd(5); return { q: `C ＋ O₂ → CO₂　炭素（原子量12）${12 * k}g から生じる CO₂（分子量44）は何g？`, a: 44 * k, e: `炭素 ${k}mol → CO₂ ${k}mol。44×${k}＝${44 * k}g` } }
    if (v === 2) { const k = rd(5); return { q: `2H₂ ＋ O₂ → 2H₂O　水素（分子量2）${2 * k}g が完全に反応すると、生じる水（分子量18）は何g？`, a: 18 * k, e: `H₂ ${k}mol → H₂O ${k}mol。18×${k}＝${18 * k}g` } }
    if (v === 3) { const j = rd(3); return { q: `CaCO₃ → CaO ＋ CO₂　CaCO₃（式量100）${500 * j}g を熱分解すると、標準状態で CO₂ は何L？`, a: 112 * j, e: `CaCO₃ ${5 * j}mol → CO₂ ${5 * j}mol。${5 * j}×22.4＝${112 * j}L` } }
    const b = rd(4); let a = rd(8); if (a === 2 * b) a++
    return { q: `2H₂ ＋ O₂ → 2H₂O　H₂ ${a}mol と O₂ ${b}mol から生じる H₂O は最大で何mol？`, a: Math.min(a, 2 * b), e: `H₂は ${a}mol、O₂からは最大 ${2 * b}mol 分の水。少ない方で決まるので ${Math.min(a, 2 * b)}mol` }
  }
  const v = vv(L, [1, 3, 2])
  if (v === 1) { const p1 = 5 * rd(6), p2 = p1 + 10 * rd(3), m = 100 * rd(3); return { q: `${p1}％の食塩水 ${m}g と ${p2}％の食塩水 ${m}g を混ぜたときの濃度は何％？`, a: (p1 + p2) / 2, e: `同じ質量なので平均：(${p1}＋${p2})÷2＝${(p1 + p2) / 2}％` } }
  if (v === 2) { const p = pk([10, 20, 30]), [n, d] = pk([[1, 2], [3, 5]]), m = 100 * rd(3), x = (m * n) / d; return { q: `${p}％の食塩水 ${m}g から水を ${x}g 蒸発させると、濃度は何％？`, a: (p * m) / (m - x), e: `食塩は ${(p * m) / 100}g のまま、全体が ${m - x}g。${(p * m) / 100}÷${m - x}×100＝${(p * m) / (m - x)}％` } }
  const t = rd(5); return { q: `水 ${40 * t}g に食塩を何g溶かすと、20％の食塩水になる？`, a: 10 * t, e: `食塩を x g として x÷(${40 * t}＋x)＝0.2。x＝${10 * t}g` }
}
const Y = { S: yS, J: yJ, H: yH, III: y3, A: yA, CH: yC }

export function gen(M, op, b) {
  const sx = SUBJ[M]
  if (sx && sx.pool) { const [m, o] = sx.pool[op - 1]; return gen(m, o, Math.min(6, b + sx.shift)) }
  const L = Math.ceil(b / 2)
  if (M === 'S') { const o = op === 6 ? rd(5) : op; return o === 5 ? ((Math.random() < 0.5 && yS(5, L + 1)) || xS(5, L + 1)) : pick('S', o, L + 1, genS) }
  if (M === 'J') return pick(M, op === 6 ? rd(5) : op, L, genJ)
  if (M === 'H') return pick(M, op === 6 ? rd(5) : op, L, genH)
  if (M === 'III') return pick(M, op === 6 ? rd(5) : op, L, gen3)
  if (M === 'A') return pick(M, op === 6 ? rd(5) : op, L, genA)
  if (M === 'CH') return pick(M, op === 6 ? rd(5) : op, L, genC)
  if (M === 'JH') return genJH(op, L)
  if (M === 'G') return genG(op >= 5 ? rd(4) : op, L)
  return genW(M, op >= 5 ? rd(4) : op, L)
}
export const ansText = (pr) => (pr.ch ? pr.ch[pr.a] : pr.a)

// コールドゲーム：点差がこの値以上になると試合終了（3イニング以上の試合のみ）
// 9回制なら5回に10点差・7回以降は7点差、イニング数が少ない試合では回数に合わせて早めに適用
export const coldMargin = (inn, N) => {
  if (N < 3) return Infinity
  const start = Math.max(2, Math.ceil((N * 5) / 9)), late = Math.ceil((N * 7) / 9)
  return inn < start ? Infinity : inn >= late ? 7 : 10
}

export const cur = (S) => {
  const o = S.half, d = 1 - o
  return { o, d, bat: S.t[o].pl[S.bi[o] % S.t[o].pl.length], pit: S.t[d].pl[(S.inn - 1) % S.t[d].pl.length] }
}

// 待合室の参加者から試合を作る（足りない分はAIで4人にそろえる）。d.m は「科目.AIレベル」例 H.3
export function buildGame(d) {
  const [M, lv] = (d.m || 'S.2').split('.')
  const t = [0, 1].map((i) => ({ name: i ? 'チームB' : 'チームA', pl: [] })), who = {}
  ;[...d.players].sort((a, b) => a.team - b.team).forEach((p) => {
    const base = p.name || '選手'; let n = base, k = 2
    while (who[n]) n = base + k++
    who[n] = p.id; t[p.team].pl.push(n)
  })
  t.forEach((x, i) => { for (let j = 1; x.pl.length < 4; j++) x.pl.push('AI-' + 'AB'[i] + j) })
  return { t, sc: [0, 0], inn: 1, N: d.n, half: 0, outs: 0, bases: [0, 0, 0], bi: [0, 0], ph: 'roll', msg: '', ev: '', line: [[], []], cur: null, M, lv: +lv || 2, who, hostId: d.host, n: 0 }
}

function adv(S, n) {
  let runs = 0; const nb = [0, 0, 0]
  if (n === 4) runs = S.bases.filter(Boolean).length + 1
  else { for (let i = 2; i >= 0; i--) if (S.bases[i]) { const t = i + n; t >= 3 ? runs++ : (nb[t] = 1) } nb[n - 1] = 1 }
  S.bases = nb; S.sc[S.half] += runs; return runs
}

export function resolve(S0, win, pre) {
  const S = structuredClone(S0), { o, bat } = cur(S), c = S.cur
  S.line = S.line || [[], []]
  S.hold = !!(S.who && (S.who[bat] || (c && S.who[c.opp]))) // 人間が関わった打席は、結果を読めるように自動で次へ進めない
  let m = pre ? pre + ' ' : ''
  if (c.pr) m += `【問題：${c.pr.q}／答え：${ansText(c.pr)}】\n解説：${c.pr.e}\n`
  if (win) {
    let n = 1, t = '単打'
    if (c.sp === 'b') { const d = rd(6); n = BONUS[d]; t = BN[d]; m += `ボーナスダイス「${d}」→` }
    const r = adv(S, n); S.line[S.half][S.inn - 1] = (S.line[S.half][S.inn - 1] || 0) + r; m += `${bat}は${t}！` + (r ? `${r}点入った！` : ''); S.ev = t
  } else { S.outs++; m += `${bat}はアウト（${S.outs}アウト）`; S.ev = 'アウト' }
  S.bi[o]++; S.n++
  const mg = coldMargin(S.inn, S.N), diff = S.sc[1] - S.sc[0]
  if (S.half === 1 && diff >= mg) { S.cold = true; S.ph = 'end'; S.msg = m + '\n⚡ コールドゲーム成立！'; return S } // 裏の攻撃中に後攻が差を広げた
  if (S.outs >= 3 && ((S.half === 0 && diff >= mg) || (S.half === 1 && Math.abs(diff) >= mg))) { S.cold = true; S.ph = 'end'; S.msg = m + '\n⚡ コールドゲーム成立！'; return S }
  if (S.outs >= 3) {
    S.outs = 0; S.bases = [0, 0, 0]; m += ' チェンジ！'; S.ev += '→チェンジ'
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
    const st = AIL[b], D = Math.ceil(b / 2), lv = S.lv || 2, eng = isMC(S.M)
    c.pc = Math.min(0.999, ACC[lv] + (st - 2) * 0.04)
    const raw = (8 + 6 * D) * (eng ? 0.5 : 1) * TM[lv] * (1.3 - 0.15 * st) * (0.7 + 0.6 * Math.random())
    // 人間が読んで入力する時間を確保する（どんなに強いAIでも、これより早くは答えない）
    c.aiT = Math.max(eng ? 4 : 6 + 2 * D, raw) + 2
    const base = S.M === 'S' ? 30 + 15 * D : eng ? (S.M === 'G' ? 15 + 5 * D : 12 + 4 * D) : 25 + 10 * D
    c.lim = Math.round(Math.max(base, c.aiT + 6)); c.t0 = Date.now()
  }
  S.ph = 'duel'; S.msg = ''; return S
}

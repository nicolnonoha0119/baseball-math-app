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
  JH: { n: '日本史 一問一答', t: ['', '古代・中世', '近世', '近代', 'ランダム', 'ランダム', 'ランダム'], d: DIF },
  G: { n: '高校英文法', t: ['', '時制', '関係詞・接続詞', '助動詞・仮定法', '前置詞・語法', 'ランダム', 'ランダム'], d: DIF },
}
// 大学レベル別の科目：ピッチャーの目ごとに（科目, 問題の種類）を割り当て、バッターの目に shift を足して難しくする
// ※レベルはあくまで目安で、実際の入試の出題と一致するわけではありません
const MIX = (n, shift, pool, mc) => ({ n, shift, pool, mc, d: ['易', '標準', '難'], t: [] })
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
  const others = shuf(bank.filter((x) => x !== w)).slice(0, 3).map((x) => x[1 - i])
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
const SUBS = [['H₂O', 18, 1], ['CO₂', 44, 2], ['NaOH', 40, 1], ['CaCO₃', 100, 3], ['H₂SO₄', 98, 4]]
function genC(op, L) {
  const [f, M, nO] = SUBS[rd(5) - 1], k = rd(5)
  if (op === 1) {
    if (L === 1) return { q: `${M * k}g の ${f}（式量・分子量${M}）は何mol？`, a: k, e: `物質量＝質量÷モル質量＝${M * k}÷${M}＝${k}mol` }
    if (L === 2) return { q: `${k}mol の ${f}（式量・分子量${M}）の質量は何g？`, a: M * k, e: `質量＝物質量×モル質量＝${k}×${M}＝${M * k}g` }
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
 
export function gen(M, op, b) {
  const sx = SUBJ[M]
  if (sx && sx.pool) { const [m, o] = sx.pool[op - 1]; return gen(m, o, Math.min(6, b + sx.shift)) }
  const L = Math.ceil(b / 2)
  if (M === 'S') return genS(op >= 5 ? rd(4) : op, L + 1)
  if (M === 'J') return genJ(op === 6 ? rd(5) : op, L)
  if (M === 'H') return genH(op === 6 ? rd(5) : op, L)
  if (M === 'III') return gen3(op === 6 ? rd(5) : op, L)
  if (M === 'A') return genA(op === 6 ? rd(5) : op, L)
  if (M === 'CH') return genC(op === 6 ? rd(5) : op, L)
  if (M === 'JH') return genJH(op, L)
  if (M === 'G') return genG(op >= 5 ? rd(4) : op, L)
  return genW(M, op >= 5 ? rd(4) : op, L)
}
export const ansText = (pr) => (pr.ch ? pr.ch[pr.a] : pr.a)
 
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
  return { t, sc: [0, 0], inn: 1, N: d.n, half: 0, outs: 0, bases: [0, 0, 0], bi: [0, 0], ph: 'roll', msg: '', ev: '', cur: null, M, lv: +lv || 2, who, hostId: d.host, n: 0 }
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
  if (c.pr) m += `【問題：${c.pr.q}／答え：${ansText(c.pr)}】\n解説：${c.pr.e}\n`
  if (win) {
    let n = 1, t = '単打'
    if (c.sp === 'b') { const d = rd(6); n = BONUS[d]; t = BN[d]; m += `ボーナスダイス「${d}」→` }
    const r = adv(S, n); m += `${bat}は${t}！` + (r ? `${r}点入った！` : ''); S.ev = t
  } else { S.outs++; m += `${bat}はアウト（${S.outs}アウト）`; S.ev = 'アウト' }
  S.bi[o]++; S.n++
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
    c.aiT = (8 + 6 * D) * (eng ? 0.5 : 1) * TM[lv] * (1.3 - 0.15 * st) * (0.7 + 0.6 * Math.random())
    const base = S.M === 'S' ? 30 + 15 * D : eng ? (S.M === 'G' ? 15 + 5 * D : 12 + 4 * D) : 25 + 10 * D
    c.lim = Math.round(Math.max(base, c.aiT + 6)); c.t0 = Date.now()
  }
  S.ph = 'duel'; S.msg = ''; return S
}
 

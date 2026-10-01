// ゲームのルール・問題づくり・試合進行（画面やSupabaseには依存しない）
export const LV = ['', '優しい', '普通', '難しい', '鬼', '神']
const ACC = [0, 0.4, 0.65, 0.82, 0.94, 0.995] // AIレベル別の正解率
const TM = [0, 1.7, 1.2, 0.85, 0.55, 0.28]    // AIレベル別の解答時間の倍率
const DIF = ['基礎', '標準', '発展']
const WT = ['', '英→和', '和→英', '英→和', '和→英', 'ランダム', 'ランダム']
export const SUBJ = {
  S: { n: 'そろばん', t: ['', '掛け算', '見取算（加減算）', '割り算', '開平（√）', 'ランダム', 'ランダム'], d: ['2桁', '3桁', '4桁'] },
  J: { n: '中学数学', t: ['', '正負の数・累乗', '一次方程式', '連立方程式', '二次方程式', '平方根の計算', 'ランダム'], d: DIF },
  H: { n: '高校数学', t: ['', '二次方程式', '指数・対数', '三角関数', '微分', '数列', 'ランダム'], d: DIF },
  III: { n: '数学III', t: ['', '極限', '微分', '定積分', '無限級数', '複素数平面', 'ランダム'], d: DIF },
  W3: { n: '英検準2級 単語', t: WT, d: ['易', '標準', '難'] },
  W2: { n: '英検2級 単語', t: WT, d: ['易', '標準', '難'] },
  WP1: { n: '英検準1級 単語', t: WT, d: ['易', '標準', '難'] },
  W1: { n: '英検1級 単語', t: WT, d: ['易', '標準', '難'] },
  G: { n: '高校英文法', t: ['', '時制', '関係詞・接続詞', '助動詞・仮定法', '前置詞・語法', 'ランダム', 'ランダム'], d: DIF },
}
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
function genW(M, op, L) {
  const bank = WB[M], th = bank.length / 3, pool = bank.slice(Math.floor((L - 1) * th), Math.floor(L * th))
  const w = pool[rd(pool.length) - 1], toJa = op % 2 === 1, i = toJa ? 0 : 1
  const others = shuf(bank.filter((x) => x !== w)).slice(0, 3).map((x) => x[1 - i])
  const ch = shuf([w[1 - i], ...others])
  return { q: toJa ? `「${w[0]}」の意味は？` : `「${w[1]}」を表す英単語は？`, ch, a: ch.indexOf(w[1 - i]), e: `${w[0]}＝${w[1]}` }
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

export function gen(M, op, b) {
  const L = Math.ceil(b / 2)
  if (M === 'S') return genS(op >= 5 ? rd(4) : op, L + 1)
  if (M === 'J') return genJ(op === 6 ? rd(5) : op, L)
  if (M === 'H') return genH(op === 6 ? rd(5) : op, L)
  if (M === 'III') return gen3(op === 6 ? rd(5) : op, L)
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
    const st = AIL[b], D = Math.ceil(b / 2), lv = S.lv || 2, eng = S.M[0] === 'W' || S.M === 'G'
    c.pc = Math.min(0.999, ACC[lv] + (st - 2) * 0.04)
    c.aiT = (8 + 6 * D) * (eng ? 0.5 : 1) * TM[lv] * (1.3 - 0.15 * st) * (0.7 + 0.6 * Math.random())
    const base = S.M === 'S' ? 30 + 15 * D : eng ? (S.M === 'G' ? 15 + 5 * D : 12 + 4 * D) : 25 + 10 * D
    c.lim = Math.round(Math.max(base, c.aiT + 6)); c.t0 = Date.now()
  }
  S.ph = 'duel'; S.msg = ''; return S
}

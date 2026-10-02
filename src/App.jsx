import { useEffect, useState } from 'react'
import { SUBJ, LV, ACC_TEXT, OPP, AIL, SP, SPN, SPI, cur, buildGame, doRoll, resolve } from './engine'
import { createRoom, joinRoom, localRoom } from './online'
import { unlock, setBgm, setSe, setMood, sfx, isBgm, isSe } from './audio'
import './App.css'

const MENU = [
  ['算盤', [['S', 'そろばん']]],
  ['数学', [['J', '中学'], ['H', '高校'], ['A', '数学A'], ['III', '数学III'], ['U1', '共通テスト'], ['U2', 'MARCH・関関同立'], ['U3', '早慶・旧帝大'], ['U4', '東大・京大']]],
  ['英語', [['W3', '英検準2級'], ['W2', '英検2級'], ['WP1', '英検準1級'], ['W1', '英検1級'], ['G', '高校英文法'], ['E1', '共通テスト'], ['E2', 'MARCH・関関同立'], ['E3', '早慶・難関国立']]],
  ['国語', [['K', '古文単語'], ['KJ', '漢字の読み']]],
  ['理科', [['CH', '化学計算']]],
  ['社会', [['JH', '日本史']]],
]
const H = ['✊', '✌️', '✋']
const rd3 = () => Math.floor(Math.random() * 3)
const getId = () => {
  let id = localStorage.getItem('bm-id')
  if (!id) { id = Math.random().toString(36).slice(2, 10); localStorage.setItem('bm-id', id) }
  return id
}

function Rules({ M }) {
  const [tab, setTab] = useState(''), [sub, setSub] = useState(M)
  useEffect(() => setSub(M), [M])
  const s = SUBJ[sub]
  const TABS = [['how', '遊び方'], ['dice', 'さいころと問題'], ['sp', 'スペシャル'], ['ai', 'AIと制限時間']]
  return (
    <div className="card">
      <h2>📖 ルール</h2>
      <div className="chips">{TABS.map(([k, n]) => <button key={k} className={'chip' + (tab === k ? ' on' : '')} onClick={() => setTab(tab === k ? '' : k)}>{n}</button>)}</div>
      {!tab && <p className="mut">見たい項目を押してください。</p>}
      {tab === 'how' && (
        <ol>
          <li>攻撃側の打者が、さいころを2つ（ピッチャー用・バッター用）振ります。</li>
          <li>ピッチャーの目で問題の種類、バッターの目で難度と対戦相手が決まります。</li>
          <li>打者と対戦相手が早い者勝ちで答えます。打者が先に正解すれば単打、間違い・相手が先に正解・時間切れならアウトです。</li>
          <li>目の組み合わせによっては、じゃんけん・不戦勝などのスペシャルが起こります。</li>
          <li>3アウトで攻守交代。決めたイニング数が終わったら得点の多いチームの勝ちです。</li>
          <li>コールドゲーム：大きな点差がつくと途中で試合が終わります。9イニング制は5回に10点差・7回以降は7点差、5イニング制は3回に10点差・4回以降は7点差、3イニング制は2回に10点差・3回は7点差です（1〜2イニング制はなし）。後攻は、裏の攻撃中に点差が開いた時点でも終了です。</li>
          <li>ひとりで遊ぶときは自分のチーム4人を全員自分が操作します。オンラインは1人1選手（最大8人）で、足りない分はAIが入ります。</li>
        </ol>
      )}
      {tab === 'dice' && (
        <>
          <select value={sub} onChange={(e) => setSub(e.target.value)}>
            {MENU.flatMap(([c, l]) => l.map(([k, n]) => <option key={k} value={k}>{c}：{n}</option>))}
          </select>
          <div className="tw"><table>
            <thead><tr><th>目</th><th>問題の種類<br />（ピッチャー）</th><th>難度<br />（バッター）</th><th>対戦相手<br />（バッター）</th><th>AI</th></tr></thead>
            <tbody>{[1, 2, 3, 4, 5, 6].map((i) => (
              <tr key={i}><td>{i}</td><td>{s.t[i]}</td><td>{s.d[Math.ceil(i / 2) - 1]}</td><td>{OPP[i]}</td><td>{'★'.repeat(AIL[i])}</td></tr>
            ))}</tbody>
          </table></div>
        </>
      )}
      {tab === 'sp' && (
        <>
          <p className="mut">縦：ピッチャーの目／横：バッターの目</p>
          <div className="tw"><table>
            <thead><tr><th></th>{[1, 2, 3, 4, 5, 6].map((b) => <th key={b}>{b}</th>)}</tr></thead>
            <tbody>{[1, 2, 3, 4, 5, 6].map((p) => (
              <tr key={p}><th>{p}</th>{[1, 2, 3, 4, 5, 6].map((b) => <td key={b}>{SP[p + '-' + b] ? SPI[SP[p + '-' + b]] : '計算'}</td>)}</tr>
            ))}</tbody>
          </table></div>
          <p className="mut">✊じゃんけん（勝てば単打・負ければアウト）／🏳不戦勝（単打）／💀不戦敗（アウト）／🎲勝てば追加ダイス（1-2単打・3-4二塁打・5三塁打・6ホームラン）</p>
        </>
      )}
      {tab === 'ai' && (
        <>
          <ul>{[1, 2, 3, 4, 5].map((l) => <li key={l}>{LV[l]}：{ACC_TEXT(l)}</li>)}</ul>
          <p className="mut">対戦相手の役割の★が多いほど、AIは少し強くなります。制限時間が0になると打者アウトです。時間は科目と難度で変わります。</p>
        </>
      )}
    </div>
  )
}

// 野球のダイヤモンド（芝の縞模様・走者・結果の演出）
function Diamond({ bases, ev, n, show }) {
  const P = [[160, 92, '一塁'], [100, 34, '二塁'], [40, 92, '三塁']]
  const hr = show && ev && ev.includes('ホームラン')
  return (
    <div className="dia">
      <svg viewBox="0 0 200 178" width="100%">
        <defs>
          <pattern id="mow" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="10" height="20" fill="#1f7a43" /><rect x="10" width="10" height="20" fill="#18683a" />
          </pattern>
        </defs>
        <path d="M100 168 L4 82 Q100 -52 196 82 Z" fill="url(#mow)" stroke="#e9f5ec" strokeWidth="2" />
        <polygon points="100,150 160,92 100,34 40,92" fill="#b98350" />
        <polygon points="100,128 138,92 100,56 62,92" fill="#1d6e3d" />
        <circle cx="100" cy="92" r="6" fill="#c99a63" />
        {P.map(([x, y, t], i) => (
          <g key={i}>
            <rect x={x - 10} y={y - 10} width="20" height="20" transform={`rotate(45 ${x} ${y})`} className={'base' + (bases[i] ? ' on' : '')} />
            <text className="lbl" x={x} y={y + (i === 1 ? -17 : 27)}>{t}</text>
            {bases[i] ? <text key={n + '-' + i} className="run" x={x} y={y + 7}>🏃</text> : null}
          </g>
        ))}
        <path d="M92 150 L108 150 L108 157 L100 163 L92 157 Z" fill="#fff" />
        <text className="lbl" x="100" y="176">ホーム</text>
      </svg>
      {show && ev ? <div key={n} className="pop">{ev}</div> : null}
      {hr ? <div key={'fw' + n} className="fw">{Array.from({ length: 16 }, (_, i) => <b key={i} style={{ '--a': i * 22.5 + 'deg', '--h': i * 22 }} />)}</div> : null}
    </div>
  )
}

// さいころ（目の数だけ点が並び、振るたびに転がるアニメーション）
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] }
function Die({ v, red }) {
  return <div className={'die' + (red ? ' red' : '')}>{Array.from({ length: 9 }, (_, i) => <i key={i} className={PIPS[v].includes(i) ? 'pip' : ''} />)}</div>
}

// ナイター風のスコアボード（イニングごとの得点）
function Scoreboard({ S, T, end }) {
  const cols = Array.from({ length: S.N }, (_, i) => i)
  const val = (t, i) => {
    const v = S.line && S.line[t] ? S.line[t][i] : null
    if (v != null) return v
    if (i < S.inn - 1) return 0
    if (i === S.inn - 1) return t < S.half || (t === S.half && (!end || S.cold)) ? 0 : ''
    return ''
  }
  return (
    <div className="board">
      <table>
        <thead><tr><th></th>{cols.map((i) => <th key={i}>{i + 1}</th>)}<th>計</th></tr></thead>
        <tbody>{[0, 1].map((t) => (
          <tr key={t}>
            <td className="nm">{!end && S.half === t ? '🏏' : ''}{T[t].name}</td>
            {cols.map((i) => <td key={i} className={!end && i === S.inn - 1 && t === S.half ? 'cur' : ''}>{val(t, i)}</td>)}
            <td className="tot">{S.sc[t]}</td>
          </tr>
        ))}</tbody>
      </table>
      <div className="lamps">OUT {[0, 1, 2].map((i) => <i key={i} className={'lamp' + (i < S.outs ? ' on' : '')} />)}</div>
    </div>
  )
}

function Lobby({ doc, api, me }) {
  const col = (t) => doc.players.filter((p) => p.team === t)
  const [M, lv] = (doc.m || 'S.2').split('.')
  const host = doc.host === me
  const start = async () => {
    const fresh = (api.fetch && (await api.fetch())) || doc
    const r = await api.start(buildGame(fresh))
    if (r && r.error) alert('開始できませんでした：' + r.error.message)
  }
  return (
    <>
      <div className="card">
        <h2>部屋コード：<b>{api.code}</b>（{doc.players.length}/8人）</h2>
        <p className="mut">{SUBJ[M].n}・AI：{LV[+lv]}・{doc.n}イニング</p>
        <p>このコードを友達に伝えてください。</p>
        <div className="row">
          {[0, 1].map((t) => (
            <div key={t}><b>チーム{'AB'[t]}{t ? '（後攻）' : '（先攻）'}　{col(t).length}/4人</b>
              <ul>
                {col(t).map((p) => (
                  <li key={p.id}>{p.name}{p.id === me ? '（あなた）' : ''}
                    {host && <button className="sub mv" disabled={col(1 - t).length >= 4} onClick={() => api.setTeam(p.id, 1 - t)}>{t ? '← A' : 'B →'}</button>}
                  </li>
                ))}
                {!col(t).length && <li className="mut">（AIが入ります）</li>}
              </ul>
            </div>
          ))}
        </div>
        {host && <button className="sub" onClick={() => api.shuffle()}>🔀 ランダムにチーム分け</button>}
        {host && <button className="sub" onClick={() => api.swapTeams()}>⇄ 先攻・後攻を入れ替える</button>}
        <p className="mut">{host ? '名前の横のボタンで、チームを移せます。' : 'チーム分けは、部屋を作った人が決めます。'}各チーム4人になるまで、足りない分はAIが入ります。</p>
        {host ? <button onClick={start}>試合開始（足りない分はAI）</button>
          : <p className="mut">部屋を作った人が開始するのを待っています…</p>}
      </div>
      <Rules M={M} />
    </>
  )
}

function Game({ doc, api, me, onLeave }) {
  const S = doc.s, { hb, hd } = doc, [ans, setAns] = useState(''), [now, setNow] = useState(Date.now())
  const T = S.t, { o, d, bat, pit } = cur(S), c = S.cur
  const human = (n) => !!S.who[n], mine = (n) => S.who[n] === me
  const myT = T.findIndex((t) => t.pl.some(mine))
  const isBat = mine(bat), isOpp = !!c && mine(c.opp)
  const hasHuman = T[o].pl.some(human)
  const canRoll = isBat || (!human(bat) && myT === o && hasHuman)
  const duel = S.ph === 'duel' && c && c.pr
  const remain = duel ? Math.max(0, Math.ceil(c.lim - (now - c.t0) / 1000)) : null
  const tense = duel && remain <= 10

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(t) }, [])

  // 効果音とBGMの切り替え
  useEffect(() => {
    if (!S.n) return
    const m = S.msg || '', ev = S.ev || ''
    const a = m.includes('⭕') ? 'ok' : m.includes('❌') || m.includes('時間切れ') ? 'ng' : null
    if (a) sfx(a)
    const b = ev.includes('ホームラン') ? 'hr' : /単打|二塁打|三塁打/.test(ev) ? 'hit' : 'out'
    const t1 = setTimeout(() => sfx(b), a ? 260 : 0)
    const t2 = ev.includes('チェンジ') ? setTimeout(() => sfx('change'), 1100) : null
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [S.n]) // eslint-disable-line
  useEffect(() => { if (S.ph === 'duel') sfx('dice') }, [S.ph, S.n]) // eslint-disable-line
  useEffect(() => { if (remain !== null && remain > 0 && remain <= 5) sfx('tick') }, [remain])
  useEffect(() => { setMood(tense ? 'tense' : 'play') }, [tense])
  useEffect(() => {
    if (S.ph !== 'end') return
    const w = S.sc[0] > S.sc[1] ? 0 : S.sc[1] > S.sc[0] ? 1 : -1
    sfx(w >= 0 && w === myT ? 'win' : 'out')
  }, [S.ph]) // eslint-disable-line

  // 部屋を作った人（ひとりで遊ぶ時は自分）の端末が、AIの動きと時間切れを担当する
  useEffect(() => {
    if (me !== S.hostId || S.ph === 'end') return
    const ts = [], at = (f, ms) => ts.push(setTimeout(f, ms))
    if (S.ph === 'roll') { if (!hasHuman && !S.hold) at(() => api.write(doRoll(S)), 700) }
    else {
      const aiB = !human(bat), aiO = !human(c.opp), both = aiB && aiO
      if (c.sp === 'j') {
        if (aiB || aiO) at(() => {
          if (both) return api.write(resolve(S, Math.random() < 0.5, 'AI同士のじゃんけん'))
          if (aiB && hb == null) api.hand('hb', rd3())
          if (aiO && hd == null) api.hand('hd', rd3())
        }, both ? 600 : 1200)
      } else {
        if (aiB || aiO) at(() => {
          const ok = Math.random() < (c.pc || 0.7)
          if (both) return api.write(resolve(S, Math.random() < 0.5, 'AI同士の勝負'))
          api.write(aiB ? resolve(S, ok, `${bat}(AI)が${ok ? '先に正解！' : 'ミス！'}`) : resolve(S, !ok, `${c.opp}(AI)が${ok ? '先に正解！' : 'ミス！'}`))
        }, both ? 600 : c.aiT * 1000)
        at(() => api.write(resolve(S, false, '⏰ 時間切れ！')), Math.max(0, c.lim * 1000 - (Date.now() - c.t0)))
      }
    }
    return () => ts.forEach(clearTimeout)
  }, [S.n, S.ph, S.msg, hb, hd]) // eslint-disable-line

  const answer = (ok, shown) => { setAns(''); api.write(resolve(S, isBat ? ok : !ok, (ok ? '⭕ 正解！' : '❌ 不正解！') + (shown != null ? `（入力した答え ${shown}）` : ''))) }
  const submit = () => { if (ans.trim() !== '') answer(Number(ans.replace(/[－−]/g, '-')) === c.pr.a, ans) }
  const showJk = () => {
    if (hb === hd) return api.write({ ...S, msg: 'あいこ！もう一度' })
    api.write(resolve(S, (hb + 1) % 3 === hd, `${H[hb]}（打者）vs ${H[hd]}（守備）`))
  }

  const banner = myT < 0 ? ['spec', `👀 観戦中｜${T[o].name}が攻撃`]
    : myT === o ? ['atk', `🏏 攻撃中｜あなたのチーム（${T[o].name}）が打つ番`]
    : ['def', `🛡 守備中｜${T[o].name}が攻撃。あなたのチーム（${T[d].name}）が守る番`]
  const end = S.ph === 'end'
  const handMine = isBat ? hb : hd, handOther = isBat ? hd : hb
  const runners = ['1塁', '2塁', '3塁'].filter((_, i) => S.bases[i]).join('・') || 'なし'
  const myNames = T.flatMap((t) => t.pl).filter(mine)

  return (
    <div>
      {!end && <div className={'ban ' + banner[0]}>{banner[1]}</div>}
      <Scoreboard S={S} T={T} end={end} />
      <div className="card">
        <Diamond bases={S.bases} ev={S.ev} n={S.n} show={S.ph === 'roll' && S.n > 0} />
        <div className="mut" style={{ textAlign: 'center' }}>ランナー：{runners}　｜　{SUBJ[S.M].n}・AI：{LV[S.lv]}</div>
      </div>
      {S.msg && <div className="card msg">{S.msg}</div>}
      {end ? (
        <div className="card"><div className="chalk">{S.cold ? '⚡ コールドゲーム！ ' : ''}{S.sc[0] > S.sc[1] ? T[0].name + ' の勝ち！' : S.sc[1] > S.sc[0] ? T[1].name + ' の勝ち！' : '引き分け'}</div><button onClick={onLeave}>最初に戻る</button></div>
      ) : (
        <div className="card">
          {myNames.length > 0 && <p className="mut">あなた：{myNames.length > 1 ? `${T[myT].name}の全員（${myNames.join('・')}）を操作` : `${myNames[0]}（${T[myT].name}）`}</p>}
          <p>🏏 打者：<b>{bat}</b>（{T[o].name}）／ 🛡 ピッチャー：<b>{pit}</b></p>
          {S.ph === 'roll' ? (canRoll
            ? <button onClick={() => api.write(doRoll(S))}>🎲 さいころを振る</button>
            : S.hold && !hasHuman && myT >= 0
              ? <button onClick={() => api.write(doRoll(S))}>▶ 次の打席へ（{T[o].name}の攻撃）</button>
              : <p className="mut">{bat}のさいころを待っています…</p>) : (
            <>
              <div className="dice" key={S.n}>
                <div className="dw"><Die v={c.p} />ピッチャー</div>
                <div className="dw"><Die v={c.b} red />バッター</div>
              </div>
              {c.sp && <p><b>スペシャル！ {SPN[c.sp]}</b></p>}
              <p>打者：<b>{bat}</b> ／ 相手：<b>{c.opp}</b>（{c.role}）</p>
              {!(isBat || isOpp) ? <p className="mut">観戦中：{bat} vs {c.opp}</p>
                : c.sp === 'j' ? (
                  <>
                    <p className="mut">{isBat ? '勝てば単打・負ければアウト' : '勝てばアウト・負ければ相手の単打'}</p>
                    {handMine == null ? H.map((h, i) => <button key={i} onClick={() => api.hand(isBat ? 'hb' : 'hd', i)}>{h}</button>)
                      : <p>あなたの手：{H[handMine]}　{handOther == null ? '相手の手を待っています…' : '相手も出しました'}</p>}
                    {handMine != null && handOther != null && <button onClick={showJk}>結果を見る</button>}
                  </>
                ) : (
                  <>
                    <div className={'timer' + (remain <= 5 ? ' warn' : '')}>⏱ 残り {remain} 秒</div>
                    <div className={'tbar' + (remain <= 5 ? ' warn' : '')}><div style={{ width: Math.min(100, (remain / c.lim) * 100) + '%' }} /></div>
                    <p className="mut">{SUBJ[S.M].t[c.p]}・{SUBJ[S.M].d[Math.ceil(c.b / 2) - 1]}｜早い者勝ち！（{isBat ? 'あなたは打者側' : 'あなたは相手役'}）</p>
                    <div className="chalk">{c.pr.q}{!c.pr.ch && S.M === 'S' ? ' ＝ ？' : ''}</div>
                    {c.pr.ch
                      ? c.pr.ch.map((t, i) => <button key={i} className="ch" onClick={() => answer(i === c.pr.a)}>{'ABCD'[i]}. {t}</button>)
                      : <><input inputMode="numeric" value={ans} onChange={(e) => setAns(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} /><button onClick={submit}>回答</button></>}
                  </>
                )}
            </>
          )}
        </div>
      )}
      <details><summary>ルール表を見る</summary><Rules M={S.M} /></details>
    </div>
  )
}

export default function App() {
  const me = getId()
  const [name, setName] = useState(localStorage.getItem('bm-name') || '')
  const [M, setM] = useState(localStorage.getItem('bm-M') || 'S'), [N, setN] = useState(3), [lv, setLv] = useState(2), [code, setCode] = useState('')
  const [api, setApi] = useState(null), [doc, setDoc] = useState(null), [err, setErr] = useState('')
  const [bgm, setB] = useState(isBgm()), [se, setS] = useState(isSe())
  const m = `${M}.${lv}`
  const cat = Math.max(0, MENU.findIndex(([, l]) => l.some(([k]) => k === M)))
  const pick = (k) => { setM(k); localStorage.setItem('bm-M', k) }

  useEffect(() => { if (!api) return; return api.subscribe((d) => setDoc((prev) => (JSON.stringify(prev) === JSON.stringify(d) ? prev : d))) }, [api])

  const enter = async (make) => {
    unlock()
    const nm = name.trim().slice(0, 12)
    if (!nm) return setErr('名前を入力してください')
    localStorage.setItem('bm-name', nm); setErr('')
    try { setApi(await make(nm)) } catch (e) {
      const msg = e.message || ''
      setErr(/Invalid path/i.test(msg) ? '接続先のURL設定が正しくありません（VITE_SUPABASE_URL を確認してください）' : msg || '失敗しました')
    }
  }
  // ひとりで遊ぶ：自分のチーム4人を全員自分が操作し、相手チームはAI
  const solo = () => enter(async (nm) => {
    const players = [1, 2, 3, 4].map((i) => ({ id: me, name: nm + i, team: 0 }))
    const a = localRoom(me, nm, N, m)
    await a.start(buildGame({ players, n: N, m, host: me }))
    return a
  })
  const leave = () => { setApi(null); setDoc(null) }

  return (
    <main>
      <div className="hd">
        <h1><span className="neon">BASEBALL</span><span className="neon2">× 計算バトル ⚾ ナイトゲーム</span></h1>
        <div className="aud">
          <button className="ic" title="BGM" onClick={() => { unlock(); const v = !bgm; setBgm(v); setB(v) }}>{bgm ? '🎵' : '🔇'}</button>
          <button className="ic" title="効果音" onClick={() => { unlock(); const v = !se; setSe(v); setS(v) }}>{se ? '🔊' : '🔈'}</button>
        </div>
      </div>
      {!api ? (
        <>
          <div className="card">
            <input placeholder="あなたの名前" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="chips">{MENU.map(([n, l], i) => <button key={n} className={'chip' + (i === cat ? ' on' : '')} onClick={() => pick(l[0][0])}>{n}</button>)}</div>
            <div className="chips">{MENU[cat][1].map(([k, n]) => <button key={k} className={'chip' + (k === M ? ' on' : '')} onClick={() => pick(k)}>{n}</button>)}</div>
            <p className="mut">選択中：<b>{SUBJ[M].n}</b></p>
            <div className="row">
              <select value={lv} onChange={(e) => setLv(+e.target.value)}>{[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>AI：{LV[l]}</option>)}</select>
              <select value={N} onChange={(e) => setN(+e.target.value)}>{[1, 2, 3, 5, 9].map((n) => <option key={n} value={n}>{n}イニング</option>)}</select>
            </div>
            <button onClick={solo}>ひとりで遊ぶ（自分のチームは全員自分が操作・相手はAI）</button>
            <button onClick={() => enter((nm) => createRoom(me, nm, N, m))}>部屋を作る（みんなで対戦）</button>
            <p className="mut">科目・AIレベル・イニング数は、部屋を作る人の設定になります。</p>
            <input inputMode="numeric" placeholder="部屋コード（4桁）" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="sub" onClick={() => enter((nm) => joinRoom(code.trim(), me, nm))}>部屋に入る</button>
            {err && <p style={{ color: '#ff8a8a' }}>{err}</p>}
          </div>
          <Rules M={M} />
        </>
      ) : !doc ? <p className="mut">接続中…</p>
        : !doc.s ? <Lobby doc={doc} api={api} me={me} />
        : <Game doc={doc} api={api} me={me} onLeave={leave} />}
      {api && <button className="sub" onClick={leave}>退出する</button>}
    </main>
  )
}

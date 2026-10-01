import { useEffect, useState } from 'react'
import { SUBJ, LV, ACC_TEXT, OPP, AIL, SP, SPN, SPI, cur, buildGame, doRoll, resolve } from './engine'
import { createRoom, joinRoom, localRoom } from './online'
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

// 野球のダイヤモンド（走者・塁・イベントのアニメーション）
function Diamond({ bases, ev, n, show }) {
  const P = [[160, 92, '一塁'], [100, 34, '二塁'], [40, 92, '三塁']]
  const sq = (x, y, on, k) => <rect key={k} x={x - 11} y={y - 11} width="22" height="22" transform={`rotate(45 ${x} ${y})`} className={'base' + (on ? ' on' : '')} />
  return (
    <div className="dia">
      <svg viewBox="0 0 200 175" width="100%">
        <polygon points="100,150 160,92 100,34 40,92" className="field" />
        {P.map(([x, y, t], i) => (
          <g key={i}>{sq(x, y, bases[i], i)}<text className="lbl" x={x} y={y + (i === 1 ? -18 : 28)}>{t}</text>
            {bases[i] ? <text key={n + '-' + i} className="run" x={x} y={y + 7}>🏃</text> : null}</g>
        ))}
        <path d="M92 150 L108 150 L108 158 L100 164 L92 158 Z" fill="var(--card)" stroke="var(--ac)" strokeWidth="3" />
        <text className="lbl" x="100" y="174">ホーム</text>
      </svg>
      {show && ev ? <div key={n} className="pop">{ev}</div> : null}
    </div>
  )
}

function Lobby({ doc, api, me }) {
  const col = (t) => doc.players.filter((p) => p.team === t)
  const [M, lv] = (doc.m || 'S.2').split('.')
  return (
    <>
      <div className="card">
        <h2>部屋コード：<b>{api.code}</b>（{doc.players.length}/8人）</h2>
        <p className="mut">{SUBJ[M].n}・AI：{LV[+lv]}・{doc.n}イニング</p>
        <p>このコードを友達に伝えてください。</p>
        <div className="row">
          {[0, 1].map((t) => (
            <div key={t}><b>チーム{'AB'[t]}{t ? '（後攻）' : '（先攻）'}</b>
              <ul>{col(t).map((p) => <li key={p.id}>{p.name}{p.id === me ? '（あなた）' : ''}</li>)}{!col(t).length && <li className="mut">（AIが入ります）</li>}</ul>
            </div>
          ))}
        </div>
        <p className="mut">各チーム4人になるまで、足りない分はAIが入ります。</p>
        {doc.host === me ? <button onClick={() => api.start(buildGame(doc))}>試合開始（足りない分はAI）</button>
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

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(t) }, [])

  // 部屋を作った人（ひとりで遊ぶ時は自分）の端末が、AIの動きと時間切れを担当する
  useEffect(() => {
    if (me !== S.hostId || S.ph === 'end') return
    const ts = [], at = (f, ms) => ts.push(setTimeout(f, ms))
    if (S.ph === 'roll') { if (!hasHuman) at(() => api.write(doRoll(S)), 700) }
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
      <div className="card">
        <div className="sc">
          <span>{!end && o === 0 ? '🏏' : ''}{T[0].name} {S.sc[0]}</span>
          <span>{Math.min(S.inn, S.N)}回{S.half ? '裏' : '表'}</span>
          <span>{S.sc[1]} {T[1].name}{!end && o === 1 ? '🏏' : ''}</span>
        </div>
        <Diamond bases={S.bases} ev={S.ev} n={S.n} show={S.ph === 'roll' && S.n > 0} />
        <div>ランナー：{runners}　アウト：{'●'.repeat(S.outs)}{'○'.repeat(3 - S.outs)}</div>
        <div className="mut">{SUBJ[S.M].n}・AI：{LV[S.lv]}</div>
      </div>
      {S.msg && <div className="card msg">{S.msg}</div>}
      {end ? (
        <div className="card"><div className="big">{S.sc[0] > S.sc[1] ? T[0].name + ' の勝ち！' : S.sc[1] > S.sc[0] ? T[1].name + ' の勝ち！' : '引き分け'}</div><button onClick={onLeave}>最初に戻る</button></div>
      ) : (
        <div className="card">
          {myNames.length > 0 && <p className="mut">あなた：{myNames.length > 1 ? `${T[myT].name}の全員（${myNames.join('・')}）を操作` : `${myNames[0]}（${T[myT].name}）`}</p>}
          <p>🏏 打者：<b>{bat}</b>（{T[o].name}）／ 🛡 ピッチャー：<b>{pit}</b></p>
          {S.ph === 'roll' ? (canRoll
            ? <button onClick={() => api.write(doRoll(S))}>🎲 さいころを振る</button>
            : <p className="mut">{bat}のさいころを待っています…</p>) : (
            <>
              <div className="dice">🎲{c.p}　🎲{c.b}</div>
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
                    <div className="big">{c.pr.q}{!c.pr.ch && (S.M === 'S') ? ' ＝ ？' : ''}</div>
                    {c.pr.ch
                      ? c.pr.ch.map((t, i) => <button key={i} className="sub ch" onClick={() => answer(i === c.pr.a)}>{'ABCD'[i]}. {t}</button>)
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
  const m = `${M}.${lv}`
  const cat = Math.max(0, MENU.findIndex(([, l]) => l.some(([k]) => k === M)))
  const pick = (k) => { setM(k); localStorage.setItem('bm-M', k) }

  useEffect(() => { if (!api) return; return api.subscribe(setDoc) }, [api])

  const enter = async (make) => {
    const nm = name.trim().slice(0, 12)
    if (!nm) return setErr('名前を入力してください')
    localStorage.setItem('bm-name', nm); setErr('')
    try { setApi(await make(nm)) } catch (e) { setErr(e.message || '失敗しました') }
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
      <h1>⚾ 野球×計算バトル</h1>
      {!api ? (
        <>
          <div className="card">
            <input placeholder="あなたの名前" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="chips">{MENU.map(([name, l], i) => <button key={name} className={'chip' + (i === cat ? ' on' : '')} onClick={() => pick(l[0][0])}>{name}</button>)}</div>
            <div className="chips">{MENU[cat][1].map(([k, name]) => <button key={k} className={'chip' + (k === M ? ' on' : '')} onClick={() => pick(k)}>{name}</button>)}</div>
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
            {err && <p style={{ color: '#c2410c' }}>{err}</p>}
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

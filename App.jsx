import { useEffect, useState } from 'react'
import { OPN, DG, OPP, AIL, SP, SPN, SPI, cur, buildGame, doRoll, resolve } from './engine'
import { createRoom, joinRoom, localRoom } from './online'
import './App.css'

const H = ['✊', '✌️', '✋']
const rd3 = () => Math.floor(Math.random() * 3)
const getId = () => {
  let id = localStorage.getItem('bm-id')
  if (!id) { id = Math.random().toString(36).slice(2, 10); localStorage.setItem('bm-id', id) }
  return id
}

function Rules({ M }) {
  return (
    <div className="card">
      <h2>ルール表（固定）</h2>
      <div className="tw"><table>
        <thead><tr><th>目</th><th>種類（ピッチャー）</th><th>{M === 'S' ? '桁数' : '難度'}（バッター）</th><th>相手</th><th>AI</th></tr></thead>
        <tbody>{[1, 2, 3, 4, 5, 6].map((i) => (
          <tr key={i}><td>{i}</td><td>{OPN[M][i]}</td><td>{DG[M][i]}</td><td>{OPP[i]}</td><td>{'★'.repeat(AIL[i])}</td></tr>
        ))}</tbody>
      </table></div>
      <p className="mut">スペシャル（縦：ピッチャー／横：バッター）</p>
      <div className="tw"><table>
        <thead><tr><th></th>{[1, 2, 3, 4, 5, 6].map((b) => <th key={b}>{b}</th>)}</tr></thead>
        <tbody>{[1, 2, 3, 4, 5, 6].map((p) => (
          <tr key={p}><th>{p}</th>{[1, 2, 3, 4, 5, 6].map((b) => <td key={b}>{SP[p + '-' + b] ? SPI[SP[p + '-' + b]] : '計算'}</td>)}</tr>
        ))}</tbody>
      </table></div>
      <p className="mut">✊じゃんけん／🏳不戦勝（単打）／💀不戦敗（アウト）／🎲勝てば追加ダイス（1-2単打・3-4二塁打・5三塁打・6ホームラン）</p>
    </div>
  )
}

function Lobby({ doc, api, me }) {
  const col = (t) => doc.players.filter((p) => p.team === t)
  return (
    <div className="card">
      <h2>部屋コード：<b>{api.code}</b>（{doc.players.length}/8人）</h2>
      {api.code !== 'ひとり' && <p>このコードを友達に伝えてください。</p>}
      <div className="row">
        {[0, 1].map((t) => (
          <div key={t}><b>チーム{'AB'[t]}{t ? '（後攻）' : '（先攻）'}</b>
            <ul>{col(t).map((p) => <li key={p.id}>{p.name}{p.id === me ? '（あなた）' : ''}</li>)}{!col(t).length && <li className="mut">（AIが入ります）</li>}</ul>
          </div>
        ))}
      </div>
      <p className="mut">各チーム4人になるまで、足りない分はAIが入ります。</p>
      {doc.host === me
        ? <button onClick={() => api.start(buildGame(doc))}>試合開始（足りない分はAI）</button>
        : <p className="mut">部屋を作った人が開始するのを待っています…</p>}
    </div>
  )
}

function Game({ doc, api, me, onLeave }) {
  const S = doc.s, { hb, hd } = doc, [ans, setAns] = useState('')
  const T = S.t, { o, d, bat, pit } = cur(S), c = S.cur
  const human = (n) => !!S.who[n]
  const my = Object.keys(S.who).find((n) => S.who[n] === me) || ''
  const myT = T.findIndex((t) => t.pl.includes(my))
  const isBat = my === bat, isOpp = !!c && my === c.opp
  const hasHuman = T[o].pl.some(human)
  const canRoll = isBat || (!human(bat) && myT === o && hasHuman)

  // 部屋を作った人の端末が、AI選手の動きを担当する
  useEffect(() => {
    if (me !== S.hostId || S.ph === 'end') return
    let t
    if (S.ph === 'roll') { if (!hasHuman) t = setTimeout(() => api.write(doRoll(S)), 1500) }
    else {
      const aiB = !human(bat), aiO = !human(c.opp)
      if (aiB || aiO) {
        if (c.sp === 'j') t = setTimeout(() => {
          if (aiB && aiO) return api.write(resolve(S, Math.random() < 0.5, 'AI同士のじゃんけん'))
          if (aiB && hb == null) api.hand('hb', rd3())
          if (aiO && hd == null) api.hand('hd', rd3())
        }, 1200)
        else t = setTimeout(() => {
          const ok = Math.random() < (c.pc || 0.7)
          if (aiB && aiO) return api.write(resolve(S, Math.random() < 0.5, 'AI同士の勝負'))
          api.write(aiB ? resolve(S, ok, `${bat}(AI)が${ok ? '先に正解！' : 'ミス！'}`) : resolve(S, !ok, `${c.opp}(AI)が${ok ? '先に正解！' : 'ミス！'}`))
        }, (c.aiT || 8) * 1000)
      }
    }
    return () => clearTimeout(t)
  }, [S.n, S.ph, S.msg, hb, hd]) // eslint-disable-line

  const submit = () => {
    if (ans.trim() === '') return
    const ok = Number(ans.replace(/[－−]/g, '-')) === c.pr.a
    setAns('')
    api.write(resolve(S, isBat ? ok : !ok, (ok ? '⭕ 正解！' : '❌ 不正解！') + `（入力した答え ${ans}）`))
  }
  const showJk = () => {
    if (hb === hd) return api.write({ ...S, msg: 'あいこ！もう一度' })
    api.write(resolve(S, (hb + 1) % 3 === hd, `${H[hb]}（打者）vs ${H[hd]}（守備）`))
  }

  const banner = my === '' ? ['spec', `👀 観戦中｜${T[o].name}が攻撃`]
    : myT === o ? ['atk', `🏏 攻撃中｜あなたのチーム（${T[o].name}）が打つ番`]
    : ['def', `🛡 守備中｜${T[o].name}が攻撃。あなたのチーム（${T[d].name}）が守る番`]
  const end = S.ph === 'end'
  const mine = isBat ? hb : hd, other = isBat ? hd : hb

  return (
    <div>
      {!end && <div className={'ban ' + banner[0]}>{banner[1]}</div>}
      <div className="card">
        <div className="sc">
          <span>{!end && o === 0 ? '🏏' : ''}{T[0].name} {S.sc[0]}</span>
          <span>{Math.min(S.inn, S.N)}回{S.half ? '裏' : '表'}</span>
          <span>{S.sc[1]} {T[1].name}{!end && o === 1 ? '🏏' : ''}</span>
        </div>
        <div className="bases"><span className={S.bases[1] ? 'on' : ''} /><span className={S.bases[2] ? 'on' : ''} /><span className={S.bases[0] ? 'on' : ''} /> <small className="mut">（2塁・3塁・1塁）</small></div>
        <div>アウト：{'●'.repeat(S.outs)}{'○'.repeat(3 - S.outs)}　<span className="mut">{S.M === 'S' ? 'そろばん' : '高校数学'}</span></div>
      </div>
      {S.msg && <div className="card">{S.msg}</div>}
      {end ? (
        <div className="card"><div className="big">{S.sc[0] > S.sc[1] ? T[0].name + ' の勝ち！' : S.sc[1] > S.sc[0] ? T[1].name + ' の勝ち！' : '引き分け'}</div><button onClick={onLeave}>最初に戻る</button></div>
      ) : (
        <div className="card">
          {my && <p className="mut">あなた：{my}（{T[myT].name}）</p>}
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
                    {mine == null ? H.map((h, i) => <button key={i} onClick={() => api.hand(isBat ? 'hb' : 'hd', i)}>{h}</button>)
                      : <p>あなたの手：{H[mine]}　{other == null ? '相手の手を待っています…' : '相手も出しました'}</p>}
                    {mine != null && other != null && <button onClick={showJk}>結果を見る</button>}
                  </>
                ) : (
                  <>
                    <p className="mut">{OPN[S.M][c.p]}・{DG[S.M][c.b]}｜早い者勝ち！先に正解した側の勝ち（{isBat ? 'あなたは打者' : 'あなたは相手役'}）</p>
                    <div className="big">{c.pr.q}{S.M === 'S' ? ' ＝ ？' : ''}</div>
                    <input inputMode="numeric" value={ans} onChange={(e) => setAns(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
                    <button onClick={submit}>回答</button>
                  </>
                )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const me = getId()
  const [name, setName] = useState(localStorage.getItem('bm-name') || '')
  const [M, setM] = useState('S'), [N, setN] = useState(3), [code, setCode] = useState('')
  const [api, setApi] = useState(null), [doc, setDoc] = useState(null), [err, setErr] = useState('')

  useEffect(() => { if (!api) return; const un = api.subscribe(setDoc); return un }, [api])

  const enter = async (make) => {
    const nm = name.trim().slice(0, 12)
    if (!nm) return setErr('名前を入力してください')
    localStorage.setItem('bm-name', nm); setErr('')
    try { setApi(await make(nm)) } catch (e) { setErr(e.message || '失敗しました') }
  }
  const solo = () => enter(async (nm) => {
    const a = localRoom(me, nm, N, M)
    await a.start(buildGame({ players: [{ id: me, name: nm, team: 0 }], n: N, m: M, host: me }))
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
            <div className="row">
              <select value={M} onChange={(e) => setM(e.target.value)}><option value="S">そろばん（難）</option><option value="H">高校数学</option></select>
              <select value={N} onChange={(e) => setN(+e.target.value)}>{[1, 2, 3, 5, 9].map((n) => <option key={n} value={n}>{n}イニング</option>)}</select>
            </div>
            <button onClick={solo}>ひとりで遊ぶ（相手はAI）</button>
            <button onClick={() => enter((nm) => createRoom(me, nm, N, M))}>部屋を作る（みんなで対戦）</button>
            <p className="mut">モードとイニング数は、部屋を作る人の設定になります。</p>
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

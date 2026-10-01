// ブラウザだけで鳴らすBGMと効果音（音源ファイルは使わず、その場で合成します）
let ctx = null, master, music, se, timer = null, step = 0, nextT = 0, mood = 'play', nb = null
let bgmOn = localStorage.getItem('bm-bgm') !== '0', seOn = localStorage.getItem('bm-se') !== '0'
export const isBgm = () => bgmOn
export const isSe = () => seOn
const hz = (n) => 440 * 2 ** ((n - 69) / 12)

function boot() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination)
    music = ctx.createGain(); music.gain.value = 0.2; music.connect(master)
    se = ctx.createGain(); se.gain.value = 0.5; se.connect(master)
  }
  if (ctx.state === 'suspended') ctx.resume()
}
function tone(bus, type, f, t, d, v, f2) {
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.setValueAtTime(f, t)
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d)
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d)
  o.connect(g); g.connect(bus); o.start(t); o.stop(t + d + 0.05)
}
function noise(bus, t, d, v, freq = 3000) {
  if (!nb) { nb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const a = nb.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1 }
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain()
  s.buffer = nb; f.type = 'highpass'; f.frequency.value = freq
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d)
  s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t + d)
}

// BGM：play＝明るいナイターの行進曲風、tense＝制限時間が少ないときの緊迫した曲
const M = {
  play: { bpm: 126, bass: [48, 45, 41, 43], mel: [[72, 0, 76, 0, 79, 76, 72, 0], [69, 0, 72, 0, 76, 72, 69, 0], [65, 0, 69, 0, 72, 69, 65, 0], [67, 0, 71, 0, 74, 71, 67, 0]] },
  tense: { bpm: 156, bass: [45, 41, 48, 40], mel: [[69, 72, 76, 72, 69, 72, 76, 81], [65, 69, 72, 69, 65, 69, 72, 77], [72, 76, 79, 76, 72, 76, 79, 84], [68, 71, 76, 71, 68, 71, 76, 80]] },
}
function playStep(t) {
  const m = M[mood], bar = Math.floor(step / 8) % 4, s = step % 8
  if (s % 2 === 0) tone(music, 'triangle', hz(m.bass[bar] - 12 + (s === 4 ? 12 : 0)), t, 0.2, 0.9)
  const n = m.mel[bar][s]; if (n) tone(music, 'square', hz(n), t, 0.16, 0.25)
  if (s === 0 || s === 4 || (mood === 'tense' && s === 7)) tone(music, 'sine', 120, t, 0.12, 1, 45)
  if (s === 2 || s === 6) noise(music, t, 0.1, 0.5, 1800)
  if (s % 2 === 1) noise(music, t, 0.04, 0.25, 7000)
}
function sched() { while (nextT < ctx.currentTime + 0.3) { playStep(nextT); nextT += 60 / M[mood].bpm / 2; step++ } }

export function startBgm() { if (!bgmOn) return; boot(); if (!timer) { nextT = ctx.currentTime + 0.05; step = 0; timer = setInterval(sched, 80) } }
export function stopBgm() { clearInterval(timer); timer = null }
export function setBgm(on) { bgmOn = on; localStorage.setItem('bm-bgm', on ? '1' : '0'); on ? startBgm() : stopBgm() }
export function setSe(on) { seOn = on; localStorage.setItem('bm-se', on ? '1' : '0') }
export function setMood(m) { if (m !== mood) { mood = m; step = 0 } }
export function unlock() { boot(); startBgm() } // ボタンを押したときに呼ぶ（ブラウザの自動再生ルールのため）

export function sfx(name) {
  if (!seOn || !ctx) return
  const t = ctx.currentTime + 0.01
  const T = (type, f, dt, d, v, f2) => tone(se, type, f, t + dt, d, v, f2)
  if (name === 'dice') for (let i = 0; i < 6; i++) { noise(se, t + i * 0.07, 0.04, 0.6, 2500); T('square', 300 + i * 40, i * 0.07, 0.03, 0.3) }
  if (name === 'ok') { T('square', 784, 0, 0.1, 0.5); T('square', 1047, 0.1, 0.2, 0.5) }
  if (name === 'ng') T('sawtooth', 180, 0, 0.35, 0.6, 90)
  if (name === 'hit') { noise(se, t, 0.08, 1, 1500); T('triangle', 900, 0, 0.12, 0.6, 300) }
  if (name === 'hr') { noise(se, t, 0.1, 1, 1200); [523, 659, 784, 1047, 1319].forEach((f, i) => T('square', f, 0.12 + i * 0.09, 0.2, 0.45)); noise(se, t + 0.5, 1.2, 0.25, 800) }
  if (name === 'out') [440, 392, 330].forEach((f, i) => T('triangle', f, i * 0.12, 0.2, 0.6))
  if (name === 'tick') T('square', 1200, 0, 0.04, 0.4)
  if (name === 'change') { T('square', 523, 0, 0.12, 0.4); T('square', 392, 0.14, 0.2, 0.4) }
  if (name === 'win') [523, 523, 523, 659, 784, 1047].forEach((f, i) => T('square', f, i * 0.14, 0.25, 0.45))
}

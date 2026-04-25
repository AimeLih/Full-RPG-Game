import { useEffect, useState } from 'react'
import { gameApi } from './api/gameApi'
import './App.css'

const introLines = [
  { text: 'Welcome traveler to the world of Rashinova.', delay: 2500 },
  { text: 'Rashinova used to be a peaceful realm until it fell to the clutches of evil...', delay: 3500 },
  { text: 'Now it is a home for monsters and evil alike.', delay: 2500 },
  { text: '─────────────────────────────────────────', delay: 1500 },
  { text: 'Please take up arms and bring peace back to Rashinova, traveler.', delay: 3000 },
]

function IntroScreen({ onDone }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [finished, setFinished]         = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      for (const line of introLines) {
        if (cancelled) return
        setVisibleLines(prev => [...prev, line.text])
        await new Promise(r => setTimeout(r, line.delay))
      }
      if (!cancelled) setFinished(true)
    }

    run()
    return () => { cancelled = true }
  }, [])

  const skip = () => {
    setVisibleLines(introLines.map(l => l.text))
    setFinished(true)
  }

  return (
    <div className="setup-box" style={{ alignItems: 'flex-start', position: 'relative', minHeight: '300px' }}>
      <div style={{ textAlign: 'left', maxWidth: '600px', width: '100%' }}>
        {visibleLines.map((line, i) => (
          <p key={i} style={{
            fontSize: '9px', color: i === visibleLines.length - 1 ? '#fff' : '#777',
            lineHeight: '2.5', margin: '4px 0',
            borderLeft: i === visibleLines.length - 1 ? '2px solid #fff' : '2px solid transparent',
            paddingLeft: '10px',
            transition: 'color 0.5s'
          }}>
            {line}
            {i === visibleLines.length - 1 && !finished && (
              <span className="cursor" style={{ marginLeft: '4px' }}/>
            )}
          </p>
        ))}
      </div>

      {finished && (
        <button
          className="weapon-btn"
          style={{ marginTop: '30px', alignSelf: 'center' }}
          onClick={onDone}
        >
          BEGIN YOUR JOURNEY
        </button>
      )}

      {!finished && (
        <button
          onClick={skip}
          style={{
            position: 'absolute', bottom: '10px', right: '10px',
            background: 'transparent', border: '1px solid #444',
            color: '#555', fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px', padding: '6px 10px', cursor: 'pointer'
          }}
        >
          SKIP
        </button>
      )}
    </div>
  )
}

function App() {
  const [gameState, setGameState]     = useState(null)
  const [battle, setBattle]           = useState(null)
  const [day, setDay]                 = useState(1)
  const [battleCount, setBattleCount] = useState(0)
  const [gameStage, setGameStage]     = useState('INTRO')
  const [selectedWeapon, setSelectedWeapon] = useState(null)
  const [isAttacking, setIsAttacking] = useState(false)
  const [activePanel, setActivePanel] = useState(null)
  const [combatLog, setCombatLog]     = useState(['Darkness stirs in the dungeon...'])
  const [maxPlayerHp, setMaxPlayerHp] = useState(100)
  const [maxEnemyHp, setMaxEnemyHp]   = useState(100)

  useEffect(() => {
    gameApi.startGame().then(setGameState)
  }, [])

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
  const log = (msg) => setCombatLog(prev => [...prev.slice(-5), msg])

  const weaponData = {
    'Wooden Sword': {
      atkRange: '5-8',
      crit: '10%',
      description: 'A sword crafted out of some dusty wood on a cool weekday. Make sure not to overuse it.',
    },
    'Rusted Dagger': {
      atkRange: '2-4',
      crit: '35%',
      description: 'A dagger that has gone past its usefulness. Might be able to inflict minor wounds.',
    },
    'Old Scythe': {
      atkRange: '1-4',
      crit: '60%',
      description: 'A scythe handled with care until its owner passed away. You feel as if it yearns to be used once more.',
    },
  }

  const hpBarColor = (hp, max) => {
    const pct = (hp / max) * 100
    if (pct > 50) return '#4f4'
    if (pct > 25) return '#fa0'
    return '#f44'
  }

  const hpClass = (hp) => {
    if (!hp) return 'stat-row hp'
    if (hp <= 10) return 'stat-row hp low'
    if (hp <= 25) return 'stat-row hp mid'
    return 'stat-row hp'
  }

  const handleSelectWeapon = async (name) => {
    const updated = await gameApi.selectWeapon(name)
    setGameState(updated)
    setMaxPlayerHp(updated.hp ?? updated.Hp ?? 100)
    setGameStage('ADVENTURE')
    log(`You take up the ${name}.`)
  }

  const handleStartBattle = async () => {
    const res = await gameApi.startBattle()
    setBattle(res)
    setMaxEnemyHp(res.enemyhp ?? res.Enemyhp ?? 20)
    setActivePanel(null)
    log(`A wild ${res.enemyname ?? res.Enemyname} appears!`)
  }

  const processTurnResult = async (res, actionMsg) => {
    setBattle(res)
    log(actionMsg + ' — ' + res.message)

    const enemyHp  = res.enemyhp  ?? res.Enemyhp  ?? 1
    const playerHp = res.playerhp ?? res.Playerhp ?? 1

    if (playerHp <= 0) {
      log('Darkness has consumed you...')
      setTimeout(() => window.location.reload(), 2500)
      return
    }

    if (enemyHp <= 0) {
      log(`${res.enemyname ?? res.Enemyname} has fallen!`)
      const nextDay       = await gameApi.nextDay()
      setDay(nextDay)
      const newCount      = battleCount + 1
      setBattleCount(newCount)
      const updatedPlayer = await gameApi.selectWeapon(gameState.weapon)
      setGameState(updatedPlayer)

      if (gameStage === 'BOSS') {
        setGameStage('END')
        setBattle(null)
      } else if (newCount >= 5) {
        setGameStage('SHOP')
        setBattle(null)
      } else {
        setTimeout(async () => {
          const next = await gameApi.startBattle()
          setBattle(next)
          setCombatLog([`A wild ${next.enemyname ?? next.Enemyname} appears!`])
          setActivePanel(null)
        }, 1500)
      }
    }
  }

  const handleAttack = async () => {
    if (isAttacking) return
    setIsAttacking(true)
    setActivePanel(null)

    try {
      const res = await gameApi.attack()
      const enemyHp  = res.enemyhp  ?? res.Enemyhp  ?? 1
      const playerHp = res.playerhp ?? res.Playerhp ?? 1


      setBattle(res)
      log(res.message)
      await delay(1400)


      if (enemyHp > 0 && res.countermessage) {
        log(res.countermessage)
        await delay(1200)
      }


      if (playerHp <= 0) {
        log('Darkness has consumed you...')
        setTimeout(() => window.location.reload(), 2500)
        return
      }

      if (enemyHp <= 0) {
        log(`${res.enemyname ?? res.Enemyname} has fallen!`)
        const nextDay       = await gameApi.nextDay()
        setDay(nextDay)
        const newCount      = battleCount + 1
        setBattleCount(newCount)
        const updatedPlayer = await gameApi.selectWeapon(gameState.weapon)
        setGameState(updatedPlayer)

        if (gameStage === 'BOSS') {
          setGameStage('END')
          setBattle(null)
        } else if (newCount >= 5) {
          setGameStage('SHOP')
          setBattle(null)
        } else {
          await delay(1000)
          const next = await gameApi.startBattle()
          setBattle(next)
          setMaxEnemyHp(next.enemyhp ?? next.Enemyhp ?? 20)
          setCombatLog([`A wild ${next.enemyname ?? next.Enemyname} appears!`])
          setActivePanel(null)
        }
      }

    } catch (e) {
      console.error('Attack error:', e)
    } finally {
      setIsAttacking(false)
    }
  }

  const handleUseItem = async (itemName) => {
    if (isAttacking) return
    setIsAttacking(true)
    setActivePanel(null)
    try {
      const res = await gameApi.useItem(itemName)
      await processTurnResult(res, `Used ${itemName}`)
      const updatedPlayer = await gameApi.selectWeapon(gameState.weapon)
      setGameState(updatedPlayer)
    } catch (e) {
      console.error(e)
    } finally {
      setIsAttacking(false)
    }
  }

  const togglePanel = (name) => {
    setActivePanel(prev => prev === name ? null : name)
  }

  const playerHp  = battle?.playerhp ?? battle?.Playerhp ?? 0
  const enemyHp   = battle?.enemyhp  ?? battle?.Enemyhp  ?? 0
  const enemyName = battle?.enemyname ?? battle?.Enemyname ?? ''

  return (
    <div className="game-root">

      <div className="header">
        <span>DAY <span style={{ color: '#fa0' }}>{day}</span></span>
        <span>PROGRESS {battleCount}/5</span>
        <span>GOLD <span style={{ color: '#fa0' }}>{gameState?.gold ?? 0}</span></span>
        <span>LV {gameState?.level ?? 1}</span>
      </div>


      {gameStage === 'INTRO' && (
        <IntroScreen onDone={() => setGameStage('SETUP')} />
      )}


      {gameStage === 'SETUP' && !selectedWeapon && (
        <div className="setup-box">
          <p style={{ fontSize: '8px', color: '#888', lineHeight: '2.5', marginBottom: '8px' }}>
            A traveler cannot be safe without a trusty weapon.<br/>Please pick one.
          </p>
          {gameState?.weaponOptions?.map(w => {
            const data = weaponData[w]
            return (
              <div key={w} style={{
                border: '2px solid #555', padding: '14px 20px', width: '100%',
                maxWidth: '340px', textAlign: 'left', cursor: 'pointer',
                transition: 'border-color 0.1s'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#555'}
                onClick={() => setSelectedWeapon(w)}
              >
                <div style={{ fontSize: '10px', color: '#fff', marginBottom: '8px' }}>{w}</div>
                <div style={{ fontSize: '8px', color: '#888', lineHeight: '2' }}>
                  ATK: {data?.atkRange} &nbsp;|&nbsp; CRIT: {data?.crit}
                </div>
              </div>
            )
          })}
        </div>
      )}


      {gameStage === 'SETUP' && selectedWeapon && (
        <div className="setup-box">
          <h2 style={{ fontSize: '10px', letterSpacing: '2px', marginBottom: '4px' }}>
            {selectedWeapon.toUpperCase()}
          </h2>
          <p style={{ fontSize: '8px', color: '#aaa', lineHeight: '2.2', maxWidth: '340px', textAlign: 'center', margin: '10px 0 20px' }}>
            {weaponData[selectedWeapon]?.description}
          </p>
          <div style={{ fontSize: '8px', color: '#888', marginBottom: '20px' }}>
            ATK: {weaponData[selectedWeapon]?.atkRange} &nbsp;|&nbsp; CRIT: {weaponData[selectedWeapon]?.crit}
          </div>
          <p style={{ fontSize: '9px', color: '#ccc', marginBottom: '16px' }}>
            Will you travel with this weapon?
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="weapon-btn" style={{ maxWidth: '140px' }}
              onClick={() => handleSelectWeapon(selectedWeapon)}>
              YES
            </button>
            <button className="weapon-btn" style={{ maxWidth: '140px', borderColor: '#555', color: '#888' }}
              onClick={() => setSelectedWeapon(null)}>
              NO
            </button>
          </div>
        </div>
      )}


      {gameStage === 'ADVENTURE' && !battle && (
        <div className="adventure-box">
          <p style={{ fontSize: '9px', color: '#888' }}>LEVEL {gameState?.level}</p>
          <button className="weapon-btn" style={{ borderColor: '#f44', color: '#f44' }} onClick={handleStartBattle}>
            ENTER THE DUNGEON
          </button>
        </div>
      )}


      {battle && (
        <>
          <div className="battle-area">
            <div className="portrait-box">
              <div className="enemy-name-tag">{enemyName.toUpperCase()}</div>
              <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', maxWidth: '200px', opacity: 0.9 }}>
                <g fill="none" stroke="#fff" strokeWidth="1.5">
                  <ellipse cx="100" cy="50" rx="22" ry="26"/>
                  <line x1="100" y1="76" x2="100" y2="150"/>
                  <line x1="100" y1="95" x2="68" y2="130"/>
                  <line x1="100" y1="95" x2="132" y2="130"/>
                  <line x1="100" y1="150" x2="78" y2="200"/>
                  <line x1="100" y1="150" x2="122" y2="200"/>
                  <ellipse cx="92" cy="46" rx="3" ry="3.5" fill="#fff"/>
                  <ellipse cx="108" cy="46" rx="3" ry="3.5" fill="#fff"/>
                  <path d="M94 58 Q100 63 106 58" strokeWidth="1"/>
                  <rect x="126" y="88" width="4" height="38" rx="2" fill="#fff"/>
                  <polygon points="126,88 130,88 128,72" fill="#fff"/>
                </g>
              </svg>
            </div>

            <div className="stats-box">
              <div style={{ fontSize: '8px', color: '#888', borderBottom: '1px solid #333', paddingBottom: '6px', letterSpacing: '1px' }}>PLAYER</div>
              <div className={hpClass(playerHp)}>
                <span>HP</span><span className="val">{playerHp}</span>
              </div>
              <div className="hp-bar-wrap">
                <div className="hp-bar" style={{
                  width: `${Math.max(0, Math.min(100, (playerHp / maxPlayerHp) * 100))}%`,
                  background: hpBarColor(playerHp, maxPlayerHp)
                }}/>
              </div>
              <div className="stat-row">
                <span>WEAPON</span>
                <span className="val" style={{ fontSize: '7px' }}>{gameState?.weapon ?? '—'}</span>
              </div>
              <div className="stat-row">
                <span>XP</span>
                <span className="val">{gameState?.xpbar ?? 0}/{gameState?.endbar ?? 100}</span>
              </div>
              <div style={{ fontSize: '8px', color: '#888', borderBottom: '1px solid #333', paddingBottom: '6px', marginTop: '4px', letterSpacing: '1px' }}>ENEMY</div>
              <div className="stat-row">
                <span>HP</span><span className="val" style={{ color: '#f66' }}>{enemyHp}</span>
              </div>
              <div className="hp-bar-wrap">
                <div className="hp-bar" style={{
                  width: `${Math.max(0, Math.min(100, (enemyHp / maxEnemyHp) * 100))}%`,
                  background: '#f44'
                }}/>
              </div>
            </div>
          </div>

          <div className="log-box">
            {combatLog.map((line, i) => (
              <div key={i} className={`log-line${i === combatLog.length - 1 ? ' latest' : ''}`}>
                {line}{i === combatLog.length - 1 && <span className="cursor"/>}
              </div>
            ))}
          </div>

          <div className={`panel-overlay${activePanel === 'inspect' ? ' visible' : ''}`}>
            <h3>MONSTER INFO</h3>
            <p>{battle.description ?? battle.enemydescription ?? 'This creature reveals nothing...'}</p>
          </div>

          <div className={`panel-overlay${activePanel === 'stats' ? ' visible' : ''}`}>
            <h3>MY STATS</h3>
            <div className="sub-stat"><span>WEAPON</span><span className="v">{gameState?.weapon ?? '—'}</span></div>
            <div className="sub-stat"><span>LEVEL</span><span className="v">{gameState?.level ?? 1}</span></div>
            <div className="sub-stat"><span>HP</span><span className="v">{playerHp}</span></div>
            <div className="sub-stat"><span>CRIT</span><span className="v">{gameState?.crit ?? 0}%</span></div>
            <div className="sub-stat"><span>SPEED</span><span className="v">{gameState?.speed ?? '—'}</span></div>
            <div className="sub-stat"><span>XP</span><span className="v">{gameState?.xpbar ?? 0}/{gameState?.endbar ?? 100}</span></div>
            <div className="sub-stat"><span>GOLD</span><span className="v">{gameState?.gold ?? 0}</span></div>
          </div>

          <div className={`panel-overlay${activePanel === 'bag' ? ' visible' : ''}`}>
            <h3>BAG <span style={{ fontSize: '7px', color: '#888' }}>(uses your turn)</span></h3>
            {gameState?.backpack && Object.keys(gameState.backpack).length > 0
              ? Object.entries(gameState.backpack).map(([item, qty]) => (
                <div key={item} className="item-row">
                  <span>{item} <span style={{ color: '#888' }}>x{qty}</span></span>
                  <button
                    className="item-use"
                    disabled={qty <= 0 || isAttacking}
                    onClick={() => handleUseItem(item)}
                  >USE</button>
                </div>
              ))
              : <p>Your bag is empty.</p>
            }
          </div>

          <div className="action-bar">
            <button className="act-btn" disabled={isAttacking} onClick={handleAttack}>
              {isAttacking ? '...' : 'ATTACK'}
            </button>
            <button className={`act-btn${activePanel === 'bag' ? ' selected' : ''}`} onClick={() => togglePanel('bag')}>
              BAG
            </button>
            <button className={`act-btn${activePanel === 'inspect' ? ' selected' : ''}`} onClick={() => togglePanel('inspect')}>
              INSPECT
            </button>
            <button className={`act-btn${activePanel === 'stats' ? ' selected' : ''}`} onClick={() => togglePanel('stats')}>
              STATS
            </button>
          </div>
        </>
      )}

      {/* SHOP */}
      {gameStage === 'SHOP' && (
        <div className="shop-box">
          <h2 style={{ fontSize: '10px', letterSpacing: '2px' }}>THE TRAVELER'S SHOP</h2>
          <p style={{ fontSize: '8px', color: '#888', lineHeight: '2' }}>You enter a dusty tavern...</p>
          <button className="weapon-btn" onClick={() => gameApi.selectItem('Health Potion').then(setGameState)}>
            HEALTH POTION (10G)
          </button>
          <button className="weapon-btn" style={{ borderColor: '#a0a', color: '#a0a' }}
            onClick={() => { setGameStage('BOSS'); handleStartBattle() }}>
            FACE THE FINAL BOSS
          </button>
        </div>
      )}

      {/* END */}
      {gameStage === 'END' && (
        <div className="end-box">
          <h1 style={{ fontSize: '14px', color: '#fa0', letterSpacing: '3px', lineHeight: '2' }}>THE CHRONICLE ENDS</h1>
          <p style={{ fontSize: '9px', color: '#888' }}>You survived {day} days and conquered the realm.</p>
          <button className="weapon-btn" onClick={() => window.location.reload()}>RESTART</button>
        </div>
      )}

    </div>
  )
}

export default App

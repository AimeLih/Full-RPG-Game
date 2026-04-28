import { useEffect, useRef, useState } from 'react'
import { gameApi } from './api/gameApi'
import adventureTheme from './assets/8-Bit Video Game Music - 8 Bit Adventure - Royalty Free.mp3'
import victoryTheme from './assets/Free RPG Music - Victory.mp3'
import shopTheme from './assets/8-bit RPG Music  Shop Theme.mp3'
import golemImage from './assets/Golem.png'
import healSound from './assets/Heal Sound Effect.mp3'
import katanaSwingSound from './assets/Katana Swing Cut - Sound Effect for editing.mp3'
import skeletonImage from './assets/Skeleton.png'
import slimeImage from './assets/Slime new.png'
import wolfImage from './assets/Wolf.png'
import zombieImage from './assets/zombie.png'
import './App.css'

const DEFAULT_PLAYER_HP = 100
const DEFAULT_ENEMY_HP = 20
const HEALTH_POTION_COST = 10
const INITIAL_LOG = ['Darkness stirs in the dungeon...']
const OUTCOME_VICTORY = 'VICTORY'
const OUTCOME_DEFEAT = 'DEFEAT'
const LOOP_RESTART_OFFSET_SECONDS = 0.06
const LOOP_EARLY_RESTART_SECONDS = 0.18
const BOOT_TIMEOUT_MS = 20000

const introLines = [
  { text: 'Welcome traveler to the world of Rashinova.', delay: 2500 },
  { text: 'Rashinova used to be a peaceful realm until it fell to the clutches of evil...', delay: 3500 },
  { text: 'Now it is a home for monsters and evil alike.', delay: 2500 },
  { text: '-----------------------------------------', delay: 1500 },
  { text: 'Please take up arms and bring peace back to Rashinova, traveler.', delay: 3000 },
]

const readStoredVolume = () => {
  const raw = window.localStorage.getItem('rashinova-music-volume')
  const parsed = Number.parseFloat(raw ?? '')
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.45
}

const readStoredMute = () => window.localStorage.getItem('rashinova-music-muted') === 'true'

function IntroScreen({ buttonLabel, canBegin, loadingMessage, onDone, onStart }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    let cancelled = false
    setVisibleLines([])
    setFinished(false)
    onStart?.()

    const run = async () => {
      for (const line of introLines) {
        if (cancelled) return
        setVisibleLines(prev => [...prev, line.text])
        await new Promise(resolve => setTimeout(resolve, line.delay))
      }
      if (!cancelled) setFinished(true)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  const skip = () => {
    setVisibleLines(introLines.map(line => line.text))
    setFinished(true)
  }

  return (
    <div className="setup-box intro-box">
      <div className="intro-copy">
        {visibleLines.map((line, index) => (
          <p
            key={index}
            style={{
              fontSize: '9px',
              color: index === visibleLines.length - 1 ? '#fff' : '#777',
              lineHeight: '2.5',
              margin: '4px 0',
              borderLeft: index === visibleLines.length - 1 ? '2px solid #fff' : '2px solid transparent',
              paddingLeft: '10px',
              transition: 'color 0.5s',
            }}
          >
            {line}
            {index === visibleLines.length - 1 && !finished && (
              <span className="cursor" style={{ marginLeft: '4px' }} />
            )}
          </p>
        ))}
      </div>

      {finished && (
        <>
          {!canBegin && (
            <div className="boot-status" aria-live="polite">
              <span className="boot-spinner" aria-hidden="true" />
              <span>{loadingMessage}</span>
            </div>
          )}
          <button
            className="weapon-btn"
            disabled={!canBegin}
            style={{ marginTop: '30px', alignSelf: 'center', opacity: canBegin ? 1 : 0.65 }}
            onClick={onDone}
          >
            {canBegin ? buttonLabel : loadingMessage}
          </button>
        </>
      )}

      {!finished && (
        <button className="skip-btn" onClick={skip}>
          SKIP
        </button>
      )}
    </div>
  )
}

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error('Boot timed out')), ms)
    }),
  ])

function LeaderboardPanel({
  entries,
  error,
  isLoading,
  isSubmitted,
  isSubmitting,
  leaderboardName,
  onNameChange,
  onSubmit,
}) {
  return (
    <div className="leaderboard-panel">
      <h3>LEADERBOARD</h3>
      {error && <p className="panel-error">{error}</p>}

      {!isSubmitted && (
        <div className="leaderboard-submit">
          <input
            className="leaderboard-input"
            maxLength={40}
            placeholder="ENTER NAME"
            value={leaderboardName}
            onChange={(event) => onNameChange(event.target.value)}
          />
          <button className="item-use leaderboard-save" disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? 'SAVING...' : 'SAVE RUN'}
          </button>
        </div>
      )}

      {isLoading ? (
        <p>Loading records...</p>
      ) : entries.length > 0 ? (
        <div className="leaderboard-list">
          {entries.map((entry) => (
            <div key={entry.id} className="leaderboard-row">
              <div className="leaderboard-name">{entry.playerName}</div>
              <div className="leaderboard-meta">LV {entry.level}</div>
              <div className="leaderboard-summary">{entry.summary}</div>
            </div>
          ))}
        </div>
      ) : (
        <p>No legends recorded yet.</p>
      )}
    </div>
  )
}

function App() {
  const [gameState, setGameState] = useState(null)
  const [battle, setBattle] = useState(null)
  const [day, setDay] = useState(1)
  const [battleCount, setBattleCount] = useState(0)
  const [gameStage, setGameStage] = useState('INTRO')
  const [selectedWeapon, setSelectedWeapon] = useState(null)
  const [isSelectingMode, setIsSelectingMode] = useState(false)
  const [isAttacking, setIsAttacking] = useState(false)
  const [isSubmittingWeapon, setIsSubmittingWeapon] = useState(false)
  const [isShopping, setIsShopping] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [activePanel, setActivePanel] = useState(null)
  const [combatLog, setCombatLog] = useState(INITIAL_LOG)
  const [actionError, setActionError] = useState('')
  const [shopError, setShopError] = useState('')
  const [restartError, setRestartError] = useState('')
  const [maxEnemyHp, setMaxEnemyHp] = useState(DEFAULT_ENEMY_HP)
  const [isMuted, setIsMuted] = useState(readStoredMute)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [musicVolume, setMusicVolume] = useState(readStoredVolume)
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const [leaderboardEntries, setLeaderboardEntries] = useState([])
  const [leaderboardError, setLeaderboardError] = useState('')
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [leaderboardName, setLeaderboardName] = useState('')
  const [leaderboardSubmitting, setLeaderboardSubmitting] = useState(false)
  const [leaderboardSubmitted, setLeaderboardSubmitted] = useState(false)
  const [runResult, setRunResult] = useState(null)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [isBootReady, setIsBootReady] = useState(false)
  const [isBeginningJourney, setIsBeginningJourney] = useState(false)
  const [bootError, setBootError] = useState('')
  const [bootNonce, setBootNonce] = useState(0)

  const adventureAudioRef = useRef(null)
  const shopAudioRef = useRef(null)
  const victoryAudioRef = useRef(null)
  const attackAudioRef = useRef(null)
  const healAudioRef = useRef(null)
  const runSessionRef = useRef(0)

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

  const getBattleValue = (state, lowerKey, upperKey, fallback = null) => (
    state?.[lowerKey] ?? state?.[upperKey] ?? fallback
  )

  const hydrateBattle = (state) => ({
    Enemyhp: state.enemyHp,
    Playerhp: state.hp,
    Enemyname: state.enemyName,
    enemydescription: state.enemyDescription,
  })

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
  const log = (msg) => setCombatLog(prev => [...prev.slice(-5), msg])

  const availableWeapons = gameState?.weaponOptions?.length
    ? gameState.weaponOptions
    : Object.keys(weaponData)

  const hpBarColor = (hp, max) => {
    const pct = (hp / Math.max(max, 1)) * 100
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

  const playerHp = getBattleValue(battle, 'playerhp', 'Playerhp', gameState?.hp ?? 0)
  const enemyHp = getBattleValue(battle, 'enemyhp', 'Enemyhp', 0)
  const enemyName = getBattleValue(battle, 'enemyname', 'Enemyname', '')
  const playerLevel = gameState?.level ?? 1
  const playerMaxHp = Math.max(gameState?.maxHp ?? DEFAULT_PLAYER_HP, playerHp)
  const gameMode = gameState?.gameMode ?? 'CLASSIC'
  const progressCount = gameMode === 'ENDLESS' ? battleCount % 5 : battleCount
  const canSubmitLeaderboard = gameMode === 'ENDLESS' && runResult?.outcome === OUTCOME_DEFEAT && (runResult?.day ?? 0) > 20
  const enemyPortraits = {
    Golem: golemImage,
    Skeleton: skeletonImage,
    Slime: slimeImage,
    Wolf: wolfImage,
    Zombie: zombieImage,
  }
  const enemyPortrait = enemyPortraits[enemyName] ?? slimeImage

  const syncGameState = (state) => {
    setGameState(state)
    setDay(state.day ?? 1)
    setBattleCount(state.battleCount ?? 0)
    setActionError('')
    setShopError('')
    setRestartError('')
  }

  const refreshPlayerState = async () => {
    const state = await gameApi.loadGame()
    syncGameState(state)
    return state
  }

  const setBattleScene = (state) => {
    const nextEnemyName = getBattleValue(state, 'enemyname', 'Enemyname', '')
    const nextEnemyHp = getBattleValue(state, 'enemyhp', 'Enemyhp', DEFAULT_ENEMY_HP)
    const currentEnemyName = getBattleValue(battle, 'enemyname', 'Enemyname', '')

    setBattle(state)
    if (!currentEnemyName || currentEnemyName !== nextEnemyName) {
      setMaxEnemyHp(nextEnemyHp)
    }
    setActivePanel(null)
  }

  const withDisplayedPlayerHp = (state, hp) => ({
    ...state,
    Playerhp: hp,
    playerhp: hp,
  })

  const beginNewRunSession = () => {
    runSessionRef.current += 1
    return runSessionRef.current
  }

  const isActiveRunSession = (sessionId) => runSessionRef.current === sessionId

  const getThemeAudioForStage = (stage) => {
    if (stage === 'SHOP') return shopAudioRef.current
    if (stage === 'END') return victoryAudioRef.current
    return adventureAudioRef.current
  }

  const playAudio = async (audio, { restart = false } = {}) => {
    if (!audio || isMuted) {
      return false
    }

    try {
      if (restart) {
        audio.currentTime = 0
      }
      await audio.play()
      return true
    } catch {
      // Autoplay can be blocked until user interaction.
      return false
    }
  }

  const playThemeForStage = async (stage = gameStage) => {
    const activeAudio = getThemeAudioForStage(stage)
    const allThemeAudio = [adventureAudioRef.current, shopAudioRef.current, victoryAudioRef.current]

    allThemeAudio.forEach((audio) => {
      if (audio && audio !== activeAudio) {
        audio.pause()
        audio.currentTime = 0
      }
    })

    return playAudio(activeAudio)
  }

  const attachSmoothLoop = (audio) => {
    if (!audio) return () => {}

    const restartLoop = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        return
      }

      if (audio.currentTime >= audio.duration - LOOP_EARLY_RESTART_SECONDS) {
        audio.currentTime = LOOP_RESTART_OFFSET_SECONDS
        if (!audio.paused) {
          void audio.play().catch(() => {})
        }
      }
    }

    audio.addEventListener('timeupdate', restartLoop)
    audio.addEventListener('ended', restartLoop)

    return () => {
      audio.removeEventListener('timeupdate', restartLoop)
      audio.removeEventListener('ended', restartLoop)
    }
  }

  const playAttackSound = async () => {
    const attackAudio = attackAudioRef.current
    if (!attackAudio || isMuted) {
      return
    }

    try {
      attackAudio.currentTime = 0
      attackAudio.volume = musicVolume
      await attackAudio.play()
    } catch {
      // Sound effects can also be blocked until interaction is established.
    }
  }

  const playHealSound = async () => {
    const healAudio = healAudioRef.current
    if (!healAudio || isMuted) {
      return
    }

    try {
      healAudio.currentTime = 0
      healAudio.volume = musicVolume
      await healAudio.play()
    } catch {
      // Sound effects can also be blocked until interaction is established.
    }
  }

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true)
    setLeaderboardError('')

    try {
      const entries = await gameApi.loadLeaderboard()
      setLeaderboardEntries(entries)
    } catch (error) {
      console.error('Leaderboard load error:', error)
      setLeaderboardError('The leaderboard could not be loaded.')
    } finally {
      setLeaderboardLoading(false)
    }
  }

  const openLeaderboard = async () => {
    setLeaderboardOpen(true)
    await fetchLeaderboard()
  }

  const recordDefeat = (enemy) => {
    setRunResult({
      outcome: OUTCOME_DEFEAT,
      day,
      level: gameState?.level ?? 1,
      enemyName: enemy || 'an unknown foe',
    })
  }

  useEffect(() => {
    const bootGame = async () => {
      setIsBootReady(false)
      setBootError('')

      const initializeFromState = (state) => {
        syncGameState(state)
        setBattle(null)
        setSelectedWeapon(null)
        setActivePanel(null)
        setCombatLog(INITIAL_LOG)
        setRunResult(null)
        setLeaderboardSubmitted(false)
        setLeaderboardOpen(false)
        setLeaderboardName('')
        setGameStage('INTRO')
        setIsBootReady(true)
      }

      try {
        const state = await withTimeout(gameApi.loadGame(), BOOT_TIMEOUT_MS)
        initializeFromState(state)
      } catch {
        try {
          const state = await withTimeout(gameApi.loadGame(), BOOT_TIMEOUT_MS)
          initializeFromState(state)
        } catch (error) {
          console.error('Boot error:', error)
          setBootError('The world is still waking up. Press retry in a moment.')
        }
      }
    }

    bootGame()
  }, [bootNonce])

  const retryBoot = () => {
    setBootNonce(prev => prev + 1)
  }

  useEffect(() => {
    const adventureAudio = new Audio(adventureTheme)
    adventureAudio.preload = 'auto'

    const shopAudio = new Audio(shopTheme)
    shopAudio.preload = 'auto'

    const victoryAudio = new Audio(victoryTheme)
    victoryAudio.preload = 'auto'

    const attackAudio = new Audio(katanaSwingSound)
    attackAudio.preload = 'auto'

    const healAudio = new Audio(healSound)
    healAudio.preload = 'auto'

    adventureAudioRef.current = adventureAudio
    shopAudioRef.current = shopAudio
    victoryAudioRef.current = victoryAudio
    attackAudioRef.current = attackAudio
    healAudioRef.current = healAudio
    const detachAdventureLoop = attachSmoothLoop(adventureAudio)
    const detachShopLoop = attachSmoothLoop(shopAudio)

    return () => {
      detachAdventureLoop()
      detachShopLoop()
      adventureAudio.pause()
      shopAudio.pause()
      victoryAudio.pause()
      attackAudio.pause()
      healAudio.pause()
    }
  }, [])

  useEffect(() => {
    if (adventureAudioRef.current) {
      adventureAudioRef.current.volume = isMuted ? 0 : musicVolume
    }
    if (shopAudioRef.current) {
      shopAudioRef.current.volume = isMuted ? 0 : musicVolume
    }
    if (victoryAudioRef.current) {
      victoryAudioRef.current.volume = isMuted ? 0 : musicVolume
    }
    if (attackAudioRef.current) {
      attackAudioRef.current.volume = isMuted ? 0 : musicVolume
    }
    if (healAudioRef.current) {
      healAudioRef.current.volume = isMuted ? 0 : musicVolume
    }
  }, [isMuted, musicVolume])

  useEffect(() => {
    window.localStorage.setItem('rashinova-music-volume', String(musicVolume))
  }, [musicVolume])

  useEffect(() => {
    window.localStorage.setItem('rashinova-music-muted', String(isMuted))
  }, [isMuted])

  useEffect(() => {
    playThemeForStage()
  }, [gameStage, isMuted, musicVolume])

  useEffect(() => {
    let cancelled = false

    const tryImmediateAudioStart = async () => {
      const started = await playThemeForStage('INTRO')
      if (!cancelled && started) {
        setAudioUnlocked(true)
      }
    }

    tryImmediateAudioStart()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (audioUnlocked || isMuted) {
      return
    }

    const unlockAudio = async () => {
      const started = await playThemeForStage()
      if (started) {
        setAudioUnlocked(true)
      }
    }

    const interactionEvents = ['pointerdown', 'keydown', 'touchstart']
    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, unlockAudio, { passive: true })
    })

    return () => {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, unlockAudio)
      })
    }
  }, [audioUnlocked, gameStage, isMuted, musicVolume])

  const restartRun = async () => {
    if (isRestarting) return

    beginNewRunSession()
    setIsRestarting(true)
    setIsAttacking(false)
    setIsShopping(false)
    setIsSelectingMode(false)
    setIsSubmittingWeapon(false)
    setRestartError('')

    try {
      const state = await gameApi.startGame()
      syncGameState(state)
      setBattle(null)
      setSelectedWeapon(null)
      setActivePanel(null)
      setCombatLog(INITIAL_LOG)
      setMaxEnemyHp(DEFAULT_ENEMY_HP)
      setRunResult(null)
      setLeaderboardSubmitted(false)
      setLeaderboardOpen(false)
      setLeaderboardName('')
      setGameStage('MODE_SELECT')
      await playThemeForStage('ADVENTURE')
    } catch (error) {
      console.error('Restart error:', error)
      setRestartError('The journey could not be restarted. Please try again.')
      setActionError('The game could not be reset. Please try again.')
      setShopError('The game could not be reset. Please try again.')
    } finally {
      setIsRestarting(false)
    }
  }

  const resetGameNow = async () => {
    if (isRestarting) return

    const shouldReset = window.confirm('Reset the entire run and start over from the beginning?')
    if (!shouldReset) return

    await restartRun()
  }

  const beginJourney = async () => {
    if (!isBootReady || isBeginningJourney) {
      return
    }
    setIsBeginningJourney(true)
    setSelectedWeapon(null)
    setActionError('')
    setBootError('')

    try {
      const state = await withTimeout(gameApi.startGame(), BOOT_TIMEOUT_MS)
      syncGameState(state)
      setBattle(null)
      setActivePanel(null)
      setCombatLog(INITIAL_LOG)
      setRunResult(null)
      setLeaderboardSubmitted(false)
      setLeaderboardOpen(false)
      setLeaderboardName('')
      setGameStage('MODE_SELECT')
    } catch (error) {
      console.error('Begin journey error:', error)
      setBootError('The journey could not begin yet. Press retry in a moment.')
    } finally {
      setIsBeginningJourney(false)
    }
  }

  const startIntroTheme = async () => {
    if (gameStage !== 'INTRO') return
    if (shopAudioRef.current) {
      shopAudioRef.current.pause()
    }
    await playAudio(adventureAudioRef.current, { restart: true })
  }

  const handleSelectMode = async (mode) => {
    if (isSelectingMode) return

    setIsSelectingMode(true)
    setActionError('')

    try {
      const updated = await gameApi.selectMode(mode)
      syncGameState(updated)
      setSelectedWeapon(null)
      setGameStage('SETUP')
    } catch (error) {
      console.error('Mode selection error:', error)
      setActionError('That mode could not be selected. Please try again.')
    } finally {
      setIsSelectingMode(false)
    }
  }

  const handleSelectWeapon = async (name) => {
    if (isSubmittingWeapon) return

    setIsSubmittingWeapon(true)
    setActionError('')

    try {
      const updated = await gameApi.selectWeapon(name)
      syncGameState(updated)
      setBattle(null)
      setSelectedWeapon(null)
      setCombatLog(prev => [...prev.slice(-5), `You take up the ${name}.`])
      setGameStage('ADVENTURE')
      await playThemeForStage('ADVENTURE')
    } catch (error) {
      console.error('Weapon selection error:', error)
      setActionError('That weapon could not be equipped. Please try again.')
    } finally {
      setIsSubmittingWeapon(false)
    }
  }

  const handleStartBattle = async () => {
    const res = await gameApi.startBattle()
    setBattleScene(res)
    log(`A wild ${getBattleValue(res, 'enemyname', 'Enemyname', 'enemy')} appears!`)
    await playThemeForStage('ADVENTURE')
  }

  const handleVictory = async (res, sessionId = runSessionRef.current) => {
    log(`${getBattleValue(res, 'enemyname', 'Enemyname', 'enemy')} has fallen!`)
    const nextDay = await gameApi.nextDay()
    if (!isActiveRunSession(sessionId)) return
    setDay(nextDay)
    const updatedPlayer = await refreshPlayerState()
    if (!isActiveRunSession(sessionId)) return
    const newCount = updatedPlayer.battleCount ?? 0

    if (gameMode === 'ENDLESS') {
      if (newCount > 0 && newCount % 5 === 0) {
        setGameStage('SHOP')
        setBattle(null)
      } else {
        setTimeout(async () => {
          if (!isActiveRunSession(sessionId)) return
          const next = await gameApi.startBattle()
          if (!isActiveRunSession(sessionId)) return
          setBattleScene(next)
          setCombatLog([`A wild ${getBattleValue(next, 'enemyname', 'Enemyname', 'enemy')} appears!`])
        }, 1500)
      }
    } else if (gameStage === 'BOSS') {
      setRunResult({
        outcome: OUTCOME_VICTORY,
        day: nextDay,
        level: updatedPlayer.level ?? 1,
        enemyName: null,
      })
      setGameStage('END')
      setBattle(null)
      setLeaderboardSubmitted(false)
    } else if (newCount >= 5) {
      setGameStage('SHOP')
      setBattle(null)
    } else {
      setTimeout(async () => {
        if (!isActiveRunSession(sessionId)) return
        const next = await gameApi.startBattle()
        if (!isActiveRunSession(sessionId)) return
        setBattleScene(next)
        setCombatLog([`A wild ${getBattleValue(next, 'enemyname', 'Enemyname', 'enemy')} appears!`])
      }, 1500)
    }
  }

  const transitionToDefeat = (enemy) => {
    recordDefeat(enemy)
    setTimeout(() => {
      setBattle(null)
      setActivePanel(null)
      setLeaderboardSubmitted(false)
      setGameStage('DEFEAT')
    }, 1200)
  }

  const handleAttack = async () => {
    if (isAttacking) return
    const sessionId = runSessionRef.current
    setIsAttacking(true)
    setActivePanel(null)

    try {
      await playAttackSound()
      const res = await gameApi.attack()
      if (!isActiveRunSession(sessionId)) return
      const playerHpBeforeHit = playerHp
      const battleEnemyName = getBattleValue(res, 'enemyname', 'Enemyname', enemyName || 'enemy')
      const currentPlayerHp = getBattleValue(res, 'playerhp', 'Playerhp', 1)
      const currentEnemyHp = getBattleValue(res, 'enemyhp', 'Enemyhp', 1)

      setBattleScene(withDisplayedPlayerHp(res, playerHpBeforeHit))
      log(res.message)
      await delay(1400)
      if (!isActiveRunSession(sessionId)) return

      if (currentEnemyHp > 0 && res.countermessage) {
        setBattleScene(res)
        await refreshPlayerState()
        if (!isActiveRunSession(sessionId)) return
        log(res.countermessage)
        await delay(1200)
      } else {
        await refreshPlayerState()
        if (!isActiveRunSession(sessionId)) return
      }

      if (currentPlayerHp <= 0) {
        log('Darkness has consumed you...')
        transitionToDefeat(battleEnemyName)
        return
      }

      if (currentEnemyHp <= 0) {
        await handleVictory(res, sessionId)
      }
    } catch (error) {
      console.error('Attack error:', error)
      setActionError('Your attack could not be completed.')
    } finally {
      if (isActiveRunSession(sessionId)) {
        setIsAttacking(false)
      }
    }
  }

  const handleUseItem = async (itemName) => {
    if (isAttacking) return
    const sessionId = runSessionRef.current
    setIsAttacking(true)
    setActivePanel(null)

    try {
      if (itemName === 'Health Potion') {
        await playHealSound()
      }
      const res = await gameApi.useItem(itemName)
      if (!isActiveRunSession(sessionId)) return
      const playerHpBeforeHit = playerHp
      const battleEnemyName = getBattleValue(res, 'enemyname', 'Enemyname', enemyName || 'enemy')
      const currentPlayerHp = getBattleValue(res, 'playerhp', 'Playerhp', 1)
      const currentEnemyHp = getBattleValue(res, 'enemyhp', 'Enemyhp', 1)

      setBattleScene(withDisplayedPlayerHp(res, playerHpBeforeHit))
      log(res.message)
      await delay(1000)
      if (!isActiveRunSession(sessionId)) return

      if (res.countermessage) {
        setBattleScene(res)
        await refreshPlayerState()
        if (!isActiveRunSession(sessionId)) return
        log(res.countermessage)
        await delay(1400)
      } else {
        await refreshPlayerState()
        if (!isActiveRunSession(sessionId)) return
      }

      if (currentPlayerHp <= 0) {
        log('Darkness has consumed you...')
        transitionToDefeat(battleEnemyName)
        return
      }

      if (currentEnemyHp <= 0) {
        await handleVictory(res, sessionId)
      }
    } catch (error) {
      console.error('Item use error:', error)
      setActionError('That item could not be used right now.')
    } finally {
      if (isActiveRunSession(sessionId)) {
        setIsAttacking(false)
      }
    }
  }

  const togglePanel = (name) => {
    setActivePanel(prev => (prev === name ? null : name))
  }

  const buyHealthPotion = async () => {
    if (isShopping) return

    setIsShopping(true)
    setShopError('')

    try {
      const updated = await gameApi.selectItem('Health Potion')
      syncGameState(updated)
      log('You bought a Health Potion.')
      await playThemeForStage('SHOP')
    } catch (error) {
      console.error('Shop purchase error:', error)
      setShopError(error.response?.data?.message ?? 'That purchase could not be completed.')
    } finally {
      setIsShopping(false)
    }
  }

  const startBossBattle = async () => {
    setShopError('')
    setGameStage('BOSS')
    await handleStartBattle()
  }

  const continueEndlessAdventure = async () => {
    setShopError('')
    setGameStage('ADVENTURE')
    await playThemeForStage('ADVENTURE')
  }

  const toggleMute = async () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    if (!nextMuted) {
      const started = await playThemeForStage()
      if (started) {
        setAudioUnlocked(true)
      }
    }
  }

  const handleVolumeChange = async (event) => {
    setMusicVolume(Number(event.target.value) / 100)
    await playThemeForStage()
  }

  const submitLeaderboardEntry = async () => {
    if (!runResult || leaderboardSubmitting || leaderboardSubmitted) return

    setLeaderboardSubmitting(true)
    setLeaderboardError('')

    try {
      await gameApi.submitLeaderboard({
        playerName: leaderboardName,
        level: runResult.level,
        day: runResult.day,
        outcome: runResult.outcome,
        enemyName: runResult.enemyName,
        gameMode,
      })
      setLeaderboardSubmitted(true)
      await fetchLeaderboard()
    } catch (error) {
      console.error('Leaderboard submit error:', error)
      setLeaderboardError(error.response?.data?.message ?? 'This run could not be saved.')
    } finally {
      setLeaderboardSubmitting(false)
    }
  }

  return (
    <div className={`game-root${gameStage === 'SHOP' ? ' shop-mode' : ''}`}>
      <div className="top-controls">
        <button className="mini-btn" onClick={toggleMute}>
          {isMuted ? 'UNMUTE' : 'MUTE'}
        </button>
        <button className="mini-btn" onClick={() => setSettingsOpen(prev => !prev)}>
          SETTINGS
        </button>
      </div>

      {settingsOpen && (
        <div className="settings-panel">
          <div className="settings-row">
            <span>MUSIC</span>
            <span>{Math.round(musicVolume * 100)}%</span>
          </div>
          <input
            className="volume-slider"
            max="100"
            min="0"
            type="range"
            value={Math.round(musicVolume * 100)}
            onChange={handleVolumeChange}
          />
        </div>
      )}

      <div className="header">
        <span>DAY <span style={{ color: '#fa0' }}>{day}</span></span>
        <span>PROGRESS {progressCount}/5</span>
        <span>GOLD <span style={{ color: '#fa0' }}>{gameState?.gold ?? 0}</span></span>
        <span>LV {playerLevel}</span>
      </div>

      {restartError && gameStage !== 'END' && gameStage !== 'DEFEAT' && (
        <p className="panel-error" style={{ marginTop: '12px', textAlign: 'center' }}>
          {restartError}
        </p>
      )}

      {gameStage === 'INTRO' && (
        <>
          {bootError && (
            <p className="panel-error" style={{ marginTop: '12px', textAlign: 'center' }}>
              {bootError}
            </p>
          )}
          <IntroScreen
            buttonLabel={bootError ? 'RETRY WAKE-UP' : 'BEGIN YOUR JOURNEY'}
            canBegin={(isBootReady && !isBeginningJourney) || Boolean(bootError)}
            loadingMessage={isBeginningJourney ? 'BEGINNING JOURNEY...' : 'WAKING THE WORLD...'}
            onDone={bootError ? retryBoot : beginJourney}
            onStart={startIntroTheme}
          />
        </>
      )}

      {gameStage === 'MODE_SELECT' && (
        <div className="setup-box">
          <p style={{ fontSize: '8px', color: '#888', lineHeight: '2.5', marginBottom: '8px' }}>
            Choose how your tale will unfold.
          </p>
          {actionError && <p className="panel-error">{actionError}</p>}
          <div className="weapon-card" onClick={() => handleSelectMode('CLASSIC')}>
            <div style={{ fontSize: '10px', color: '#fff', marginBottom: '8px' }}>CLASSIC MODE</div>
            <div style={{ fontSize: '8px', color: '#888', lineHeight: '2' }}>
              Fight through the dungeon, rest at one shop, then face the final boss.
            </div>
          </div>
          <div className="weapon-card" onClick={() => handleSelectMode('ENDLESS')}>
            <div style={{ fontSize: '10px', color: '#fff', marginBottom: '8px' }}>ENDLESS MODE</div>
            <div style={{ fontSize: '8px', color: '#888', lineHeight: '2' }}>
              Survive forever. A shop appears every 5 days, and your weapon upgrades on days 6 and 16.
            </div>
          </div>
          {isSelectingMode && (
            <p style={{ fontSize: '8px', color: '#aaa' }}>Preparing your path...</p>
          )}
        </div>
      )}

      {gameStage === 'SETUP' && !selectedWeapon && (
        <div className="setup-box">
          <p style={{ fontSize: '8px', color: '#888', lineHeight: '2.5', marginBottom: '8px' }}>
            A traveler cannot be safe without a trusty weapon.<br />Please pick one.
          </p>
          {actionError && <p className="panel-error">{actionError}</p>}
          {availableWeapons.map((weapon) => {
            const data = weaponData[weapon]
            return (
              <div
                key={weapon}
                className="weapon-card"
                onMouseEnter={(event) => { event.currentTarget.style.borderColor = '#fff' }}
                onMouseLeave={(event) => { event.currentTarget.style.borderColor = '#555' }}
                onClick={() => setSelectedWeapon(weapon)}
              >
                <div style={{ fontSize: '10px', color: '#fff', marginBottom: '8px' }}>{weapon}</div>
                <div style={{ fontSize: '8px', color: '#888', lineHeight: '2' }}>
                  ATK: {data?.atkRange} | CRIT: {data?.crit}
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
            ATK: {weaponData[selectedWeapon]?.atkRange} | CRIT: {weaponData[selectedWeapon]?.crit}
          </div>
          <p style={{ fontSize: '9px', color: '#ccc', marginBottom: '16px' }}>
            Will you travel with this weapon?
          </p>
          {actionError && <p className="panel-error">{actionError}</p>}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="weapon-btn" style={{ maxWidth: '140px' }} disabled={isSubmittingWeapon} onClick={() => handleSelectWeapon(selectedWeapon)}>
              {isSubmittingWeapon ? '...' : 'YES'}
            </button>
            <button className="weapon-btn" style={{ maxWidth: '140px', borderColor: '#555', color: '#888' }} disabled={isSubmittingWeapon} onClick={() => setSelectedWeapon(null)}>
              NO
            </button>
          </div>
        </div>
      )}

      {gameStage === 'ADVENTURE' && !battle && (
        <div className="adventure-box">
          <p style={{ fontSize: '9px', color: '#888' }}>LEVEL {playerLevel}</p>
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
              <img alt={enemyName || 'Monster'} className="enemy-portrait" src={enemyPortrait} />
            </div>

            <div className="stats-box">
              <div style={{ fontSize: '8px', color: '#888', borderBottom: '1px solid #333', paddingBottom: '6px', letterSpacing: '1px' }}>PLAYER</div>
              <div className={hpClass(playerHp)}>
                <span>HP</span><span className="val">{playerHp}</span>
              </div>
              <div className="hp-bar-wrap">
                <div
                  className="hp-bar"
                  style={{
                    width: `${Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100))}%`,
                    background: hpBarColor(playerHp, playerMaxHp),
                  }}
                />
              </div>
              <div className="stat-row">
                <span>WEAPON</span>
                <span className="val" style={{ fontSize: '7px' }}>{gameState?.weapon ?? '-'}</span>
              </div>
              <div className="stat-row">
                <span>XP</span>
                <span className="val">{gameState?.xp ?? 0}/{gameState?.xpNeeded ?? 100}</span>
              </div>
              <div style={{ fontSize: '8px', color: '#888', borderBottom: '1px solid #333', paddingBottom: '6px', marginTop: '4px', letterSpacing: '1px' }}>ENEMY</div>
              <div className="stat-row">
                <span>HP</span><span className="val" style={{ color: '#f66' }}>{enemyHp}</span>
              </div>
              <div className="hp-bar-wrap">
                <div
                  className="hp-bar"
                  style={{
                    width: `${Math.max(0, Math.min(100, (enemyHp / Math.max(maxEnemyHp, 1)) * 100))}%`,
                    background: '#f44',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="log-box">
            {combatLog.map((line, index) => (
              <div key={index} className={`log-line${index === combatLog.length - 1 ? ' latest' : ''}`}>
                {line}{index === combatLog.length - 1 && <span className="cursor" />}
              </div>
            ))}
          </div>

          <div className={`panel-overlay${activePanel === 'inspect' ? ' visible' : ''}`}>
            <h3>MONSTER INFO</h3>
            <p>{battle.description ?? battle.enemydescription ?? 'This creature reveals nothing...'}</p>
          </div>

          <div className={`panel-overlay${activePanel === 'stats' ? ' visible' : ''}`}>
            <h3>MY STATS</h3>
            <div className="sub-stat"><span>WEAPON</span><span className="v">{gameState?.weapon ?? '-'}</span></div>
            <div className="sub-stat"><span>LEVEL</span><span className="v">{playerLevel}</span></div>
            <div className="sub-stat"><span>HP</span><span className="v">{playerHp}/{playerMaxHp}</span></div>
            <div className="sub-stat"><span>CRIT</span><span className="v">{gameState?.crit ?? 0}%</span></div>
            <div className="sub-stat"><span>XP</span><span className="v">{gameState?.xp ?? 0}/{gameState?.xpNeeded ?? 100}</span></div>
            <div className="sub-stat"><span>GOLD</span><span className="v">{gameState?.gold ?? 0}</span></div>
          </div>

          <div className={`panel-overlay${activePanel === 'bag' ? ' visible' : ''}`}>
            <h3>BAG <span style={{ fontSize: '7px', color: '#888' }}>(uses your turn)</span></h3>
            {gameState?.backpack && Object.keys(gameState.backpack).length > 0
              ? Object.entries(gameState.backpack).map(([item, qty]) => (
                <div key={item} className="item-row">
                  <span>{item} <span style={{ color: '#888' }}>x{qty}</span></span>
                  <button className="item-use" disabled={qty <= 0 || isAttacking} onClick={() => handleUseItem(item)}>USE</button>
                </div>
              ))
              : <p>Your bag is empty.</p>}
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

      {gameStage === 'SHOP' && (
        <div className="shop-box">
          <h2 style={{ fontSize: '10px', letterSpacing: '2px' }}>THE TRAVELER&apos;S SHOP</h2>
          <p style={{ fontSize: '8px', color: '#888', lineHeight: '2' }}>You enter a dusty tavern...</p>
          {shopError && <p className="panel-error">{shopError}</p>}
          <button className="weapon-btn" disabled={isShopping || (gameState?.gold ?? 0) < HEALTH_POTION_COST} onClick={buyHealthPotion}>
            {isShopping ? 'BUYING...' : `HEALTH POTION (${HEALTH_POTION_COST}G)`}
          </button>
          {gameMode === 'ENDLESS' ? (
            <button className="weapon-btn" style={{ borderColor: '#4aa', color: '#8ff' }} onClick={continueEndlessAdventure}>
              LEAVE SHOP
            </button>
          ) : (
            <button className="weapon-btn" style={{ borderColor: '#a0a', color: '#a0a' }} onClick={startBossBattle}>
              FACE THE FINAL BOSS
            </button>
          )}
        </div>
      )}

      {gameStage === 'END' && (
        <div className="end-box">
          <h1 style={{ fontSize: '14px', color: '#fa0', letterSpacing: '3px', lineHeight: '2' }}>THE CHRONICLE ENDS</h1>
          <p style={{ fontSize: '9px', color: '#888' }}>You survived {day} days and conquered the realm.</p>
          {restartError && <p className="panel-error">{restartError}</p>}
          <div className="end-actions">
            <button className="weapon-btn" disabled={isRestarting} onClick={restartRun}>
              {isRestarting ? 'RESTARTING...' : 'NEW JOURNEY'}
            </button>
          </div>
        </div>
      )}

      {gameStage === 'DEFEAT' && (
        <div className="end-box">
          <h1 style={{ fontSize: '14px', color: '#f44', letterSpacing: '3px', lineHeight: '2' }}>DARKNESS CONSUMES YOU</h1>
          <p style={{ fontSize: '9px', color: '#888' }}>
            Your journey ended on day {runResult?.day ?? day}{runResult?.enemyName ? `, slain by ${runResult.enemyName}.` : '.'}
          </p>
          {restartError && <p className="panel-error">{restartError}</p>}
          <div className="end-actions">
            <button className="weapon-btn" disabled={isRestarting} onClick={restartRun}>
              {isRestarting ? 'RESTARTING...' : 'TRY AGAIN'}
            </button>
            {canSubmitLeaderboard && (
              <button className="weapon-btn alt-btn" onClick={openLeaderboard}>
                LEADERBOARD
              </button>
            )}
          </div>
          {!canSubmitLeaderboard && (
            <p style={{ fontSize: '8px', color: '#888', lineHeight: '2' }}>
              Reach beyond day 20 in endless mode and fall there to earn a leaderboard spot.
            </p>
          )}
          {leaderboardOpen && (
            <LeaderboardPanel
              entries={leaderboardEntries}
              error={leaderboardError}
              isLoading={leaderboardLoading}
              isSubmitted={leaderboardSubmitted}
              isSubmitting={leaderboardSubmitting}
              leaderboardName={leaderboardName}
              onNameChange={setLeaderboardName}
              onSubmit={submitLeaderboardEntry}
            />
          )}
        </div>
      )}

      <button className="mini-btn reset-btn" disabled={isRestarting} onClick={resetGameNow}>
        {isRestarting ? 'RESETTING...' : 'RESET GAME'}
      </button>
    </div>
  )
}

export default App

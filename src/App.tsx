import { useState, useCallback, useMemo } from 'react'
import { Header } from './components/layout/Header'
import { StartScreen } from './components/layout/StartScreen'
import { LevelSelect } from './components/layout/LevelSelect'
import { GameScreen } from './components/layout/GameScreen'
import { PauseOverlay } from './components/layout/PauseOverlay'
import { ResultsScreen } from './components/layout/ResultsScreen'
import { GameCanvas } from './components/game/GameCanvas'
import { ScorePopupOverlay, PenaltyPopup } from './components/game/ScoreDisplay'
import { CatchAnimation } from './components/game/CatchAnimation'
import { Settings } from './components/ui/Settings'
import type { ScorePopup } from './components/game/ScoreDisplay'
import { useGameState } from './hooks/useGameState'
import { useTimer } from './hooks/useTimer'
import { useSettings } from './hooks/useSettings'
import { useLevelProgress } from './hooks/useLevelProgress'
import { calculateFindScore, getEscapePenalty } from './utils/scoring'
import { levels, getNextLevel, isLastLevel } from './data/levels'
import type { Level } from './types/game'

const CASUAL_TIME_BONUS = 30; // Extra seconds in casual mode

interface CatchAnimationData {
  id: string;
  x: number;
  y: number;
}

type Screen = 'start' | 'levelSelect' | 'playing' | 'results';

function App() {
  // Core game state
  const {
    state: game,
    startGame,
    pauseGame,
    resumeGame,
    findFly,
    missClick,
    timeUp,
    addEscapePenalty,
    playAgain,
    resetGame,
  } = useGameState()

  // Settings
  const { settings, updateSetting } = useSettings()

  // Level progress
  const { completeLevel, isLevelUnlocked, getLevelProgress } = useLevelProgress()

  // Screen state (separate from game status for level select)
  const [screen, setScreen] = useState<Screen>('start')

  // UI-only animation state
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([])
  const [penaltyPopups, setPenaltyPopups] = useState<{ id: string; amount: number; x: number; y: number }[]>([])
  const [catchAnimations, setCatchAnimations] = useState<CatchAnimationData[]>([])
  const [showSettings, setShowSettings] = useState(false)

  // Calculate game time based on level and casual mode
  const getGameTime = useCallback((level: Level) => {
    return settings.casualMode ? level.timeLimit + CASUAL_TIME_BONUS : level.timeLimit;
  }, [settings.casualMode]);

  const currentGameTime = game.currentLevel ? getGameTime(game.currentLevel) : 30;

  // Timer
  const { time, isRunning, start: startTimer, pause: pauseTimer, reset: resetTimer } = useTimer({
    initialTime: currentGameTime,
    onTimeUp: timeUp,
  })

  // Clear all animation state
  const clearAnimations = useCallback(() => {
    setScorePopups([])
    setPenaltyPopups([])
    setCatchAnimations([])
  }, [])

  // Navigation
  const handleGoToLevelSelect = useCallback(() => {
    setScreen('levelSelect')
  }, [])

  const handleBackToStart = useCallback(() => {
    setScreen('start')
  }, [])

  // Game actions
  const handleSelectLevel = useCallback((level: Level) => {
    clearAnimations()
    startGame(level)
    const gameTime = getGameTime(level)
    resetTimer(gameTime)
    startTimer()
    setScreen('playing')
  }, [startGame, resetTimer, startTimer, clearAnimations, getGameTime])

  const handlePause = useCallback(() => {
    if (game.status === 'playing') {
      pauseGame()
      pauseTimer()
    } else if (game.status === 'paused') {
      resumeGame()
      startTimer()
    }
  }, [game.status, pauseGame, resumeGame, pauseTimer, startTimer])

  const handlePlayAgain = useCallback(() => {
    clearAnimations()
    playAgain()
    resetTimer(currentGameTime)
    startTimer()
  }, [playAgain, resetTimer, startTimer, clearAnimations, currentGameTime])

  const handleNextLevel = useCallback(() => {
    if (!game.currentLevel) return
    const nextLevel = getNextLevel(game.currentLevel.id)
    if (nextLevel) {
      handleSelectLevel(nextLevel)
    }
  }, [game.currentLevel, handleSelectLevel])

  const handleQuit = useCallback(() => {
    clearAnimations()
    resetGame()
    setScreen('levelSelect')
  }, [resetGame, clearAnimations])

  const handleQuitToStart = useCallback(() => {
    clearAnimations()
    resetGame()
    setScreen('start')
  }, [resetGame, clearAnimations])

  const handleFlyClick = useCallback((flyId: string) => {
    if (game.status !== 'playing') return

    const fly = game.flies.find(f => f.id === flyId)
    if (!fly || fly.found) return

    // Calculate score
    const breakdown = calculateFindScore(time, game.streak + 1)
    findFly(flyId, breakdown)

    // Trigger animations
    setCatchAnimations(prev => [...prev, {
      id: `catch-${flyId}-${Date.now()}`,
      x: fly.x,
      y: fly.y,
    }])

    setScorePopups(prev => [...prev, {
      id: `score-${flyId}-${Date.now()}`,
      breakdown,
      x: fly.x,
      y: fly.y,
      timestamp: Date.now(),
    }])

    // Check if this was the last fly (win condition)
    const remainingFlies = game.flies.filter(f => f.id !== flyId && !f.found)
    if (remainingFlies.length === 0) {
      pauseTimer()
      // Mark level as complete
      if (game.currentLevel) {
        // Calculate final score (current score + this fly's score + potential accuracy bonus)
        const newScore = game.score + breakdown.total
        const accuracyBonus = game.misclicks === 0 ? 50 : 0
        completeLevel(game.currentLevel.id, newScore + accuracyBonus, time)
      }
    }
  }, [game.status, game.flies, game.streak, game.score, game.misclicks, game.currentLevel, time, findFly, pauseTimer, completeLevel])

  const handleMiss = useCallback((x: number, y: number) => {
    if (game.status !== 'playing') return
    console.log(`Miss at: (${x.toFixed(1)}%, ${y.toFixed(1)}%)`)
    missClick()
  }, [game.status, missClick])

  const handleFlyEscapeComplete = useCallback((flyId: string) => {
    const fly = game.flies.find(f => f.id === flyId)
    if (!fly) return

    const penalty = getEscapePenalty()
    addEscapePenalty(penalty)

    setPenaltyPopups(p => [...p, {
      id: `penalty-${flyId}-${Date.now()}`,
      amount: penalty,
      x: fly.x,
      y: fly.y,
    }])
  }, [game.flies, addEscapePenalty])

  // Animation cleanup callbacks
  const handlePopupComplete = useCallback((id: string) => {
    setScorePopups(prev => prev.filter(p => p.id !== id))
  }, [])

  const handlePenaltyComplete = useCallback((id: string) => {
    setPenaltyPopups(prev => prev.filter(p => p.id !== id))
  }, [])

  const handleCatchAnimationComplete = useCallback((id: string) => {
    setCatchAnimations(prev => prev.filter(a => a.id !== id))
  }, [])

  // Derived state
  const foundCount = useMemo(() => game.flies.filter(f => f.found).length, [game.flies])
  const escapedCount = useMemo(() => game.flies.filter(f => f.escaped && !f.found).length, [game.flies])
  const hasNextLevel = game.currentLevel ? !isLastLevel(game.currentLevel.id) : false

  // Determine what to render based on screen and game status
  const renderContent = () => {
    // Start screen
    if (screen === 'start' && game.status === 'idle') {
      return (
        <StartScreen
          onStart={handleGoToLevelSelect}
          onSettings={() => setShowSettings(true)}
        />
      )
    }

    // Level select
    if (screen === 'levelSelect' && game.status === 'idle') {
      return (
        <LevelSelect
          levels={levels}
          isLevelUnlocked={isLevelUnlocked}
          getLevelProgress={getLevelProgress}
          onSelectLevel={handleSelectLevel}
          onBack={handleBackToStart}
        />
      )
    }

    // Playing or Paused
    if (screen === 'playing' && (game.status === 'playing' || game.status === 'paused')) {
      return (
        <GameScreen
          score={game.score}
          streak={game.streak}
          foundCount={foundCount}
          totalFlies={game.flies.length}
          escapedCount={escapedCount}
          misclicks={game.misclicks}
          time={time}
          maxTime={currentGameTime}
          isRunning={isRunning}
          casualMode={settings.casualMode}
          onPause={handlePause}
        >
          <GameCanvas
            imageUrl={game.currentLevel?.imageUrl}
            flies={game.flies}
            onFlyClick={handleFlyClick}
            onMiss={handleMiss}
            onFlyEscapeComplete={handleFlyEscapeComplete}
            escapeDelays={game.escapeDelays}
          >
            <ScorePopupOverlay
              popups={scorePopups}
              onPopupComplete={handlePopupComplete}
            />

            {catchAnimations.map((anim) => (
              <CatchAnimation
                key={anim.id}
                x={anim.x}
                y={anim.y}
                mode={settings.catchAnimation}
                onComplete={() => handleCatchAnimationComplete(anim.id)}
              />
            ))}

            {penaltyPopups.map((popup) => (
              <PenaltyPopup
                key={popup.id}
                amount={popup.amount}
                x={popup.x}
                y={popup.y}
                onComplete={() => handlePenaltyComplete(popup.id)}
              />
            ))}
          </GameCanvas>

          {/* Pause overlay */}
          {game.status === 'paused' && (
            <PauseOverlay
              onResume={handlePause}
              onSettings={() => setShowSettings(true)}
              onQuit={handleQuit}
            />
          )}
        </GameScreen>
      )
    }

    // Results Screen (Won or Lost)
    if (game.status === 'won' || game.status === 'lost') {
      return (
        <ResultsScreen
          won={game.status === 'won'}
          score={game.score}
          flies={game.flies}
          misclicks={game.misclicks}
          timeRemaining={time}
          finalBonus={game.finalBonus}
          hasNextLevel={hasNextLevel}
          onPlayAgain={handlePlayAgain}
          onNextLevel={handleNextLevel}
          onQuit={handleQuit}
        />
      )
    }

    // Fallback to start screen
    return (
      <StartScreen
        onStart={handleGoToLevelSelect}
        onSettings={() => setShowSettings(true)}
      />
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-green-900 to-green-950 text-white flex flex-col">
      <Header />

      {renderContent()}

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Settings
            settings={settings}
            onUpdateSetting={updateSetting}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}
    </div>
  )
}

export default App

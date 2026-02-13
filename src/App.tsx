import { useState, useCallback, useMemo, useEffect } from 'react'
import { Header } from './components/layout/Header'
import { StartScreen } from './components/layout/StartScreen'
import { WorldSelect } from './components/layout/WorldSelect'
import { LevelSelect } from './components/layout/LevelSelect'
import { GameScreen } from './components/layout/GameScreen'
import { PauseOverlay } from './components/layout/PauseOverlay'
import { ResultsScreen } from './components/layout/ResultsScreen'
import { MultiplayerLobby } from './components/layout/MultiplayerLobby'
import { MultiplayerResults } from './components/layout/MultiplayerResults'
import { GameCanvas } from './components/game/GameCanvas'
import { ScorePopupOverlay, PenaltyPopup } from './components/game/ScoreDisplay'
import { CatchAnimation } from './components/game/CatchAnimation'
import { Settings } from './components/ui/Settings'
import type { ScorePopup } from './components/game/ScoreDisplay'
import { useGameState } from './hooks/useGameState'
import { useTimer } from './hooks/useTimer'
import { useSettings } from './hooks/useSettings'
import { useLevelProgress } from './hooks/useLevelProgress'
import { useMultiplayer } from './hooks/useMultiplayer'
import { calculateFindScore, getEscapePenalty } from './utils/scoring'
import { getNextLevel, isLastLevel, getLevelNumber, getLevelsForWorld, regenerateLevelsWithImages, generateEndlessLevel, getLevelById } from './data/levels'
import { worlds, getWorldForLevel } from './data/worlds'
import type { World } from './data/worlds'
import { readFolderImages, revokeLocalFolderImages, clearImageCache } from './services/imageSource'
import { getSocket } from './services/socket'
import type { Level, GameMode } from './types/game'

const CASUAL_TIME_BONUS = 30; // Extra seconds in casual mode

interface CatchAnimationData {
  id: string;
  x: number;
  y: number;
  intensity: number;
}

const ENDLESS_STARTING_LIVES = 3;

type Screen = 'start' | 'worldSelect' | 'levelSelect' | 'playing' | 'multiplayer';

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
  const {
    completeLevel,
    isLevelUnlocked,
    isWorldUnlocked,
    getLevelProgress,
    getWorldProgress,
    getEndlessHighScore,
    getEndlessBestRound,
    saveEndlessHighScore,
  } = useLevelProgress()

  // Screen and navigation state
  const [screen, setScreen] = useState<Screen>('start')
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null)

  // Game mode
  const [gameMode, setGameMode] = useState<GameMode>('campaign')

  // Endless mode state
  const [endlessRound, setEndlessRound] = useState(1)
  const [endlessLives, setEndlessLives] = useState(ENDLESS_STARTING_LIVES)
  const [endlessTotalScore, setEndlessTotalScore] = useState(0)

  // Multiplayer
  const multiplayer = useMultiplayer()

  // UI-only animation state
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([])
  const [penaltyPopups, setPenaltyPopups] = useState<{ id: string; amount: number; x: number; y: number }[]>([])
  const [catchAnimations, setCatchAnimations] = useState<CatchAnimationData[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [localImagesLoaded, setLocalImagesLoaded] = useState(false)

  // Folder picker callbacks for local images
  const handlePickLocalFolder = useCallback(async () => {
    const result = await readFolderImages()
    if (result && result.all.length > 0) {
      console.log(`[Images] Loaded ${result.all.length} local images`)
      regenerateLevelsWithImages(result)
      setLocalImagesLoaded(true)
    }
  }, [])

  const handleClearLocalImages = useCallback(() => {
    revokeLocalFolderImages()
    clearImageCache()
    regenerateLevelsWithImages({ all: [], byTheme: {} })
    setLocalImagesLoaded(false)
  }, [])

  // Multiplayer: auto-start game when server assigns a level
  useEffect(() => {
    if (multiplayer.gameLevel && gameMode === 'multiplayer') {
      const level = getLevelById(`level-${multiplayer.gameLevel}`)
      if (level) {
        clearAnimations()
        startGame(level)
        const gameTime = getGameTime(level)
        resetTimer(gameTime)
        startTimer()
        setScreen('playing')
      }
    }
  }, [multiplayer.gameLevel]) // eslint-disable-line react-hooks/exhaustive-deps

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
  const handleGoToWorldSelect = useCallback(() => {
    setScreen('worldSelect')
  }, [])

  const handleBackToStart = useCallback(() => {
    setScreen('start')
    setSelectedWorld(null)
  }, [])

  const handleSelectWorld = useCallback((world: World) => {
    setSelectedWorld(world)
    setScreen('levelSelect')
  }, [])

  const handleBackToWorldSelect = useCallback(() => {
    setScreen('worldSelect')
    setSelectedWorld(null)
  }, [])

  // Multiplayer navigation
  const handleGoToMultiplayer = useCallback(() => {
    setGameMode('multiplayer')
    setScreen('multiplayer')
  }, [])

  const handleMultiplayerBack = useCallback(() => {
    multiplayer.leaveRoom()
    multiplayer.disconnect()
    setScreen('start')
    setGameMode('campaign')
  }, [multiplayer])

  const handleMultiplayerRematch = useCallback(() => {
    clearAnimations()
    resetGame()
    multiplayer.rematch()
  }, [resetGame, clearAnimations, multiplayer])

  // Endless mode navigation
  const handleStartEndless = useCallback(() => {
    setGameMode('endless')
    setEndlessRound(1)
    setEndlessLives(ENDLESS_STARTING_LIVES)
    setEndlessTotalScore(0)
    const level = generateEndlessLevel(1)
    clearAnimations()
    startGame(level)
    const gameTime = getGameTime(level)
    resetTimer(gameTime)
    startTimer()
    setScreen('playing')
  }, [startGame, resetTimer, startTimer, clearAnimations, getGameTime])

  // Game actions
  const handleSelectLevel = useCallback((level: Level) => {
    setGameMode('campaign')
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
      // Update selected world if we're crossing into a new world
      const nextLevelNum = getLevelNumber(nextLevel.id)
      const nextWorld = getWorldForLevel(nextLevelNum)
      if (nextWorld && nextWorld.id !== selectedWorld?.id) {
        setSelectedWorld(nextWorld)
      }
      handleSelectLevel(nextLevel)
    }
  }, [game.currentLevel, handleSelectLevel, selectedWorld])

  // Endless: continue to next round
  const handleEndlessContinue = useCallback(() => {
    const nextRound = endlessRound + 1
    setEndlessTotalScore(prev => prev + game.score)
    setEndlessRound(nextRound)
    const level = generateEndlessLevel(nextRound)
    clearAnimations()
    startGame(level)
    const gameTime = getGameTime(level)
    resetTimer(gameTime)
    startTimer()
  }, [endlessRound, game.score, startGame, resetTimer, startTimer, clearAnimations, getGameTime])

  // Endless: restart from round 1
  const handleEndlessPlayAgain = useCallback(() => {
    setEndlessRound(1)
    setEndlessLives(ENDLESS_STARTING_LIVES)
    setEndlessTotalScore(0)
    const level = generateEndlessLevel(1)
    clearAnimations()
    startGame(level)
    const gameTime = getGameTime(level)
    resetTimer(gameTime)
    startTimer()
  }, [startGame, resetTimer, startTimer, clearAnimations, getGameTime])

  const handleQuit = useCallback(() => {
    // Save endless high score when quitting mid-run
    if (gameMode === 'endless') {
      const finalScore = endlessTotalScore + game.score
      saveEndlessHighScore(finalScore, endlessRound)
    }
    clearAnimations()
    resetGame()
    if (gameMode === 'endless') {
      setScreen('start')
    } else {
      setScreen('levelSelect')
    }
  }, [resetGame, clearAnimations, gameMode, endlessTotalScore, game.score, endlessRound, saveEndlessHighScore])

  const handleFlyClick = useCallback((flyId: string, intensity: number = 0) => {
    if (game.status !== 'playing') return

    const fly = game.flies.find(f => f.id === flyId)
    if (!fly || fly.found) return

    const effectiveIntensity = settings.powerSlap ? intensity : 0
    const breakdown = calculateFindScore(time, game.streak + 1, effectiveIntensity)
    findFly(flyId, breakdown)

    setCatchAnimations(prev => [...prev, {
      id: `catch-${flyId}-${Date.now()}`,
      x: fly.x,
      y: fly.y,
      intensity: effectiveIntensity,
    }])

    setScorePopups(prev => [...prev, {
      id: `score-${flyId}-${Date.now()}`,
      breakdown,
      x: fly.x,
      y: fly.y,
      timestamp: Date.now(),
    }])

    const remainingFlies = game.flies.filter(f => f.id !== flyId && !f.found)
    const newFoundCount = game.flies.filter(f => f.found).length + 1
    const newScore = game.score + breakdown.total

    // Send multiplayer event
    if (gameMode === 'multiplayer') {
      multiplayer.flyFound(newScore, newFoundCount)
    }

    if (remainingFlies.length === 0) {
      pauseTimer()
      if (game.currentLevel && gameMode === 'campaign') {
        const accuracyBonus = game.misclicks === 0 ? 50 : 0
        completeLevel(game.currentLevel.id, newScore + accuracyBonus, time)
      }
      if (gameMode === 'multiplayer') {
        const accuracyBonus = game.misclicks === 0 ? 50 : 0
        multiplayer.finished(true, newScore + accuracyBonus, newFoundCount, game.misclicks)
      }
    }
  }, [game.status, game.flies, game.streak, game.score, game.misclicks, game.currentLevel, time, findFly, pauseTimer, completeLevel, gameMode, multiplayer, settings.powerSlap])

  const handleMiss = useCallback((x: number, y: number) => {
    if (game.status !== 'playing') return
    console.log(`Miss at: (${x.toFixed(1)}%, ${y.toFixed(1)}%)`)
    missClick()
    if (gameMode === 'multiplayer') {
      multiplayer.miss(game.misclicks + 1)
    }
  }, [game.status, missClick, gameMode, multiplayer, game.misclicks])

  const handleFlyEscapeComplete = useCallback((flyId: string) => {
    const fly = game.flies.find(f => f.id === flyId)
    if (!fly) return

    const penalty = getEscapePenalty()
    addEscapePenalty(penalty)

    // Lose a life in endless mode
    if (gameMode === 'endless') {
      setEndlessLives(prev => prev - 1)
    }

    setPenaltyPopups(p => [...p, {
      id: `penalty-${flyId}-${Date.now()}`,
      amount: penalty,
      x: fly.x,
      y: fly.y,
    }])
  }, [game.flies, addEscapePenalty, gameMode])

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
  const hasNextLevel = game.currentLevel && gameMode === 'campaign' ? !isLastLevel(game.currentLevel.id) : false
  const currentLevelNumber = gameMode === 'endless'
    ? endlessRound
    : (game.currentLevel ? getLevelNumber(game.currentLevel.id) : 0)
  const isEndlessGameOver = gameMode === 'endless' && endlessLives <= 0 && (game.status === 'lost')
  const endlessFinalTotal = endlessTotalScore + game.score

  // Save endless high score when game over
  useEffect(() => {
    if (isEndlessGameOver) {
      saveEndlessHighScore(endlessFinalTotal, endlessRound)
    }
  }, [isEndlessGameOver, endlessFinalTotal, endlessRound, saveEndlessHighScore])

  // Send multiplayer finished event when time runs out
  useEffect(() => {
    if (gameMode === 'multiplayer' && game.status === 'lost') {
      multiplayer.finished(false, game.score, foundCount, game.misclicks)
    }
  }, [game.status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Get levels for selected world
  const worldLevels = useMemo(() => {
    return selectedWorld ? getLevelsForWorld(selectedWorld.id) : []
  }, [selectedWorld])

  // Render content based on screen
  const renderContent = () => {
    // Start screen
    if (screen === 'start' && game.status === 'idle') {
      return (
        <StartScreen
          onStart={handleGoToWorldSelect}
          onEndless={handleStartEndless}
          onMultiplayer={handleGoToMultiplayer}
          onSettings={() => setShowSettings(true)}
          endlessHighScore={getEndlessHighScore()}
          endlessBestRound={getEndlessBestRound()}
        />
      )
    }

    // Multiplayer lobby
    if (screen === 'multiplayer' && game.status === 'idle') {
      // Show multiplayer results if available
      if (multiplayer.gameResults) {
        return (
          <MultiplayerResults
            results={multiplayer.gameResults}
            mySocketId={getSocket()?.id}
            onRematch={handleMultiplayerRematch}
            onQuit={handleMultiplayerBack}
          />
        )
      }

      return (
        <MultiplayerLobby
          isConnected={multiplayer.isConnected}
          roomId={multiplayer.roomId}
          players={multiplayer.players}
          error={multiplayer.error}
          playerLeftMessage={multiplayer.playerLeftMessage}
          onConnect={multiplayer.connect}
          onCreateRoom={multiplayer.createRoom}
          onJoinRoom={multiplayer.joinRoom}
          onToggleReady={multiplayer.toggleReady}
          onLeaveRoom={multiplayer.leaveRoom}
          onBack={handleMultiplayerBack}
          onClearError={multiplayer.clearError}
          onClearPlayerLeft={multiplayer.clearPlayerLeftMessage}
          mySocketId={getSocket()?.id}
        />
      )
    }

    // World select
    if (screen === 'worldSelect' && game.status === 'idle') {
      return (
        <WorldSelect
          worlds={worlds}
          isWorldUnlocked={isWorldUnlocked}
          getWorldProgress={getWorldProgress}
          onSelectWorld={handleSelectWorld}
          onBack={handleBackToStart}
        />
      )
    }

    // Level select (within a world)
    if (screen === 'levelSelect' && game.status === 'idle' && selectedWorld) {
      return (
        <LevelSelect
          world={selectedWorld}
          levels={worldLevels}
          isLevelUnlocked={isLevelUnlocked}
          getLevelProgress={getLevelProgress}
          onSelectLevel={handleSelectLevel}
          onBack={handleBackToWorldSelect}
        />
      )
    }

    // Playing or Paused
    if (screen === 'playing' && (game.status === 'playing' || game.status === 'paused')) {
      return (
        <GameScreen
          levelNumber={currentLevelNumber}
          levelName={game.currentLevel?.name || ''}
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
          isEndless={gameMode === 'endless'}
          lives={endlessLives}
          totalScore={endlessTotalScore}
          isMultiplayer={gameMode === 'multiplayer'}
          opponentName={multiplayer.opponentUpdate?.playerName}
          opponentFoundCount={multiplayer.opponentUpdate?.foundCount}
          opponentFinished={multiplayer.opponentFinished}
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
                intensity={anim.intensity}
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

    // Multiplayer results: show when game results are available
    if (gameMode === 'multiplayer' && (game.status === 'won' || game.status === 'lost')) {
      if (multiplayer.gameResults) {
        return (
          <MultiplayerResults
            results={multiplayer.gameResults}
            mySocketId={getSocket()?.id}
            onRematch={handleMultiplayerRematch}
            onQuit={handleMultiplayerBack}
          />
        )
      }
      // Waiting for opponent to finish
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-gray-800/95 rounded-xl p-8 text-center shadow-2xl border border-gray-700 w-full max-w-md">
            <h3 className={`text-3xl font-bold mb-4 ${game.status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
              {game.status === 'won' ? 'All flies found!' : "Time's Up!"}
            </h3>
            <div className="text-5xl font-bold text-yellow-400 mb-4">
              {game.score.toLocaleString()}
            </div>
            <div className="text-gray-400 animate-pulse">
              Waiting for opponent to finish...
            </div>
          </div>
        </div>
      )
    }

    // Results Screen (campaign/endless)
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
          onPlayAgain={gameMode === 'endless' ? handleEndlessPlayAgain : handlePlayAgain}
          onNextLevel={handleNextLevel}
          onQuit={handleQuit}
          isEndless={gameMode === 'endless'}
          endlessRound={endlessRound}
          endlessTotalScore={endlessFinalTotal}
          endlessLives={endlessLives}
          endlessHighScore={getEndlessHighScore()}
          endlessBestRound={getEndlessBestRound()}
          isGameOver={isEndlessGameOver}
          onContinue={handleEndlessContinue}
        />
      )
    }

    // Fallback
    return (
      <StartScreen
        onStart={handleGoToWorldSelect}
        onEndless={handleStartEndless}
        onMultiplayer={handleGoToMultiplayer}
        onSettings={() => setShowSettings(true)}
        endlessHighScore={getEndlessHighScore()}
        endlessBestRound={getEndlessBestRound()}
      />
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-green-900 to-green-950 text-white flex flex-col">
      <Header />

      {renderContent()}

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Settings
            settings={settings}
            onUpdateSetting={updateSetting}
            onClose={() => setShowSettings(false)}
            onPickLocalFolder={handlePickLocalFolder}
            onClearLocalImages={handleClearLocalImages}
            localImagesLoaded={localImagesLoaded}
          />
        </div>
      )}
    </div>
  )
}

export default App

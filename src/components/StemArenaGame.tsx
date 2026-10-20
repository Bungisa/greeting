import React, { useEffect, useRef, useState } from 'react';

type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

interface StemArenaGameProps {
  onExitGame: () => void;
}

interface Orb {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  value: number;
  isCorrect: boolean;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface MathChallenge {
  prompt: string;
  correctValue: number;
  distractors: number[];
}

const CHALLENGES: MathChallenge[] = [
  { prompt: 'log₁₀(100) + 3 =', correctValue: 5, distractors: [4, 7, 12] },
  { prompt: 'Solve 2x - 4 = 10 → x =', correctValue: 7, distractors: [3, 5, 9] },
  { prompt: 'Determinant of [[4, 1], [2, 3]] =', correctValue: 10, distractors: [6, 14, 8] },
  { prompt: '2 sin(30°) + 8 =', correctValue: 9, distractors: [6, 10, 11] },
  { prompt: '√81 + √16 =', correctValue: 13, distractors: [11, 15, 17] },
  { prompt: 'Gradient through (1,2) & (3,14) =', correctValue: 6, distractors: [4, 8, 12] },
  { prompt: '3² + 4² =', correctValue: 25, distractors: [14, 21, 49] },
  { prompt: 'log₂(32) =', correctValue: 5, distractors: [4, 6, 8] },
  { prompt: 'Solve 5x + 3 = 23 → x =', correctValue: 4, distractors: [3, 5, 6] },
  { prompt: 'Sum of interior angles of triangle ÷ 10 =', correctValue: 18, distractors: [9, 36, 12] },
  { prompt: 'If f(x) = x² - 1, find f(4) =', correctValue: 15, distractors: [17, 12, 8] },
  { prompt: 'LCM of 4 and 6 =', correctValue: 12, distractors: [24, 8, 18] },
  { prompt: '2³ × 3 =', correctValue: 24, distractors: [18, 12, 36] },
  { prompt: 'cos(0°) + tan(45°) =', correctValue: 2, distractors: [1, 0, 3] },
  { prompt: 'Solve x/3 + 2 = 6 → x =', correctValue: 12, distractors: [9, 15, 18] },
  { prompt: 'Area of circle (r=7, π=22/7) ÷ 11 =', correctValue: 14, distractors: [7, 22, 28] },
  { prompt: '7! ÷ 6! =', correctValue: 7, distractors: [6, 42, 1] },
  { prompt: 'Mean of 4, 8, 12, 16 =', correctValue: 10, distractors: [8, 12, 14] },
  { prompt: 'Kinetic Energy (m=2kg, v=4m/s) =', correctValue: 16, distractors: [8, 32, 12] },
  { prompt: 'Ohm’s Law: V = I×R (I=3A, R=7Ω) =', correctValue: 21, distractors: [10, 14, 28] },
];

export const StemArenaGame: React.FC<StemArenaGameProps> = ({ onExitGame }) => {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [score, setScore] = useState<number>(0);
  const [wave, setWave] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [challengeIdx, setChallengeIdx] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const stateRef = useRef<{
    playerX: number;
    playerY: number;
    orbs: Orb[];
    particles: Particle[];
    shake: number;
    score: number;
    wave: number;
    lives: number;
    challengeIdx: number;
  }>({
    playerX: 400,
    playerY: 300,
    orbs: [],
    particles: [],
    shake: 0,
    score: 0,
    wave: 1,
    lives: 3,
    challengeIdx: 0,
  });

  const playTone = (freq: number, duration = 0.12, type: OscillatorType = 'sine') => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtor();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore audio error
    }
  };

  const spawnOrbsForChallenge = (cIdx: number, w: number, h: number) => {
    const ch = CHALLENGES[cIdx % CHALLENGES.length];
    const allValues = [ch.correctValue, ...ch.distractors];
    const colors = ['#10b981', '#38bdf8', '#f59e0b', '#a855f7'];
    stateRef.current.orbs = allValues.map((val, idx) => {
      const angle = (idx / allValues.length) * Math.PI * 2 + 0.4;
      const dist = Math.min(w, h) * 0.32;
      return {
        id: idx + Date.now(),
        x: w * 0.5 + Math.cos(angle) * dist,
        y: h * 0.5 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 2.2,
        vy: (Math.random() - 0.5) * 2.2,
        radius: 28,
        value: val,
        isCorrect: val === ch.correctValue,
        color: colors[idx % colors.length],
      };
    });
  };

  const startNewGame = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    stateRef.current = {
      playerX: w * 0.5,
      playerY: h * 0.5,
      orbs: [],
      particles: [],
      shake: 0,
      score: 0,
      wave: 1,
      lives: 3,
      challengeIdx: 0,
    };
    setScore(0);
    setWave(1);
    setLives(3);
    setChallengeIdx(0);
    spawnOrbsForChallenge(0, w, h);
    playTone(523.25, 0.15, 'triangle');
    setGameState('PLAYING');
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key === 'Escape') {
        setGameState((prev) => (prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev));
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let rafId = 0;
    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const st = stateRef.current;

      ctx.save();
      if (st.shake > 0) {
        ctx.translate((Math.random() - 0.5) * st.shake, (Math.random() - 0.5) * st.shake);
        st.shake *= 0.88;
        if (st.shake < 0.5) st.shake = 0;
      }

      // Deep space arena backdrop
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Subtle coordinate grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (gameState === 'PLAYING') {
        const speed = 5.2;
        if (keysRef.current['arrowleft'] || keysRef.current['a']) st.playerX -= speed;
        if (keysRef.current['arrowright'] || keysRef.current['d']) st.playerX += speed;
        if (keysRef.current['arrowup'] || keysRef.current['w']) st.playerY -= speed;
        if (keysRef.current['arrowdown'] || keysRef.current['s']) st.playerY += speed;

        st.playerX = Math.max(30, Math.min(w - 30, st.playerX));
        st.playerY = Math.max(80, Math.min(h - 30, st.playerY));

        // Update orbs
        for (const orb of st.orbs) {
          orb.x += orb.vx;
          orb.y += orb.vy;
          if (orb.x < orb.radius || orb.x > w - orb.radius) orb.vx *= -1;
          if (orb.y < 90 + orb.radius || orb.y > h - orb.radius) orb.vy *= -1;

          const dx = orb.x - st.playerX;
          const dy = orb.y - st.playerY;
          const dist = Math.hypot(dx, dy);
          if (dist < orb.radius + 20) {
            if (orb.isCorrect) {
              playTone(659.25, 0.16, 'triangle');
              for (let i = 0; i < 18; i++) {
                st.particles.push({
                  x: orb.x,
                  y: orb.y,
                  vx: (Math.random() - 0.5) * 7,
                  vy: (Math.random() - 0.5) * 7,
                  life: 1,
                  maxLife: 28,
                  color: '#10b981',
                  size: 4,
                });
              }
              st.score += 100;
              setScore(st.score);
              if (st.wave >= 20) {
                setGameState('VICTORY');
              } else {
                st.wave += 1;
                st.challengeIdx = (st.challengeIdx + 1) % CHALLENGES.length;
                setWave(st.wave);
                setChallengeIdx(st.challengeIdx);
                spawnOrbsForChallenge(st.challengeIdx, w, h);
              }
              break;
            } else {
              playTone(160, 0.22, 'sawtooth');
              st.shake = 14;
              st.lives -= 1;
              setLives(st.lives);
              orb.x = Math.random() * (w - 160) + 80;
              orb.y = Math.random() * (h - 200) + 120;
              if (st.lives <= 0) {
                setGameState('GAME_OVER');
                break;
              }
            }
          }
        }
      }

      // Draw orbs
      for (const orb of st.orbs) {
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#090d16';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(orb.value), orb.x, orb.y);
      }

      // Draw player ship
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(st.playerX, st.playerY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Update & draw particles
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const p = st.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        if (p.life >= p.maxLife) st.particles.splice(i, 1);
      }

      ctx.restore();
      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [gameState]);

  const activeChallenge = CHALLENGES[challengeIdx % CHALLENGES.length];

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-[#090d16] select-none">
      <canvas
        ref={canvasRef}
        onClick={(e) => {
          if (gameState !== 'PLAYING') return;
          const rect = e.currentTarget.getBoundingClientRect();
          stateRef.current.playerX = e.clientX - rect.left;
          stateRef.current.playerY = e.clientY - rect.top;
        }}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Lightweight Translucent HUD */}
      <div className="fixed top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-xl text-white font-mono text-xs sm:text-sm pointer-events-auto flex items-center gap-4 tabular-nums">
          <span>SCORE: {score}</span>
          <span>WAVE: {wave}/20</span>
          <span>LIVES: {'❤️'.repeat(Math.max(0, lives))}</span>
        </div>

        {gameState === 'PLAYING' && (
          <div className="bg-violet-950/90 backdrop-blur-md border border-violet-500/50 px-5 py-2 rounded-xl text-white font-mono text-sm sm:text-base font-bold">
            SOLVE: {activeChallenge.prompt}
          </div>
        )}

        <div className="flex items-center gap-2 pointer-events-auto">
          {gameState === 'PLAYING' && (
            <button
              onClick={() => setGameState('PAUSED')}
              className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 text-xs font-bold cursor-pointer"
            >
              Pause (ESC)
            </button>
          )}
          <button
            onClick={onExitGame}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
          >
            Exit Arena
          </button>
        </div>
      </div>

      {/* Title Screen / Pause / Victory / Game Over Overlay */}
      {gameState !== 'PLAYING' && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center text-white space-y-4 shadow-2xl">
            <div className="text-xs font-mono text-sky-400 uppercase tracking-widest">
              NECTA STEM QUANTUM ARENA
            </div>
            <h2 className="text-2xl font-black">
              {gameState === 'TITLE_MENU' && 'STEM Formula Interceptor'}
              {gameState === 'PAUSED' && 'Game Paused'}
              {gameState === 'VICTORY' && '🏆 Arena Mastered!'}
              {gameState === 'GAME_OVER' && 'Mission Complete'}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use <strong>WASD / Arrow Keys</strong> or <strong>Click/Tap</strong> to pilot your interceptor into the orb matching the correct mathematical solution.
            </p>
            {gameState !== 'TITLE_MENU' && (
              <div className="p-3 rounded-xl bg-slate-800 font-mono text-sm tabular-nums">
                Final Score: <strong>{score}</strong> · Wave: <strong>{wave}/20</strong>
              </div>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              {gameState === 'PAUSED' ? (
                <button
                  onClick={() => setGameState('PLAYING')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm cursor-pointer"
                >
                  Resume Game
                </button>
              ) : null}
              <button
                onClick={startNewGame}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm cursor-pointer"
              >
                {gameState === 'TITLE_MENU' ? 'Start Mission' : 'Play Again'}
              </button>
              <button
                onClick={onExitGame}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm cursor-pointer"
              >
                Return to App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

class CatchSoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicPlaying = false;
    this.musicTimeout = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playCatch() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playHurt() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const playNote = (freq, start, duration) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.08, now + start);
      gain.gain.exponentialRampToValueAtTime(0.01, now + start + duration);
      osc.start(now + start);
      osc.stop(now + start + duration);
    };

    playNote(440.00, 0, 0.15); // A4
    playNote(554.37, 0.15, 0.15); // C#5
    playNote(659.25, 0.3, 0.15); // E5
    playNote(880.00, 0.45, 0.45); // A5
  }

  startMusic() {
    if (this.muted) return;
    this.init();
    if (this.musicPlaying) return;
    this.musicPlaying = true;

    const beat = 0.22;
    const melody = [
      [293.66, beat], [329.63, beat], [349.23, beat], [392.00, beat],
      [440.00, beat], [392.00, beat], [440.00, beat], [523.25, beat],
      [587.33, beat], [523.25, beat], [587.33, beat], [659.25, beat],
      [698.46, beat], [659.25, beat], [587.33, beat], [523.25, beat]
    ];

    let currentNoteIndex = 0;

    const playNext = () => {
      if (!this.musicPlaying || this.muted) return;

      const [freq, duration] = melody[currentNoteIndex];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration - 0.02);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);

      currentNoteIndex = (currentNoteIndex + 1) % melody.length;
      this.musicTimeout = setTimeout(playNext, duration * 1000);
    };

    playNext();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }
}

const sounds = new CatchSoundEffects();

export default function CatchGame({ heroName, heroFace, onVictory, onExit, activeControls }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const scoreRef = useRef(score);
  const timeLeftRef = useRef(timeLeft);
  const activeControlsRef = useRef(activeControls);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    activeControlsRef.current = activeControls;
  }, [activeControls]);

  const heroImageObj = useRef(null);

  useEffect(() => {
    if (heroFace) {
      const img = new Image();
      img.src = heroFace;
      heroImageObj.current = img;
    }
  }, [heroFace]);

  // Audio control
  useEffect(() => {
    if (isPlaying && !isMuted && !isGameOver) {
      sounds.startMusic();
    } else {
      sounds.stopMusic();
    }
    return () => sounds.stopMusic();
  }, [isPlaying, isMuted, isGameOver]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    sounds.muted = nextMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      sounds.stopMusic();
    } else if (isPlaying && !isGameOver) {
      sounds.startMusic();
    }
  };

  // Teclado
  const keys = useRef({ ArrowLeft: false, ArrowRight: false });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.ArrowLeft = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.ArrowRight = true;
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.ArrowLeft = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.ArrowRight = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Timer
  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    if (timeLeft <= 0) {
      sounds.playVictory();
      setIsPlaying(false);
      setIsGameOver(true);
      onVictory(score);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, isGameOver]);

  // Loop del juego
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const cw = 450;
    const ch = 600;
    canvas.width = cw;
    canvas.height = ch;

    // Configuración del jugador
    const player = {
      x: cw / 2 - 15,
      y: ch - 75,
      width: 32,
      height: 44,
      speed: 4.5,
      walkFrame: 0,
      facing: 'right'
    };

    let items = [];
    let particles = [];
    let spawnTimer = 0;

    const createItem = () => {
      const isBad = Math.random() < 0.28; // 28% de probabilidad de ser bomba/barril
      const randomValue = Math.random();
      let type = 'apple';
      let points = 100;
      let color = '#ef4444';

      if (!isBad) {
        if (randomValue < 0.4) {
          type = 'apple';
          points = 100;
          color = '#ef4444';
        } else if (randomValue < 0.7) {
          type = 'banana';
          points = 150;
          color = '#eab308';
        } else if (randomValue < 0.9) {
          type = 'cherry';
          points = 200;
          color = '#ec4899';
        } else {
          type = 'star';
          points = 300;
          color = '#fbbf24';
        }
      } else {
        type = Math.random() < 0.5 ? 'bomb' : 'barrel';
        points = 0;
        color = '#374151';
      }

      items.push({
        x: Math.random() * (cw - 30) + 15,
        y: -20,
        radius: 12,
        speed: Math.random() * 1.5 + 2.0 + (scoreRef.current / 2500),
        isBad,
        type,
        points,
        color,
        angle: 0,
        rotSpeed: (Math.random() - 0.5) * 0.1
      });
    };

    const spawnParticles = (x, y, color) => {
      for (let i = 0; i < 8; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 1,
          radius: Math.random() * 3 + 1,
          color,
          alpha: 1,
          life: 20 + Math.random() * 10
        });
      }
    };

    let animId;

    const loop = () => {
      // 1. Spawning
      spawnTimer--;
      if (spawnTimer <= 0) {
        createItem();
        spawnTimer = Math.max(30 - Math.floor(scoreRef.current / 400), 12);
      }

      // 2. Mover Jugador
      const moveLeft = keys.current.ArrowLeft || activeControlsRef.current.left;
      const moveRight = keys.current.ArrowRight || activeControlsRef.current.right;

      if (moveLeft) {
        player.x -= player.speed;
        player.facing = 'left';
        player.walkFrame += 0.2;
      }
      if (moveRight) {
        player.x += player.speed;
        player.facing = 'right';
        player.walkFrame += 0.2;
      }

      if (player.x < 0) player.x = 0;
      if (player.x + player.width > cw) player.x = cw - player.width;

      // 3. Mover items y colisión
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += item.speed;
        item.angle += item.rotSpeed;

        // Fuera de pantalla abajo
        if (item.y > ch + 20) {
          items.splice(i, 1);
          continue;
        }

        // Colisión con jugador
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;
        const dist = Math.sqrt(Math.pow(px - item.x, 2) + Math.pow(py - item.y, 2));

        if (dist < item.radius + 18) {
          // Captura!
          if (item.isBad) {
            sounds.playHurt();
            spawnParticles(item.x, item.y, '#ef4444');
            setLives((prev) => {
              const next = prev - 1;
              if (next <= 0) {
                setIsPlaying(false);
                setIsGameOver(true);
              }
              return next;
            });
          } else {
            sounds.playCatch();
            spawnParticles(item.x, item.y, item.color);
            setScore((prev) => prev + item.points);
          }
          items.splice(i, 1);
        }
      }

      // 4. Mover partículas
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.05;
        p.life--;
        if (p.life <= 0 || p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      // --- DIBUJO ---
      ctx.clearRect(0, 0, cw, ch);

      // Fondo neón
      ctx.fillStyle = '#0f0c1b';
      ctx.fillRect(0, 0, cw, ch);

      // Rejilla
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < cw; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ch);
        ctx.stroke();
      }
      for (let y = 0; y < ch; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cw, y);
        ctx.stroke();
      }

      // Dibujar Items
      items.forEach((item) => {
        ctx.save();
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 6;
        ctx.translate(item.x, item.y);
        ctx.rotate(item.angle);

        if (item.type === 'apple') {
          // Manzana roja
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();
          // Ramita
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -9);
          ctx.lineTo(2, -13);
          ctx.stroke();
        } else if (item.type === 'banana') {
          // Plátano
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.ellipse(0, 0, 9, 5, 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'cherry') {
          // Cerezas
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.arc(-4, 2, 6, 0, Math.PI * 2);
          ctx.arc(4, 2, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-4, -4); ctx.lineTo(0, -9);
          ctx.moveTo(4, -4); ctx.lineTo(0, -9);
          ctx.stroke();
        } else if (item.type === 'star') {
          // Estrella dorada
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'bomb') {
          // Bomba
          ctx.fillStyle = '#111827';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.stroke();
          // Chispa
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(4, -14, 4, 4);
        } else if (item.type === 'barrel') {
          // Barril
          ctx.fillStyle = '#d97706';
          ctx.fillRect(-8, -10, 16, 20);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-8, -10, 16, 3);
          ctx.fillRect(-8, 7, 16, 3);
        }

        ctx.restore();
      });

      // Dibujar Partículas
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Dibujar Jugador
      ctx.save();
      ctx.translate(player.x, player.y);

      // Movimiento vertical
      let bob = 0;
      if (moveLeft || moveRight) {
        bob = Math.abs(Math.sin(player.walkFrame) * 3);
      }

      // Cuerpo
      ctx.fillStyle = heroName === 'Dante' ? '#e11d48' : '#db2777';
      ctx.fillRect(4, 20 + bob, 24, 24); // Overol
      
      // Camisa/Mangas
      ctx.fillStyle = heroName === 'Dante' ? '#3b82f6' : '#fbcfe8';
      ctx.fillRect(0, 20 + bob, 4, 10);
      ctx.fillRect(28, 20 + bob, 4, 10);

      // Pies
      ctx.fillStyle = '#000';
      ctx.fillRect(4, 42, 8, 3);
      ctx.fillRect(20, 42, 8, 3);

      // Rostro
      if (heroImageObj.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(16, 10 + bob, 14, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(heroImageObj.current, 2, -4 + bob, 28, 28);
        ctx.restore();

        // Gorro/Corona
        ctx.fillStyle = heroName === 'Dante' ? '#e11d48' : '#f472b6';
        if (heroName === 'Dante') {
          ctx.beginPath();
          ctx.arc(16, -1 + bob, 9, Math.PI, 0);
          ctx.fill();
          ctx.fillRect(10, -3 + bob, 15, 3);
        } else {
          ctx.beginPath();
          ctx.moveTo(8, 2 + bob);
          ctx.lineTo(11, -4 + bob);
          ctx.lineTo(16, 0 + bob);
          ctx.lineTo(21, -4 + bob);
          ctx.lineTo(24, 2 + bob);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#ffd1a9';
        ctx.beginPath();
        ctx.arc(16, 10 + bob, 12, 0, Math.PI * 2);
        ctx.fill();

        // Cabello
        ctx.fillStyle = heroName === 'Dante' ? '#78350f' : '#d97706';
        ctx.beginPath();
        ctx.arc(16, 5 + bob, 9, Math.PI, 0);
        ctx.fill();

        // Ojos
        ctx.fillStyle = '#000';
        ctx.fillRect(12, 8 + bob, 2, 3);
        ctx.fillRect(18, 8 + bob, 2, 3);

        // Sonrisa
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(16, 12 + bob, 3, 0, Math.PI);
        ctx.stroke();
      }

      ctx.restore();

      // Dibujar HUD de canvas
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(`TIEMPO: ${timeLeftRef.current}s`, 15, 30);
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, heroName]);

  const startNewGame = () => {
    sounds.init();
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* HUD React */}
      <div style={{
        width: '100%',
        maxWidth: '450px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 5px',
        marginBottom: '8px'
      }}>
        <button 
          onClick={onExit}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '50px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-modern)',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <ArrowLeft size={16} /> Salir
        </button>

        <button
          onClick={toggleMute}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.85rem'
          }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {isMuted ? 'MUTE ON' : 'MUTE OFF'}
        </button>
      </div>

      {/* Marcador */}
      <div style={{
        width: '100%',
        maxWidth: '450px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px',
        background: 'rgba(15, 12, 27, 0.8)',
        border: '1px solid var(--glass-border)',
        borderBottom: 'none',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        fontSize: '0.8rem',
        fontFamily: 'var(--font-retro)',
        color: '#fff'
      }}>
        <div>PUNTOS: <span style={{ color: 'hsl(var(--warning))' }}>{score}</span></div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} style={{
              color: i < lives ? '#ef4444' : '#374151',
              fontSize: '1.2rem',
              transition: 'color 0.3s ease'
            }}>
              ♥
            </span>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '450px',
        aspectRatio: '3 / 4',
        background: '#0b0818',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(168, 85, 247, 0.2)',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
        border: '2px solid rgba(236, 72, 153, 0.4)',
        overflow: 'hidden'
      }}>
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            background: '#0b0818'
          }}
        />

        {/* Overlays */}
        {(!isPlaying || isGameOver) && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(15, 12, 27, 0.88)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h2 className="retro-title" style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#fff' }}>
              {isGameOver 
                ? (lives <= 0 ? 'FIN DEL JUEGO' : '¡COMPLETADO!') 
                : 'ATRAPA LA FRUTA'
              }
            </h2>
            <p className="modern-subtitle" style={{ fontSize: '0.9rem', marginBottom: '30px', maxWidth: '300px' }}>
              {isGameOver 
                ? (lives <= 0 
                    ? `¡Fuiste golpeado por una bomba! Lograste conseguir ${score} puntos.` 
                    : `¡Se acabó el tiempo! Lograste una puntuación final de ${score} puntos.`
                  ) 
                : `Mueve a ${heroName} usando las flechas del teclado o los controles táctiles para atrapar la fruta cayendo y esquivar las bombas.`
              }
            </p>
            <button onClick={startNewGame} className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.2rem', background: 'linear-gradient(135deg, #db2777, #ec4899)' }}>
              {isGameOver ? <RotateCcw size={20} /> : <Play size={20} />}
              {isGameOver ? 'REINICIAR' : '¡JUGAR AHORA!'}
            </button>
            <div style={{ marginTop: '20px', fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'var(--font-retro)' }}>
              PC: Flechas Izq/Der o A/D para moverte
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

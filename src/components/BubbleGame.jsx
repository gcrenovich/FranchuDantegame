import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

class BubbleSoundEffects {
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

  playPop() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playHurt() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
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

    playNote(523.25, 0, 0.12);     // C5
    playNote(659.25, 0.12, 0.12);  // E5
    playNote(783.99, 0.24, 0.12);  // G5
    playNote(1046.50, 0.36, 0.3);  // C6
  }

  startMusic() {
    if (this.muted) return;
    this.init();
    if (this.musicPlaying) return;
    this.musicPlaying = true;

    const beat = 0.2;
    const melody = [
      [329.63, beat], [392.00, beat], [523.25, beat], [659.25, beat],
      [523.25, beat], [659.25, beat], [392.00, beat], [329.63, beat],
      [293.66, beat], [349.23, beat], [440.00, beat], [587.33, beat],
      [440.00, beat], [587.33, beat], [349.23, beat], [293.66, beat]
    ];

    let currentNoteIndex = 0;

    const playNext = () => {
      if (!this.musicPlaying || this.muted) return;

      const [freq, duration] = melody[currentNoteIndex];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
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

const sounds = new BubbleSoundEffects();

export default function BubbleGame({ heroName, faces, onVictory, onExit }) {
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

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Imágenes cargadas
  const danteImageObj = useRef(null);
  const francescaImageObj = useRef(null);

  useEffect(() => {
    if (faces.dante) {
      const img = new Image();
      img.src = faces.dante;
      danteImageObj.current = img;
    }
    if (faces.francesca) {
      const img = new Image();
      img.src = faces.francesca;
      francescaImageObj.current = img;
    }
  }, [faces]);

  // Música
  useEffect(() => {
    if (isPlaying && !isMuted && !isGameOver) {
      sounds.startMusic();
    } else {
      sounds.stopMusic();
    }
    return () => {
      sounds.stopMusic();
    };
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

  // Temporizador de Cuenta Regresiva
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

    let bubbles = [];
    let particles = [];
    let spawnTimer = 0;

    // Crear burbuja
    const createBubble = () => {
      const isBad = Math.random() < 0.25; // 25% de probabilidad de ser espinosa
      const type = Math.random() < 0.5 ? 'dante' : 'francesca';
      const radius = Math.random() * 8 + 32; // Radio entre 32 y 40
      
      bubbles.push({
        x: Math.random() * (cw - radius * 2) + radius,
        y: ch + radius,
        radius,
        speed: Math.random() * 1.5 + 1.2 + (scoreRef.current / 2000), // Más velocidad según sube puntaje
        vx: 0,
        waveFrequency: Math.random() * 0.03 + 0.01,
        waveAmplitude: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
        isBad,
        type,
        popState: 0 // 0 = normal, >0 = explotando
      });
    };

    // Crear partículas
    const spawnPopParticles = (x, y, color) => {
      for (let i = 0; i < 12; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          radius: Math.random() * 3 + 1,
          color,
          alpha: 1,
          life: 20 + Math.random() * 15
        });
      }
    };

    let animId;

    const loop = () => {
      // 1. Spawning
      spawnTimer--;
      if (spawnTimer <= 0) {
        createBubble();
        spawnTimer = Math.max(25 - Math.floor(scoreRef.current / 500), 10); // Spawning más rápido
      }

      // 2. Actualizar burbujas
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.speed;
        b.phase += b.waveFrequency;
        b.x += Math.sin(b.phase) * b.waveAmplitude;

        // Limitar bordes
        if (b.x - b.radius < 0) b.x = b.radius;
        if (b.x + b.radius > cw) b.x = cw - b.radius;

        // Fuera de pantalla arriba
        if (b.y < -b.radius) {
          // Si dejamos pasar una buena burbuja, perdemos puntos (o nada, para que sea apto para niños)
          // No restamos vidas para que no sea frustrante, solo si tocan las malas.
          bubbles.splice(i, 1);
          continue;
        }
      }

      // 3. Actualizar partículas
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.04;
        p.life--;
        if (p.life <= 0 || p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      // --- DIBUJADO ---
      ctx.clearRect(0, 0, cw, ch);

      // Fondo oscuro neón
      ctx.fillStyle = '#0a0d1e';
      ctx.fillRect(0, 0, cw, ch);

      // Rejilla de burbujas decorativa sutil
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < cw; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ch);
        ctx.stroke();
      }
      for (let y = 0; y < ch; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cw, y);
        ctx.stroke();
      }

      // Dibujar burbujas
      bubbles.forEach((b) => {
        ctx.save();
        ctx.shadowColor = b.isBad ? '#f87171' : '#06b6d4';
        ctx.shadowBlur = 8;

        // Dibujar el círculo de la burbuja
        ctx.strokeStyle = b.isBad ? 'rgba(248, 113, 113, 0.8)' : 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Relleno sutil translúcido
        ctx.fillStyle = b.isBad ? 'rgba(248, 113, 113, 0.15)' : 'rgba(6, 182, 212, 0.15)';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Brillo blanco en la burbuja
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Dibujar imagen o elemento interior
        if (b.isBad) {
          // Dibujar "Pico/Bomba"
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
          // Pinchos
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            ctx.lineTo(b.x + Math.cos(angle) * b.radius * 0.8, b.y + Math.sin(angle) * b.radius * 0.8);
            ctx.stroke();
          }
          // Calavera o exclamación simple
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚡', b.x, b.y);
        } else {
          // Rostro del niño
          const imgObj = b.type === 'dante' ? danteImageObj.current : francescaImageObj.current;
          if (imgObj) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius - 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(imgObj, b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2);
            ctx.restore();
          } else {
            // Círculo de color si no hay imagen
            ctx.fillStyle = b.type === 'dante' ? '#3b82f6' : '#ec4899';
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius - 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Cara sonriente dentro de la burbuja
            ctx.fillStyle = '#ffd1a9';
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius - 8, 0, Math.PI * 2);
            ctx.fill();

            // Cabello
            ctx.fillStyle = b.type === 'dante' ? '#78350f' : '#d97706';
            ctx.beginPath();
            ctx.arc(b.x, b.y - 3, b.radius - 12, Math.PI, 0);
            ctx.fill();

            // Ojos
            ctx.fillStyle = '#000';
            ctx.fillRect(b.x - 4, b.y - 1, 2, 3);
            ctx.fillRect(b.x + 2, b.y - 1, 2, 3);

            // Sonrisa
            ctx.strokeStyle = '#e11d48';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(b.x, b.y + 2, 2.5, 0, Math.PI);
            ctx.stroke();
          }
        }

        ctx.restore();
      });

      // Dibujar partículas
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Dibujar el puntaje flotante en HUD de canvas
      ctx.save();
      ctx.fillStyle = '#06b6d4';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText(`TIEMPO: ${timeLeftRef.current}s`, 15, 30);
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // Evento de clic en canvas
    const handleCanvasInteraction = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = ((clientX - rect.left) / rect.width) * cw;
      const clickY = ((clientY - rect.top) / rect.height) * ch;

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        const dist = Math.sqrt(Math.pow(clickX - b.x, 2) + Math.pow(clickY - b.y, 2));

        if (dist < b.radius + 8) {
          // Tocó!
          if (b.isBad) {
            sounds.playHurt();
            spawnPopParticles(b.x, b.y, '#ef4444');
            setLives((prev) => {
              const next = prev - 1;
              if (next <= 0) {
                setIsPlaying(false);
                setIsGameOver(true);
              }
              return next;
            });
          } else {
            sounds.playPop();
            spawnPopParticles(b.x, b.y, b.type === 'dante' ? '#60a5fa' : '#f472b6');
            setScore((prev) => prev + 50);
          }
          bubbles.splice(i, 1);
          break; // Solo reventar una burbuja a la vez
        }
      }
    };

    const handleMouseDown = (e) => {
      handleCanvasInteraction(e.clientX, e.clientY);
    };

    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleTouchStart);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isPlaying, isGameOver]);

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
        border: '2px solid rgba(6, 182, 212, 0.4)',
        overflow: 'hidden'
      }}>
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            background: '#0b0818',
            cursor: 'crosshair'
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
                : 'BURBUJAS FLOTANTES'
              }
            </h2>
            <p className="modern-subtitle" style={{ fontSize: '0.9rem', marginBottom: '30px', maxWidth: '300px' }}>
              {isGameOver 
                ? (lives <= 0 
                    ? `¡Explotaste una burbuja eléctrica! Lograste conseguir ${score} puntos.` 
                    : `¡Se acabó el tiempo! Lograste una puntuación final de ${score} puntos.`
                  ) 
                : 'Revienta las burbujas que tienen los rostros de Dante y Francesca. ¡Evita las burbujas rojas con electricidad!'
              }
            </p>
            <button onClick={startNewGame} className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.2rem', background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
              {isGameOver ? <RotateCcw size={20} /> : <Play size={20} />}
              {isGameOver ? 'REINICIAR' : '¡JUGAR AHORA!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

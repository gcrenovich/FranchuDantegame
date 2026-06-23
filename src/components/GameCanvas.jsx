import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

// --- EFECTOS DE SONIDO MEDIANTE WEB AUDIO API ---
class RetroSoundEffects {
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

  playJump() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playCoin() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    // Nota corta alta clásica
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  playHit() {
    if (this.muted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
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
      gain.gain.setValueAtTime(0.1, now + start);
      gain.gain.exponentialRampToValueAtTime(0.01, now + start + duration);
      osc.start(now + start);
      osc.stop(now + start + duration);
    };

    // Arpegio triunfal
    playNote(523.25, 0, 0.15);     // C5
    playNote(659.25, 0.15, 0.15);  // E5
    playNote(783.99, 0.3, 0.15);   // G5
    playNote(1046.50, 0.45, 0.4);  // C6
  }

  startMusic() {
    if (this.muted) return;
    this.init();
    if (this.musicPlaying) return;
    this.musicPlaying = true;

    const beat = 0.24;
    const melody = [
      [261.63, beat], [329.63, beat], [392.00, beat], [523.25, beat],
      [392.00, beat], [523.25, beat], [329.63, beat], [392.00, beat],
      [293.66, beat], [349.23, beat], [440.00, beat], [587.33, beat],
      [440.00, beat], [587.33, beat], [349.23, beat], [440.00, beat],
      [329.63, beat], [392.00, beat], [493.88, beat], [659.25, beat],
      [493.88, beat], [659.25, beat], [392.00, beat], [493.88, beat],
      [349.23, beat], [440.00, beat], [523.25, beat], [698.46, beat],
      [523.25, beat], [698.46, beat], [440.00, beat], [349.23, beat]
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
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
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

const sounds = new RetroSoundEffects();

export default function GameCanvas({ heroName, heroFace, siblingFace, onVictory, activeControls }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const scoreRef = useRef(score);
  const activeControlsRef = useRef(activeControls);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    activeControlsRef.current = activeControls;
  }, [activeControls]);

  // Carga de imágenes recortadas a objetos Image
  const heroImageObj = useRef(null);
  const siblingImageObj = useRef(null);

  useEffect(() => {
    if (heroFace) {
      const img = new Image();
      img.src = heroFace;
      heroImageObj.current = img;
    }
    if (siblingFace) {
      const img = new Image();
      img.src = siblingFace;
      siblingImageObj.current = img;
    }
  }, [heroFace, siblingFace]);

  // Manejo de la música de fondo basado en el estado de juego y silencio
  useEffect(() => {
    if (isPlaying && !isMuted) {
      sounds.startMusic();
    } else {
      sounds.stopMusic();
    }
    return () => {
      sounds.stopMusic();
    };
  }, [isPlaying, isMuted]);

  // Manejo de sonido mutado
  const toggleMute = () => {
    const nextMuted = !isMuted;
    sounds.muted = nextMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      sounds.stopMusic();
    } else if (isPlaying) {
      sounds.startMusic();
    }
  };

  // Teclado local para PC
  const keys = useRef({
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    Space: false
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault(); // Evitar scroll
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.ArrowLeft = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.ArrowRight = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.current.ArrowUp = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.current.ArrowDown = true;
      if (e.code === 'Space' || e.code === 'KeyK') keys.current.Space = true;
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.current.ArrowLeft = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.current.ArrowRight = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.current.ArrowUp = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.current.ArrowDown = false;
      if (e.code === 'Space' || e.code === 'KeyK') keys.current.Space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [])  // Lógica de bucle del juego (Game Loop)
  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const getPlatformY = (plat, x) => {
      const y1 = plat.y1 !== undefined ? plat.y1 : plat.y;
      const y2 = plat.y2 !== undefined ? plat.y2 : plat.y;
      if (y1 === y2) return y1;
      const pct = Math.max(0, Math.min(1, (x - plat.x) / plat.width));
      return y1 + pct * (y2 - y1);
    };

    // Helper to check if platform is active (only for Level 4 rivets)
    const isPlatformActive = (plat) => {
      if (plat.rivetId === undefined) return true;
      const rivet = rivets.find(r => r.id === plat.rivetId);
      return rivet ? !rivet.collected : true;
    };

    // Dimensiones internas estables del Canvas
    const cw = 450;
    const ch = 600;
    canvas.width = cw;
    canvas.height = ch;

    // Configuración del juego
    const gravity = 0.35;
    
    // Configuración dinámica por nivel
    let platforms = [];
    let ladders = [];
    let coins = [];
    let rivets = []; // Para Nivel 4
    let brokenLadders = []; // Para Nivel 1
    let levelTitle = '';
    
    // Variables locales para el juego
    let bonusScore = level === 1 ? 8000 : level === 2 ? 9000 : level === 3 ? 10000 : 12000;
    let levelFrames = 0;
    
    const barrelSpeed = level === 1 ? 2.0 : level === 2 ? 2.5 : level === 3 ? 3.0 : 3.2;
    const throwInterval = level === 1 ? 130 : level === 2 ? 100 : level === 3 ? 80 : 70;

    if (level === 1) {
      levelTitle = 'NIVEL 1: 25m - LAS VIGAS';
      platforms = [
        { x: 0, y1: 560, y2: 560, width: 450, type: 'ground' },     // Piso
        { x: 50, y1: 485, y2: 470, width: 400, type: 'right-wall' }, // Tier 2 (rolls left)
        { x: 0, y1: 390, y2: 405, width: 400, type: 'left-wall' },   // Tier 3 (rolls right)
        { x: 50, y1: 320, y2: 305, width: 400, type: 'right-wall' }, // Tier 4 (rolls left)
        { x: 0, y1: 230, y2: 245, width: 400, type: 'left-wall' },   // Tier 5 (rolls right)
        { x: 50, y1: 160, y2: 145, width: 400, type: 'right-wall' }, // Tier 6 (rolls left)
        { x: 0, y1: 100, y2: 100, width: 260, type: 'top' },        // Kong platform
        { x: 220, y1: 50, y2: 50, width: 120, type: 'top' }         // Pauline platform
      ];
      ladders = [
        { x: 380, y1: 473, y2: 560 }, // Floor to Tier 2
        { x: 90, y1: 394, y2: 483 },  // Tier 2 to Tier 3
        { x: 380, y1: 308, y2: 404 }, // Tier 3 to Tier 4
        { x: 90, y1: 233, y2: 319 },  // Tier 4 to Tier 5
        { x: 380, y1: 148, y2: 244 }, // Tier 5 to Tier 6
        { x: 180, y1: 100, y2: 155 }, // Tier 6 to Kong's
        { x: 240, y1: 50, y2: 100 }   // Kong's to Pauline's
      ];
      brokenLadders = [
        { x: 220, y1: 400, y2: 460 },
        { x: 220, y1: 240, y2: 300 }
      ];
      coins = [
        { x: 180, y: 530, type: 'hat', collected: false },
        { x: 100, y: 440, type: 'purse', collected: false },
        { x: 300, y: 355, type: 'umbrella', collected: false },
        { x: 150, y: 270, type: 'hat', collected: false },
        { x: 320, y: 195, type: 'purse', collected: false }
      ];
    } else if (level === 2) {
      levelTitle = 'NIVEL 2: 50m - LAS CORREAS';
      platforms = [
        { x: 0, y1: 560, y2: 560, width: 450, type: 'ground' },
        { x: 40, y1: 460, y2: 460, width: 370, type: 'flat', beltSpeed: -0.8 }, // Conveyor left
        { x: 0, y1: 370, y2: 370, width: 170, type: 'flat' },
        { x: 280, y1: 370, y2: 370, width: 170, type: 'flat' },
        { x: 40, y1: 280, y2: 280, width: 370, type: 'flat', beltSpeed: 0.8 },  // Conveyor right
        { x: 50, y1: 180, y2: 180, width: 350, type: 'flat', beltSpeed: -0.8 }, // Conveyor left
        { x: 0, y1: 100, y2: 100, width: 220, type: 'top' },
        { x: 240, y1: 50, y2: 50, width: 120, type: 'top' }
      ];
      ladders = [
        { x: 100, y1: 460, y2: 560 },
        { x: 350, y1: 460, y2: 560 },
        { x: 80, y1: 370, y2: 460 },
        { x: 370, y1: 370, y2: 460 },
        { x: 140, y1: 280, y2: 370 },
        { x: 310, y1: 280, y2: 370 },
        { x: 100, y1: 180, y2: 280 },
        { x: 350, y1: 180, y2: 280 },
        { x: 180, y1: 100, y2: 180 },
        { x: 260, y1: 50, y2: 100 }
      ];
      coins = [
        { x: 220, y: 530, type: 'purse', collected: false },
        { x: 220, y: 430, type: 'umbrella', collected: false },
        { x: 90, y: 340, type: 'hat', collected: false },
        { x: 360, y: 340, type: 'purse', collected: false },
        { x: 220, y: 250, type: 'umbrella', collected: false }
      ];
    } else if (level === 3) {
      levelTitle = 'NIVEL 3: 75m - LOS ASCENSORES';
      platforms = [
        { x: 0, y1: 560, y2: 560, width: 450, type: 'ground' },
        { x: 0, y1: 460, y2: 460, width: 220, type: 'flat' },
        { x: 330, y1: 360, y2: 360, width: 120, type: 'flat' },
        { x: 240, y1: 360, y2: 360, width: 70, type: 'flat', isElevator: true }, // Elevator platform
        { x: 0, y1: 260, y2: 260, width: 200, type: 'flat' },
        { x: 280, y1: 160, y2: 160, width: 170, type: 'flat' },
        { x: 0, y1: 100, y2: 100, width: 220, type: 'top' },
        { x: 240, y1: 50, y2: 50, width: 120, type: 'top' }
      ];
      ladders = [
        { x: 180, y1: 460, y2: 560 },
        { x: 80, y1: 260, y2: 460 },
        { x: 380, y1: 160, y2: 360 },
        { x: 120, y1: 100, y2: 260 },
        { x: 300, y1: 50, y2: 160 }
      ];
      coins = [
        { x: 100, y: 530, type: 'hat', collected: false },
        { x: 380, y: 330, type: 'purse', collected: false },
        { x: 50, y: 230, type: 'umbrella', collected: false },
        { x: 350, y: 130, type: 'hat', collected: false }
      ];
    } else {
      levelTitle = 'NIVEL 4: 100m - LOS REMACHES';
      platforms = [
        { x: 0, y1: 560, y2: 560, width: 450, type: 'ground' },
        
        // Tier 2 (y = 460)
        { x: 40, y1: 460, y2: 460, width: 30, type: 'flat' },
        { x: 70, y1: 460, y2: 460, width: 20, type: 'flat', rivetId: 1 },
        { x: 90, y1: 460, y2: 460, width: 270, type: 'flat' },
        { x: 360, y1: 460, y2: 460, width: 20, type: 'flat', rivetId: 2 },
        { x: 380, y1: 460, y2: 460, width: 30, type: 'flat' },
        
        // Tier 3 (y = 370)
        { x: 0, y1: 370, y2: 370, width: 50, type: 'flat' },
        { x: 50, y1: 370, y2: 370, width: 20, type: 'flat', rivetId: 3 },
        { x: 70, y1: 370, y2: 370, width: 100, type: 'flat' },
        { x: 280, y1: 370, y2: 370, width: 100, type: 'flat' },
        { x: 380, y1: 370, y2: 370, width: 20, type: 'flat', rivetId: 4 },
        { x: 400, y1: 370, y2: 370, width: 50, type: 'flat' },
        
        // Tier 4 (y = 280)
        { x: 40, y1: 280, y2: 280, width: 30, type: 'flat' },
        { x: 70, y1: 280, y2: 280, width: 20, type: 'flat', rivetId: 5 },
        { x: 90, y1: 280, y2: 280, width: 270, type: 'flat' },
        { x: 360, y1: 280, y2: 280, width: 20, type: 'flat', rivetId: 6 },
        { x: 380, y1: 280, y2: 280, width: 30, type: 'flat' },
        
        // Tier 5 (y = 190)
        { x: 0, y1: 190, y2: 190, width: 50, type: 'flat' },
        { x: 50, y1: 190, y2: 190, width: 20, type: 'flat', rivetId: 7 },
        { x: 70, y1: 190, y2: 190, width: 100, type: 'flat' },
        { x: 280, y1: 190, y2: 190, width: 100, type: 'flat' },
        { x: 380, y1: 190, y2: 190, width: 20, type: 'flat', rivetId: 8 },
        { x: 400, y1: 190, y2: 190, width: 50, type: 'flat' },
        
        // Top Tiers
        { x: 100, y1: 100, y2: 100, width: 250, type: 'top' },
        { x: 180, y1: 50, y2: 50, width: 90, type: 'top' }
      ];
      ladders = [
        { x: 80, y1: 460, y2: 560 },
        { x: 370, y1: 460, y2: 560 },
        { x: 120, y1: 370, y2: 460 },
        { x: 330, y1: 370, y2: 460 },
        { x: 80, y1: 280, y2: 370 },
        { x: 370, y1: 280, y2: 370 },
        { x: 120, y1: 190, y2: 280 },
        { x: 330, y1: 190, y2: 280 },
        { x: 220, y1: 100, y2: 190 },
        { x: 225, y1: 50, y2: 100 }
      ];
      rivets = [
        { id: 1, x: 80, y: 460, collected: false },
        { id: 2, x: 370, y: 460, collected: false },
        { id: 3, x: 60, y: 370, collected: false },
        { id: 4, x: 390, y: 370, collected: false },
        { id: 5, x: 80, y: 280, collected: false },
        { id: 6, x: 370, y: 280, collected: false },
        { id: 7, x: 60, y: 190, collected: false },
        { id: 8, x: 390, y: 190, collected: false }
      ];
    }

    // Powerups del nivel
    let hammerPowerUp = {
      x: level === 1 ? 220 : level === 2 ? 180 : level === 3 ? 80 : 220,
      y: level === 1 ? 290 : level === 2 ? 240 : level === 3 ? 120 : 240,
      collected: false,
      active: false,
      timer: 0
    };

    let shieldPowerUp = {
      x: level === 1 ? 80 : level === 2 ? 320 : level === 3 ? 380 : 220,
      y: level === 1 ? 410 : level === 2 ? 330 : level === 3 ? 220 : 420,
      collected: false,
      active: false
    };

    // Propiedades del Jugador
    const player = {
      x: 40,
      y: 500,
      width: 28,
      height: 38,
      vx: 0,
      vy: 0,
      speed: 2.2,
      jumpForce: -6.5,
      isGrounded: false,
      isClimbing: false,
      facing: 'right', // 'left' o 'right'
      walkFrame: 0,
      climbFrame: 0
    };

    // Gorila (Kong)
    const gorilla = {
      x: 30,
      y: 35,
      width: 80,
      height: 55,
      throwCooldown: throwInterval,
      timer: 60,
      pose: 'idle' // 'idle', 'prepare', 'throw'
    };

    // Barriles
    let barrels = [];

    // Partículas para efectos visuales (monedas, explosiones)
    let particles = [];

    // Ascensor & Resortes (Nivel 3)
    let elevatorY = 360;
    let elevatorDir = 1;
    let springs = [];
    let springSpawnTimer = 0;
    let activePlatform = null; // Para seguir plataformas móviles

    const spawnParticle = (x, y, color) => {
      for (let i = 0; i < 8; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 2,
          radius: Math.random() * 3 + 1,
          color,
          alpha: 1,
          life: 30 + Math.random() * 20
        });
      }
    };

    // Función para reiniciar la posición del jugador al perder vida
    const resetPlayerPosition = () => {
      player.x = 40;
      player.y = 520;
      player.vx = 0;
      player.vy = 0;
      player.isClimbing = false;
      player.isGrounded = true;
      barrels = [];
      springs = [];
      activePlatform = null;
      // Quitar martillo activo si muere
      hammerPowerUp.active = false;
      // Reiniciar bono del nivel al morir
      bonusScore = level === 1 ? 8000 : level === 2 ? 9000 : level === 3 ? 10000 : 12000;
      levelFrames = 0;
    };

    let animationFrameId;

    const gameLoop = () => {
      // --- ACTUALIZACIONES DE FÍSICAS ---
      
      // Temporizador de bono decreciente
      levelFrames++;
      if (levelFrames % 90 === 0) {
        if (bonusScore > 1000) {
          bonusScore -= 100;
        } else {
          // Si el bono llega a 0, el jugador pierde una vida
          sounds.playHit();
          spawnParticle(player.x + player.width / 2, player.y + player.height / 2, 'red');
          setLives((prev) => {
            const nextLives = prev - 1;
            if (nextLives <= 0) {
              setIsPlaying(false);
            } else {
              resetPlayerPosition();
            }
            return nextLives;
          });
        }
      }

      // 1. Inputs de movimiento
      const moveLeft = keys.current.ArrowLeft || activeControlsRef.current.left;
      const moveRight = keys.current.ArrowRight || activeControlsRef.current.right;
      const moveUp = keys.current.ArrowUp || activeControlsRef.current.up;
      const moveDown = keys.current.ArrowDown || activeControlsRef.current.down;
      const doJump = keys.current.Space || activeControlsRef.current.jump;

      // Actualizar Ascensor en Nivel 3
      if (level === 3) {
        elevatorY += elevatorDir * 1.2;
        if (elevatorY > 510 || elevatorY < 210) {
          elevatorDir *= -1;
        }
        platforms.forEach((plat) => {
          if (plat.isElevator) {
            plat.y1 = elevatorY;
            plat.y2 = elevatorY;
          }
        });
      }

      // Aplicar velocidad de la plataforma en la que esté parado
      if (player.isGrounded && activePlatform) {
        if (activePlatform.isElevator) {
          player.y += elevatorDir * 1.2;
        }
        if (activePlatform.beltSpeed !== undefined) {
          player.x += activePlatform.beltSpeed;
        }
      }

      // Resetear flags
      player.vx = 0;

      // Detectar si está en contacto con alguna escalera
      let touchingLadder = null;
      for (let ladder of ladders) {
        if (Math.abs(player.x + player.width / 2 - ladder.x) < 15 &&
            player.y + player.height >= ladder.y1 &&
            player.y <= ladder.y2) {
          touchingLadder = ladder;
          break;
        }
      }

      if (player.isClimbing) {
        if (!touchingLadder) {
          player.isClimbing = false;
        } else {
          // Controles de trepado
          player.vx = 0;
          player.x = touchingLadder.x - player.width / 2; // Centrar en la escalera
          if (moveUp) {
            player.vy = -1.8;
            player.climbFrame += 0.15;
          } else if (moveDown) {
            player.vy = 1.8;
            player.climbFrame += 0.15;
            // Si llega al suelo de la escalera, bajarse
            if (player.y + player.height >= touchingLadder.y2) {
              player.isClimbing = false;
            }
          } else {
            player.vy = 0;
          }

          // Salir de la escalera arriba
          if (player.y + player.height < touchingLadder.y1 + 5 && moveUp) {
            player.y = touchingLadder.y1 - player.height;
            player.isClimbing = false;
          }
        }
      } else {
        // Movimiento normal en plataformas
        if (moveLeft) {
          player.vx = -player.speed;
          player.facing = 'left';
          player.walkFrame += 0.2;
        } else if (moveRight) {
          player.vx = player.speed;
          player.facing = 'right';
          player.walkFrame += 0.2;
        }

        // Activar trepado
        if (touchingLadder && (moveUp || (moveDown && !player.isGrounded))) {
          player.isClimbing = true;
          player.vy = 0;
        }

        // Aplicar gravedad
        player.vy += gravity;

        // Saltar
        if (doJump && player.isGrounded) {
          player.vy = player.jumpForce;
          player.isGrounded = false;
          sounds.playJump();
          if (activeControlsRef.current.jump) activeControlsRef.current.jump = false;
        }
      }

      // Aplicar movimiento
      player.x += player.vx;
      player.y += player.vy;

      // Colisiones de bordes horizontales
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > cw) player.x = cw - player.width;

      // Colisión con Plataformas
      player.isGrounded = false;
      if (!player.isClimbing) {
        for (let plat of platforms) {
          if (!isPlatformActive(plat)) continue; // Ignorar remaches ya removidos
          
          const platY = getPlatformY(plat, player.x + player.width / 2);
          if (player.x + player.width - 5 >= plat.x && 
              player.x + 5 <= plat.x + plat.width && 
              player.y + player.height >= platY && 
              player.y + player.height - player.vy <= platY + 10) {
            
            player.y = platY - player.height;
            player.vy = 0;
            player.isGrounded = true;
            activePlatform = plat; // Guardar plataforma activa
            break;
          }
        }
        if (!player.isGrounded) {
          activePlatform = null;
        }
      }

      // Lógica del Temporizador del Martillo
      if (hammerPowerUp.active) {
        hammerPowerUp.timer--;
        if (hammerPowerUp.timer <= 0) {
          hammerPowerUp.active = false;
        }
      }

      // 2. Lógica del Gorila y lanzamiento de Barriles
      gorilla.timer--;
      if (gorilla.timer <= 0) {
        if (gorilla.pose === 'idle') {
          gorilla.pose = 'prepare';
          gorilla.timer = 20;
        } else if (gorilla.pose === 'prepare') {
          gorilla.pose = 'throw';
          gorilla.timer = 10;
          
          // Decidir si es barril azul (rápido)
          const isBlue = Math.random() < 0.25;
          
          // Crear un barril nuevo
          barrels.push({
            x: gorilla.x + gorilla.width - 15,
            y: gorilla.y + gorilla.height - 20,
            radius: 10,
            vx: isBlue ? barrelSpeed * 1.5 : barrelSpeed,
            vy: 0,
            angle: 0,
            rotationSpeed: isBlue ? 0.15 : 0.1,
            isFalling: false,
            isBlue: isBlue,
            isClimbingLadder: false,
            climbLadder: null,
            lastLadderId: null
          });
        } else {
          gorilla.pose = 'idle';
          gorilla.timer = gorilla.throwCooldown + Math.random() * 40;
        }
      }

      // 3. Lógica de Barriles
      for (let i = barrels.length - 1; i >= 0; i--) {
        let b = barrels[i];

        if (b.isClimbingLadder) {
          // Bajar por la escalera
          b.y += b.vy;
          b.angle += b.rotationSpeed;
          
          const l = b.climbLadder;
          // Si llega a la parte inferior de la escalera, bajarse
          if (b.y + b.radius >= l.y2) {
            b.y = l.y2 - b.radius;
            b.isClimbingLadder = false;
            b.vy = 0;
            
            // Buscar en qué plataforma aterrizó para ajustar su vx
            for (let plat of platforms) {
              if (!isPlatformActive(plat)) continue;
              if (b.x >= plat.x && b.x <= plat.x + plat.width &&
                  Math.abs(b.y + b.radius - getPlatformY(plat, b.x)) < 10) {
                if (plat.type === 'left-wall') {
                  b.vx = b.isBlue ? barrelSpeed * 1.5 : barrelSpeed;
                  b.rotationSpeed = 0.1;
                } else if (plat.type === 'right-wall') {
                  b.vx = b.isBlue ? -barrelSpeed * 1.5 : -barrelSpeed;
                  b.rotationSpeed = -0.1;
                } else if (plat.type === 'ground') {
                  b.vx = -barrelSpeed;
                  b.rotationSpeed = -0.1;
                }
                break;
              }
            }
          }
        } else if (b.isFalling) {
          b.vy += gravity;
          b.y += b.vy;
          b.x += b.vx * 0.5;
        } else {
          // Mover horizontalmente
          b.x += b.vx;
          b.angle += b.rotationSpeed;

          // Detectar si cruza una escalera y decide bajar por ella (solo si la escalera conecta abajo y no en Nivel 4)
          let decidedClimb = false;
          if (level !== 4) {
            for (let l of ladders) {
              if (Math.abs(b.x - l.x) < 8 && 
                  Math.abs(b.y + b.radius - l.y1) < 6 &&
                  b.lastLadderId !== l.x) {
                
                b.lastLadderId = l.x;
                
                // 25% de probabilidad de bajar por la escalera
                if (Math.random() < 0.25) {
                  b.isClimbingLadder = true;
                  b.climbLadder = l;
                  b.vx = 0;
                  b.vy = (b.isBlue ? barrelSpeed * 1.2 : barrelSpeed) * 0.8;
                  b.rotationSpeed = 0.05;
                  decidedClimb = true;
                  break;
                }
              }
            }
          }

          if (!decidedClimb) {
            // Buscar en qué plataforma está rodando
            let onPlatform = false;
            for (let plat of platforms) {
              if (!isPlatformActive(plat)) continue;
              
              const platY = getPlatformY(plat, b.x);
              if (b.x >= plat.x && b.x <= plat.x + plat.width &&
                  Math.abs(b.y + b.radius - platY) < 6) {
                b.y = platY - b.radius;
                b.vy = 0;
                onPlatform = true;

                // Aplicar fuerza de cinta transportadora a los barriles en Nivel 2
                if (plat.beltSpeed !== undefined) {
                  b.x += plat.beltSpeed;
                }

                // Cambiar dirección del barril según la plataforma en la que ruede
                if (plat.type === 'left-wall') {
                  b.vx = b.isBlue ? barrelSpeed * 1.5 : barrelSpeed;
                  b.rotationSpeed = 0.1;
                } else if (plat.type === 'right-wall') {
                  b.vx = b.isBlue ? -barrelSpeed * 1.5 : -barrelSpeed;
                  b.rotationSpeed = -0.1;
                } else if (plat.type === 'top') {
                  b.vx = b.isBlue ? barrelSpeed * 1.5 : barrelSpeed;
                  b.rotationSpeed = 0.1;
                } else if (plat.type === 'ground') {
                  b.vx = -barrelSpeed;
                  b.rotationSpeed = -0.1;
                }
                break;
              }
            }

            // Si el barril rueda fuera de la plataforma, empieza a caer
            if (!onPlatform) {
              b.isFalling = true;
              b.vy = 1;
            }
          }
        }

        // Colisión de barril con otras plataformas al caer
        if (b.isFalling) {
          for (let plat of platforms) {
            if (!isPlatformActive(plat)) continue;
            const platY = getPlatformY(plat, b.x);
            if (b.x >= plat.x && b.x <= plat.x + plat.width &&
                b.y + b.radius >= platY && b.y + b.radius - b.vy <= platY + 10) {
              b.y = platY - b.radius;
              b.isFalling = false;
              b.vy = 0;
              b.lastLadderId = null; // Habilitar detección para nuevas escaleras
              break;
            }
          }
        }

        // Si el barril entra en contacto con el tambor de aceite en el suelo (x < 40)
        if (b.y > 530 && b.x < 40) {
          sounds.playHit();
          spawnParticle(25, 545, '#f97316'); // Chispas de fuego
          barrels.splice(i, 1);
          continue;
        }

        // Eliminar barriles fuera de la pantalla
        if (b.y > ch || b.x > cw + 50 || b.x < -50) {
          barrels.splice(i, 1);
          continue;
        }

        // Colisión de barril con el Jugador
        const dx = (player.x + player.width / 2) - b.x;
        const dy = (player.y + player.height / 2) - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < b.radius + 14) {
          if (hammerPowerUp.active) {
            barrels.splice(i, 1);
            setScore((prev) => prev + 200);
            sounds.playHit();
            spawnParticle(b.x, b.y, '#d97706');
            continue;
          } else if (shieldPowerUp.active) {
            shieldPowerUp.active = false;
            barrels.splice(i, 1);
            sounds.playHit();
            spawnParticle(b.x, b.y, '#06b6d4');
            continue;
          } else {
            sounds.playHit();
            spawnParticle(player.x + player.width / 2, player.y + player.height / 2, 'red');
            setLives((prev) => {
              const nextLives = prev - 1;
              if (nextLives <= 0) {
                setIsPlaying(false);
              } else {
                resetPlayerPosition();
              }
              return nextLives;
            });
            break;
          }
        }
      }

      // 4. Lógica de Resortes en Nivel 3
      if (level === 3) {
        springSpawnTimer++;
        if (springSpawnTimer >= 150) {
          springSpawnTimer = 0;
          springs.push({
            x: 120,
            y: 90,
            vx: 1.8,
            vy: -3.0,
            radius: 8
          });
        }

        for (let i = springs.length - 1; i >= 0; i--) {
          let s = springs[i];
          s.vy += gravity;
          s.x += s.vx;
          s.y += s.vy;

          // Colisión de resortes con plataformas (rebotar)
          for (let plat of platforms) {
            const platY = getPlatformY(plat, s.x);
            if (s.x >= plat.x && s.x <= plat.x + plat.width &&
                s.y + s.radius >= platY && s.y + s.radius - s.vy <= platY + 12) {
              s.y = platY - s.radius;
              s.vy = -6.0; // Rebote clásico
              break;
            }
          }

          // Eliminar resortes fuera de límites
          if (s.y > ch || s.x > cw + 30 || s.x < -30) {
            springs.splice(i, 1);
            continue;
          }

          // Colisión con el jugador
          const dx = (player.x + player.width / 2) - s.x;
          const dy = (player.y + player.height / 2) - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < s.radius + 14) {
            sounds.playHit();
            spawnParticle(player.x + player.width / 2, player.y + player.height / 2, 'red');
            setLives((prev) => {
              const nextLives = prev - 1;
              if (nextLives <= 0) {
                setIsPlaying(false);
              } else {
                resetPlayerPosition();
              }
              return nextLives;
            });
            break;
          }
        }
      }

      // 5. Lógica de Remaches en Nivel 4
      if (level === 4) {
        rivets.forEach((r) => {
          if (!r.collected) {
            const dx = (player.x + player.width / 2) - r.x;
            const dy = (player.y + player.height / 2) - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 20) {
              r.collected = true;
              setScore((prev) => prev + 100);
              sounds.playCoin();
              spawnParticle(r.x, r.y, '#fbbf24');
              
              // Verificar si se recolectaron todos para ganar
              const allCollected = rivets.every((riv) => riv.collected);
              if (allCollected) {
                sounds.playVictory();
                setIsPlaying(false);
                onVictory(scoreRef.current + bonusScore);
              }
            }
          }
        });
      }

      // 6. Recolectar Monedas/Estrellas
      for (let c of coins) {
        if (!c.collected) {
          const dx = (player.x + player.width / 2) - c.x;
          const dy = (player.y + player.height / 2) - c.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 20) {
            c.collected = true;
            setScore((prev) => prev + 100);
            sounds.playCoin();
            spawnParticle(c.x, c.y, '#eab308');
          }
        }
      }

      // Colisión con Power-up Martillo
      if (!hammerPowerUp.collected) {
        const dx = (player.x + player.width / 2) - hammerPowerUp.x;
        const dy = (player.y + player.height / 2) - hammerPowerUp.y;
        if (Math.sqrt(dx * dx + dy * dy) < 22) {
          hammerPowerUp.collected = true;
          hammerPowerUp.active = true;
          hammerPowerUp.timer = 480;
          sounds.playCoin();
          spawnParticle(hammerPowerUp.x, hammerPowerUp.y, '#ef4444');
        }
      }

      // Colisión con Power-up Escudo
      if (!shieldPowerUp.collected) {
        const dx = (player.x + player.width / 2) - shieldPowerUp.x;
        const dy = (player.y + player.height / 2) - shieldPowerUp.y;
        if (Math.sqrt(dx * dx + dy * dy) < 22) {
          shieldPowerUp.collected = true;
          shieldPowerUp.active = true;
          sounds.playCoin();
          spawnParticle(shieldPowerUp.x, shieldPowerUp.y, '#06b6d4');
        }
      }

      // 7. Partículas
      for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        p.life--;
        if (p.life <= 0 || p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      // 8. Condición de Victoria (Alcanzar al hermano/a en la cima - Niveles 1, 2 y 3)
      const siblingX = level === 4 ? 220 : level === 3 ? 280 : level === 2 ? 280 : 260;
      const siblingY = 50 - player.height;
      const distToSibling = Math.sqrt(
        Math.pow((player.x + player.width/2) - (siblingX + player.width/2), 2) +
        Math.pow(player.y - siblingY, 2)
      );

      if (distToSibling < 30 && level < 4) {
        sounds.playVictory();
        setLevel((prev) => prev + 1);
        resetPlayerPosition();
      }

      // --- DIBUJADO EN CANVAS ---
      ctx.clearRect(0, 0, cw, ch);

      // Fondo del juego
      ctx.fillStyle = '#0b0818';
      ctx.fillRect(0, 0, cw, ch);

      // Cuadrícula sutil
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.04)';
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

      // Dibujar escaleras rotas (Level 1)
      if (level === 1) {
        brokenLadders.forEach((l) => {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
          ctx.lineWidth = 4;
          const midY = (l.y1 + l.y2) / 2;
          const breakGap = 12;

          // Mitad superior
          ctx.beginPath();
          ctx.moveTo(l.x - 8, l.y1);
          ctx.lineTo(l.x - 8, midY - breakGap);
          ctx.moveTo(l.x + 8, l.y1);
          ctx.lineTo(l.x + 8, midY - breakGap);
          // Mitad inferior
          ctx.moveTo(l.x - 8, midY + breakGap);
          ctx.lineTo(l.x - 8, l.y2);
          ctx.moveTo(l.x + 8, midY + breakGap);
          ctx.lineTo(l.x + 8, l.y2);
          ctx.stroke();

          // Peldaños
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 2;
          for (let y = l.y1 + 6; y < l.y2; y += 12) {
            if (y > midY - breakGap && y < midY + breakGap) continue;
            ctx.beginPath();
            ctx.moveTo(l.x - 8, y);
            ctx.lineTo(l.x + 8, y);
            ctx.stroke();
          }
        });
      }

      // Dibujar Escaleras Reales
      ladders.forEach((l) => {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(l.x - 8, l.y1);
        ctx.lineTo(l.x - 8, l.y2);
        ctx.moveTo(l.x + 8, l.y1);
        ctx.lineTo(l.x + 8, l.y2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 2;
        for (let y = l.y1 + 8; y < l.y2; y += 12) {
          ctx.beginPath();
          ctx.moveTo(l.x - 8, y);
          ctx.lineTo(l.x + 8, y);
          ctx.stroke();
        }
      });

      // Dibujar Plataformas
      platforms.forEach((p) => {
        if (!isPlatformActive(p)) return; // Ignorar remaches removidos
        ctx.save();
        
        const py1 = p.y1 !== undefined ? p.y1 : p.y;
        const py2 = p.y2 !== undefined ? p.y2 : p.y;

        // Renderizado del elevador
        if (p.isElevator) {
          ctx.fillStyle = '#4b5563';
          ctx.fillRect(p.x, py1, p.width, 10);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(p.x, py1, p.width, 10);
          ctx.fillStyle = '#111827';
          for (let sx = p.x + 5; sx < p.x + p.width; sx += 15) {
            ctx.beginPath();
            ctx.moveTo(sx, py1);
            ctx.lineTo(sx + 5, py1);
            ctx.lineTo(sx, py1 + 10);
            ctx.lineTo(sx - 5, py1 + 10);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
          return;
        }

        // Color según tipo
        if (p.beltSpeed !== undefined) {
          ctx.strokeStyle = '#06b6d4'; // Cyan para cintas transportadoras
        } else {
          ctx.strokeStyle = '#db2777'; // Rosa neón clásico
        }
        ctx.lineWidth = 2.5;

        // Línea superior e inferior de la viga
        ctx.beginPath();
        ctx.moveTo(p.x, py1);
        ctx.lineTo(p.x + p.width, py2);
        ctx.moveTo(p.x, py1 + 10);
        ctx.lineTo(p.x + p.width, py2 + 10);
        ctx.stroke();

        // Diagonales (/\/\/\/\)
        ctx.beginPath();
        const step = 12;
        for (let x = p.x; x < p.x + p.width; x += step) {
          const yLeft = getPlatformY(p, x);
          const yMid = getPlatformY(p, x + step / 2);
          const yRight = getPlatformY(p, Math.min(p.x + p.width, x + step));
          
          ctx.moveTo(x, yLeft + 10);
          ctx.lineTo(x + step / 2, yMid);
          ctx.lineTo(Math.min(p.x + p.width, x + step), yRight + 10);
        }
        ctx.stroke();

        // Si es cinta transportadora, dibujar flechas móviles en ella
        if (p.beltSpeed !== undefined) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
          ctx.lineWidth = 1.5;
          const arrowDir = Math.sign(p.beltSpeed);
          const offset = (Date.now() / 15) % 20;
          for (let x = p.x + offset; x < p.x + p.width; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, py1 + 5);
            ctx.lineTo(x - arrowDir * 5, py1 + 2);
            ctx.moveTo(x, py1 + 5);
            ctx.lineTo(x - arrowDir * 5, py1 + 8);
            ctx.stroke();
          }
        }

        ctx.restore();
      });

      // Dibujar Pila de Barriles a la izquierda del Gorila
      const drawBarrelStack = (x, y) => {
        const drawSingleBarrelStack = (bx, by) => {
          ctx.save();
          ctx.translate(bx, by);
          // Barril inferior
          ctx.fillStyle = '#d97706';
          ctx.fillRect(-8, 2, 16, 12);
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-8, 2, 16, 12);
          ctx.fillStyle = '#000';
          ctx.fillRect(-8, 4, 16, 1.5);
          ctx.fillRect(-8, 10, 16, 1.5);
          // Barril superior
          ctx.fillStyle = '#d97706';
          ctx.fillRect(-8, -12, 16, 12);
          ctx.strokeRect(-8, -12, 16, 12);
          ctx.fillStyle = '#000';
          ctx.fillRect(-8, -10, 16, 1.5);
          ctx.fillRect(-8, -4, 16, 1.5);
          ctx.restore();
        };
        drawSingleBarrelStack(x, y);
        drawSingleBarrelStack(x + 18, y);
      };
      drawBarrelStack(15, 90 - 15);

      // Dibujar Barril de Aceite con Fuego Animado en el suelo
      ctx.save();
      const drumX = 25;
      const drumY = 560;
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(drumX - 10, drumY - 24, 20, 24);
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.strokeRect(drumX - 10, drumY - 24, 20, 24);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 6px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OIL', drumX, drumY - 12);

      // Fuego animado
      const flameHeight = 10 + Math.sin(Date.now() / 80) * 4;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(drumX - 6, drumY - 24);
      ctx.quadraticCurveTo(drumX, drumY - 24 - flameHeight, drumX + 6, drumY - 24);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(drumX - 3, drumY - 24);
      ctx.quadraticCurveTo(drumX, drumY - 24 - flameHeight * 0.6, drumX + 3, drumY - 24);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Dibujar caja de BONUS
      ctx.save();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.strokeRect(cw - 110, 15, 95, 30);
      ctx.fillStyle = '#ec4899';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('BONUS', cw - 100, 26);
      ctx.fillStyle = '#06b6d4';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText(String(bonusScore).padStart(4, '0'), cw - 100, 40);
      ctx.restore();

      // Dibujar Monedas / Estrellas (Bonus Items Retro)
      const drawHat = (bx, by) => {
        ctx.save();
        ctx.translate(bx, by);
        ctx.fillStyle = '#ef4444'; // Red cap
        ctx.fillRect(-6, 0, 12, 4); // Brim
        ctx.fillRect(-4, -4, 8, 4); // Dome
        ctx.fillStyle = '#ffffff'; // White emblem
        ctx.fillRect(-2, -3, 3, 2);
        ctx.restore();
      };

      const drawPurse = (bx, by) => {
        ctx.save();
        ctx.translate(bx, by);
        ctx.strokeStyle = '#fbbf24'; // Gold handle
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -2, 4, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = '#d97706'; // Gold bag
        ctx.fillRect(-5, -2, 10, 7);
        ctx.fillStyle = '#fff'; // Latch
        ctx.fillRect(-1.5, -2, 3, 2);
        ctx.restore();
      };

      const drawUmbrella = (bx, by) => {
        ctx.save();
        ctx.translate(bx, by);
        ctx.fillStyle = '#f472b6'; // Pink canopy
        ctx.beginPath();
        ctx.arc(0, -2, 6, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.lineTo(0, 4);
        ctx.arc(2, 4, 2, Math.PI, 0, true); // Hook
        ctx.stroke();
        ctx.restore();
      };

      coins.forEach((c) => {
        if (!c.collected) {
          if (c.type === 'hat') {
            drawHat(c.x, c.y);
          } else if (c.type === 'purse') {
            drawPurse(c.x, c.y);
          } else if (c.type === 'umbrella') {
            drawUmbrella(c.x, c.y);
          } else {
            ctx.save();
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      });

      // Dibujar Power-up Martillo
      if (!hammerPowerUp.collected) {
        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.translate(hammerPowerUp.x, hammerPowerUp.y);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 6);
        ctx.lineTo(0, -6);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-8, -12, 16, 7);
        ctx.restore();
      }

      // Dibujar Power-up Escudo
      if (!shieldPowerUp.collected) {
        ctx.save();
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.translate(shieldPowerUp.x, shieldPowerUp.y);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Dibujar Resortes (Level 3)
      if (level === 3) {
        springs.forEach((s) => {
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-6, 6);
          ctx.lineTo(6, 4);
          ctx.lineTo(-6, 0);
          ctx.lineTo(6, -4);
          ctx.lineTo(-6, -6);
          ctx.stroke();
          ctx.restore();
        });
      }

      // Dibujar Remaches (Level 4)
      if (level === 4) {
        rivets.forEach((r) => {
          if (!r.collected) {
            ctx.save();
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 6;
            ctx.fillStyle = '#fbbf24';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
              ctx.lineTo(r.x + Math.cos(a) * 6, r.y + Math.sin(a) * 6);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });
      }

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

      // Dibujar Gorila (Donkey Kong 16-bit)
      ctx.save();
      const gx = gorilla.x;
      const gy = gorilla.y;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      
      // Orejas
      ctx.fillStyle = '#5c3a21';
      ctx.beginPath();
      ctx.arc(gx + 18, gy + 22, 6, 0, Math.PI * 2);
      ctx.arc(gx + 62, gy + 22, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd1a9';
      ctx.beginPath();
      ctx.arc(gx + 18, gy + 22, 3, 0, Math.PI * 2);
      ctx.arc(gx + 62, gy + 22, 3, 0, Math.PI * 2);
      ctx.fill();

      // Cuerpo
      ctx.fillStyle = '#5c3a21';
      ctx.beginPath();
      ctx.ellipse(gx + 40, gy + 45, 24, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd1a9';
      ctx.beginPath();
      ctx.ellipse(gx + 40, gy + 50, 15, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cabeza
      ctx.fillStyle = '#5c3a21';
      ctx.beginPath();
      ctx.arc(gx + 40, gy + 24, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(gx + 35, gy + 11);
      ctx.lineTo(gx + 40, gy + 3);
      ctx.lineTo(gx + 45, gy + 11);
      ctx.closePath();
      ctx.fill();

      // Cara
      ctx.fillStyle = '#ffd1a9';
      ctx.beginPath();
      ctx.ellipse(gx + 34, gy + 20, 7, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(gx + 46, gy + 20, 7, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(gx + 34, gy + 19, 4, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(gx + 46, gy + 19, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(gx + 34, gy + 19, 2, 0, Math.PI * 2);
      ctx.arc(gx + 46, gy + 19, 2, 0, Math.PI * 2);
      ctx.fill();

      // Cejas
      ctx.strokeStyle = '#321d10';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(gx + 27, gy + 13);
      ctx.lineTo(gx + 39, gy + 16);
      ctx.moveTo(gx + 53, gy + 13);
      ctx.lineTo(gx + 41, gy + 16);
      ctx.stroke();

      // Hocico
      ctx.fillStyle = '#ffd1a9';
      ctx.beginPath();
      ctx.ellipse(gx + 40, gy + 30, 13, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a21caf';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(gx + 40, gy + 30, 5, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = '#321d10';
      ctx.beginPath();
      ctx.arc(gx + 38, gy + 28, 1, 0, Math.PI * 2);
      ctx.arc(gx + 42, gy + 28, 1, 0, Math.PI * 2);
      ctx.fill();

      // Corbata roja "DK"
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(gx + 37, gy + 40);
      ctx.lineTo(gx + 43, gy + 40);
      ctx.lineTo(gx + 41, gy + 44);
      ctx.lineTo(gx + 39, gy + 44);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(gx + 39, gy + 44);
      ctx.lineTo(gx + 41, gy + 44);
      ctx.lineTo(gx + 43, gy + 58);
      ctx.lineTo(gx + 40, gy + 63);
      ctx.lineTo(gx + 37, gy + 58);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DK', gx + 41, gy + 54);

      // Brazos
      ctx.fillStyle = '#5c3a21';
      if (gorilla.pose === 'idle') {
        ctx.beginPath();
        ctx.ellipse(gx + 14, gy + 45, 7, 14, 0.1, 0, Math.PI * 2);
        ctx.ellipse(gx + 66, gy + 45, 7, 14, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd1a9';
        ctx.beginPath();
        ctx.arc(gx + 12, gy + 58, 6, 0, Math.PI * 2);
        ctx.arc(gx + 68, gy + 58, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (gorilla.pose === 'prepare') {
        ctx.beginPath();
        ctx.ellipse(gx + 16, gy + 25, 7, 14, -0.4, 0, Math.PI * 2);
        ctx.ellipse(gx + 64, gy + 25, 7, 14, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd1a9';
        ctx.beginPath();
        ctx.arc(gx + 12, gy + 14, 6, 0, Math.PI * 2);
        ctx.arc(gx + 68, gy + 14, 6, 0, Math.PI * 2);
        ctx.fill();

        // Dibujar barril en manos
        ctx.save();
        ctx.translate(gx + 40, gy + 10);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-18, -10, 36, 20);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-18, -10, 36, 20);
        ctx.fillStyle = '#000000';
        ctx.fillRect(-12, -10, 3, 20);
        ctx.fillRect(9, -10, 3, 20);
        ctx.restore();
      } else if (gorilla.pose === 'throw') {
        ctx.beginPath();
        ctx.ellipse(gx + 14, gy + 45, 7, 14, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd1a9';
        ctx.beginPath();
        ctx.arc(gx + 12, gy + 58, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5c3a21';
        ctx.beginPath();
        ctx.ellipse(gx + 68, gy + 36, 12, 7, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd1a9';
        ctx.beginPath();
        ctx.arc(gx + 78, gy + 40, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Dibujar Barriles
      barrels.forEach((b) => {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius - 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-b.radius, 0); ctx.lineTo(b.radius, 0);
        ctx.moveTo(0, -b.radius); ctx.lineTo(0, b.radius);
        ctx.stroke();
        ctx.restore();
      });

      // Dibujar Hermano/a en la cima
      ctx.save();
      const wave = Math.sin(Date.now() / 150) * 5;
      ctx.translate(siblingX, siblingY + wave);
      
      ctx.fillStyle = heroName === 'Dante' ? '#f472b6' : '#2563eb';
      ctx.fillRect(5, 18, 18, 20);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(2, 22 + Math.sin(Date.now() / 100) * 3);
      ctx.lineTo(-3, 10);
      ctx.moveTo(26, 22);
      ctx.lineTo(31, 30);
      ctx.stroke();
      
      if (siblingImageObj.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(14, 9, 13, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(siblingImageObj.current, 1, -4, 26, 26);
        ctx.restore();
      } else {
        ctx.fillStyle = '#ffd1a9';
        ctx.beginPath();
        ctx.arc(14, 9, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = heroName === 'Dante' ? '#d97706' : '#78350f';
        ctx.beginPath();
        ctx.arc(14, 4, 9, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(10, 7, 2, 3);
        ctx.fillRect(16, 7, 2, 3);
        ctx.strokeStyle = '#db2777';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(14, 11, 3, 0, Math.PI);
        ctx.stroke();
      }

      // Globito de texto
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.roundRect(-20, -32, 60, 20, 6);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, -12);
      ctx.lineTo(15, -6);
      ctx.lineTo(20, -12);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(heroName === 'Dante' ? '¡Dante! ♥' : '¡Fran! ♥', -14, -18);
      ctx.restore();

      // Dibujar Héroe (Jugador activo)
      ctx.save();
      ctx.translate(player.x, player.y);

      let bob = 0;
      if (player.vx !== 0 && player.isGrounded) {
        bob = Math.abs(Math.sin(player.walkFrame) * 3);
      }

      ctx.fillStyle = heroName === 'Dante' ? '#e11d48' : '#db2777';
      ctx.fillRect(3, 18 + bob, 22, 20);
      ctx.fillStyle = heroName === 'Dante' ? '#3b82f6' : '#fbcfe8';
      ctx.fillRect(0, 18 + bob, 3, 10);
      ctx.fillRect(25, 18 + bob, 3, 10);

      ctx.fillStyle = '#000';
      if (player.vx !== 0 && player.isGrounded) {
        const step = Math.floor(player.walkFrame) % 2;
        ctx.fillRect(2, 37 + (step === 0 ? -2 : 0), 8, 4);
        ctx.fillRect(18, 37 + (step === 1 ? -2 : 0), 8, 4);
      } else {
        ctx.fillRect(2, 37, 8, 4);
        ctx.fillRect(18, 37, 8, 4);
      }

      if (player.isClimbing) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        const climbSide = Math.floor(player.climbFrame) % 2;
        ctx.beginPath();
        ctx.moveTo(0, 18 + (climbSide === 0 ? -4 : 4));
        ctx.lineTo(0, 8);
        ctx.moveTo(28, 18 + (climbSide === 1 ? -4 : 4));
        ctx.lineTo(28, 8);
        ctx.stroke();
      }

      if (heroImageObj.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(14, 9 + bob, 13, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(heroImageObj.current, 1, -4 + bob, 26, 26);
        ctx.restore();

        ctx.fillStyle = heroName === 'Dante' ? '#e11d48' : '#f472b6';
        if (heroName === 'Dante') {
          ctx.beginPath();
          ctx.arc(14, -2 + bob, 8, Math.PI, 0);
          ctx.fill();
          ctx.fillRect(9, -4 + bob, 14, 3);
        } else {
          ctx.beginPath();
          ctx.moveTo(6, 2 + bob);
          ctx.lineTo(9, -4 + bob);
          ctx.lineTo(14, 0 + bob);
          ctx.lineTo(19, -4 + bob);
          ctx.lineTo(22, 2 + bob);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#ffd1a9';
        ctx.beginPath();
        ctx.arc(14, 9 + bob, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = heroName === 'Dante' ? '#78350f' : '#d97706';
        ctx.beginPath();
        ctx.arc(14, 4 + bob, 9, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(10, 7 + bob, 2, 3);
        ctx.fillRect(16, 7 + bob, 2, 3);
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(14, 11 + bob, 3, 0, Math.PI);
        ctx.stroke();
      }

      if (shieldPowerUp.active) {
        ctx.save();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(14, 9 + bob, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (hammerPowerUp.active) {
        ctx.save();
        ctx.translate(14, 9 + bob);
        const swingAngle = Math.sin(Date.now() / 80) * 1.2;
        ctx.rotate(player.facing === 'left' ? -Math.PI / 2 + swingAngle : Math.PI / 2 - swingAngle);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -15);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-10, -22, 20, 10);
        ctx.restore();
      }
      ctx.restore();

      // HUD / Instrucciones de Nivel en Canvas
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(levelTitle, 15, 25);
      
      if (level === 4) {
        // Alerta de remaches recolectados
        const collectedCount = rivets.filter((r) => r.collected).length;
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`REMACHES: ${collectedCount}/8`, 15, 45);
      }

      if (hammerPowerUp.active) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(10, ch - 22, cw - 20, 12);
        ctx.fillStyle = '#ef4444';
        const barWidth = ((cw - 20) * hammerPowerUp.timer) / 480;
        ctx.fillRect(10, ch - 22, barWidth, 12);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText('¡MARTILLO DE PODER ACTIVO!', 20, ch - 13);
      }
      
      if (shieldPowerUp.active) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.fillRect(cw - 110, 12, 100, 16);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1;
        ctx.strokeRect(cw - 110, 12, 100, 16);
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('🛡️ ESCUDO ON', cw - 100, 24);
      }
      ctx.restore();

      // Bucle continuo
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, level, heroName]);

  // Manejo de reinicio del juego
  const startGame = () => {
    sounds.init();
    setLives(3);
    setScore(0);
    setLevel(1);
    setIsPlaying(true);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Marcador superior / HUD */}
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
        <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Contenedor del Canvas de Juego */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '450px',
        aspectRatio: '3 / 4',
        background: '#0b0818',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(168, 85, 247, 0.2)',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
        border: '2px solid rgba(168, 85, 247, 0.4)',
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

        {/* Overlay cuando no está jugando */}
        {!isPlaying && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(15, 12, 27, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h2 className="retro-title" style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#fff' }}>
              {lives <= 0 ? 'FIN DEL JUEGO' : '¡AYUDA AL RESCATE!'}
            </h2>
            <p className="modern-subtitle" style={{ fontSize: '0.9rem', marginBottom: '30px', maxWidth: '300px' }}>
              {lives <= 0 
                ? '¡Te quedaste sin vidas! Vuelve a intentarlo y esquiva los barriles.' 
                : `Esquiva los barriles del gorila para que ${heroName} pueda rescatar a su ${heroName === 'Dante' ? 'hermana Francesca' : 'hermano Dante'}.`
              }
            </p>
            <button onClick={startGame} className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.2rem' }}>
              {lives <= 0 ? <RotateCcw size={20} /> : <Play size={20} />}
              {lives <= 0 ? 'REINICIAR' : '¡JUGAR AHORA!'}
            </button>
            <div style={{ marginTop: '20px', fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'var(--font-retro)' }}>
              PC: Flechas / WASD para moverte y Espacio para saltar
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, RotateCcw, Image as ImageIcon } from 'lucide-react';
import siblingsHugImg from './siblings_hug.png';

export default function VictoryScreen({ heroName, heroFace, siblingFace, score, onRestart, onChangeFaces }) {
  const canvasRef = useRef(null);

  // Efecto de Confeti en Canvas local
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#f472b6', '#3b82f6', '#eab308', '#10b981', '#a855f7', '#ff7e5f'];
    const particleCount = 120;
    const particles = [];

    // Crear partículas de confeti
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        r: Math.random() * 6 + 4,
        d: Math.random() * height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0,
        speed: Math.random() * 3 + 2
      });
    }

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.speed;
        p.x += Math.sin(p.tiltAngle) * 0.5;
        p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

        // Dibujar confeti individual (rectángulos rotados)
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        // Si cae al suelo, reiniciar arriba
        if (p.y > height) {
          particles[idx] = {
            ...p,
            x: Math.random() * width,
            y: -20,
            tilt: Math.random() * 10 - 5,
            speed: Math.random() * 3 + 2
          };
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const siblingName = heroName === 'Dante' ? 'Francesca' : 'Dante';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden'
    }}>
      {/* Canvas de Confeti de Fondo */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Tarjeta de Victoria */}
      <div className="glass-card float-animation" style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
        background: 'rgba(26, 21, 44, 0.9)',
        border: '2px solid rgba(168, 85, 247, 0.4)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(168, 85, 247, 0.3)'
      }}>
        {/* Decoraciones Estrellas */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px', color: '#eab308' }}>
          <Sparkles size={32} className="float-animation" />
          <Sparkles size={48} style={{ transform: 'translateY(-10px)', color: '#ffd700' }} />
          <Sparkles size={32} className="float-animation" />
        </div>

        <h1 className="retro-title" style={{ fontSize: '1.6rem', color: '#ffd700', marginBottom: '10px' }}>
          ¡LOGRADO!
        </h1>
        
        <p style={{
          fontFamily: 'var(--font-retro)',
          fontSize: '0.8rem',
          color: '#10b981',
          lineHeight: '1.4rem',
          margin: '15px 0'
        }}>
          ¡{heroName.toUpperCase()} SALVÓ A {siblingName.toUpperCase()}!
        </p>

        {/* Foto de los dos hermanitos abrazados */}
        <div style={{
          position: 'relative',
          margin: '25px auto',
          maxWidth: '300px',
          borderRadius: '16px',
          border: '4px solid #f472b6',
          boxShadow: '0 0 25px rgba(244, 114, 182, 0.5), inset 0 0 20px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          backgroundColor: '#0b0818'
        }}>
          <img
            src={siblingsHugImg}
            alt="Dante y Francesca abrazados"
            style={{
              width: '100%',
              display: 'block',
              aspectRatio: '1 / 1',
              objectFit: 'cover'
            }}
          />
          {/* Pequeños avatares circulares superpuestos de las caras cargadas */}
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            border: '2px solid #3b82f6',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }}>
            <img src={heroFace} alt={heroName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            border: '2px solid #ec4899',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }}>
            <img src={siblingFace} alt={siblingName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* Puntos conseguidos */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '12px 20px',
          display: 'inline-block',
          marginBottom: '35px'
        }}>
          <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>PUNTOS LOGRADOS: </span>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: '800',
            color: '#eab308',
            fontFamily: 'var(--font-retro)'
          }}>
            {score}
          </span>
        </div>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <button onClick={onRestart} className="btn-primary" style={{ width: '100%' }}>
            <RotateCcw size={18} /> ¡JUGAR OTRA VEZ!
          </button>
          
          <button onClick={onChangeFaces} className="btn-secondary" style={{ width: '100%' }}>
            <ImageIcon size={18} /> Cambiar Fotos / Rostros
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.25); }
        }
      `}} />
    </div>
  );
}

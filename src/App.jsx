import React, { useState, useEffect } from 'react';
import FaceUploader from './components/FaceUploader';
import GameCanvas from './components/GameCanvas';
import GameControls from './components/GameControls';
import VictoryScreen from './components/VictoryScreen';
import BubbleGame from './components/BubbleGame';
import CatchGame from './components/CatchGame';
import { Keyboard, Smartphone, Gamepad2, Sparkles, Cherry } from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState('uploader'); // 'uploader', 'selection', 'game_selection', 'game'
  const [faces, setFaces] = useState({ dante: null, francesca: null });
  const [selectedHero, setSelectedHero] = useState('Dante'); // 'Dante' o 'Francesca'
  const [gameType, setGameType] = useState('rescue'); // 'rescue', 'bubbles', 'catch'
  
  // Controles de juego táctiles
  const [activeControls, setActiveControls] = useState({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false
  });

  const [score, setScore] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [forceTouchControls, setForceTouchControls] = useState(false);

  // Verificar si hay rostros guardados en localStorage al iniciar
  useEffect(() => {
    const savedDante = localStorage.getItem('game_face_dante');
    const savedFrancesca = localStorage.getItem('game_face_francesca');
    if (savedDante && savedFrancesca) {
      setFaces({ dante: savedDante, francesca: savedFrancesca });
      setScreen('selection');
    }

    // Activar controles táctiles por defecto si es dispositivo con pantalla táctil
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setForceTouchControls(isTouchDevice);
  }, []);

  const handleFacesComplete = (danteFace, francescaFace) => {
    setFaces({ dante: danteFace, francesca: francescaFace });
    setScreen('selection');
  };

  const handleStartGame = (hero) => {
    setSelectedHero(hero);
    setScreen('game_selection');
    setShowVictory(false);
  };

  const handleLaunchGame = (type) => {
    setGameType(type);
    setScreen('game');
  };

  const handleVictory = (finalScore) => {
    setScore(finalScore);
    setShowVictory(true);
  };

  const handleControlChange = (control, val) => {
    setActiveControls((prev) => ({ ...prev, [control]: val }));
  };

  const handleChangeFaces = () => {
    setShowVictory(false);
    setScreen('uploader');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      {/* Header Común en Menús */}
      {screen !== 'game' && (
        <header style={{
          padding: '20px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(15, 12, 27, 0.5)',
          backdropFilter: 'blur(8px)',
          zIndex: 5
        }}>
          <h1 style={{
            fontFamily: 'var(--font-retro)',
            fontSize: '1.2rem',
            background: 'linear-gradient(to right, #60a5fa, #f472b6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '1px'
          }}>
            ROSTROS EN AVENTURA
          </h1>
        </header>
      )}

      {/* Pantalla 1: Carga de fotos */}
      {screen === 'uploader' && (
        <FaceUploader onComplete={handleFacesComplete} />
      )}

      {/* Pantalla 2: Selección de Personaje */}
      {screen === 'selection' && (
        <div className="screen-container">
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
            <h2 className="retro-title" style={{ fontSize: '1.3rem', marginBottom: '10px' }}>
              ¿QUIÉN JUEGA?
            </h2>
            <p className="modern-subtitle" style={{ marginBottom: '35px' }}>
              Selecciona el personaje del hermano que quieres jugar
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '25px',
              marginBottom: '35px'
            }}>
              
              {/* Dante Card */}
              <div 
                onClick={() => handleStartGame('Dante')}
                style={{
                  background: 'rgba(59, 130, 246, 0.07)',
                  border: '2.5px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '24px',
                  padding: '25px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.15)'
                }}
                className="char-select-card"
              >
                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  border: '3px solid #3b82f6',
                  overflow: 'hidden',
                  marginBottom: '15px'
                }}>
                  <img src={faces.dante} alt="Dante" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.9rem', color: '#60a5fa', marginBottom: '8px' }}>
                  Dante
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                  Explora y rescata
                </p>
              </div>

              {/* Francesca Card */}
              <div 
                onClick={() => handleStartGame('Francesca')}
                style={{
                  background: 'rgba(236, 72, 153, 0.07)',
                  border: '2.5px solid rgba(236, 72, 153, 0.3)',
                  borderRadius: '24px',
                  padding: '25px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: '0 4px 15px rgba(236, 72, 153, 0.15)'
                }}
                className="char-select-card"
              >
                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  border: '3px solid #ec4899',
                  overflow: 'hidden',
                  marginBottom: '15px'
                }}>
                  <img src={faces.francesca} alt="Francesca" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.9rem', color: '#f472b6', marginBottom: '8px' }}>
                  Francesca
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                  Explora y rescata
                </p>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button onClick={handleChangeFaces} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                Cambiar Fotos / Rostros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla 2.5: Selección de Mini-juego */}
      {screen === 'game_selection' && (
        <div className="screen-container">
          <div className="glass-card" style={{ width: '100%', maxWidth: '650px', textAlign: 'center' }}>
            <h2 className="retro-title" style={{ fontSize: '1.3rem', marginBottom: '10px' }}>
              ¿QUÉ JUEGO ELEGIR?
            </h2>
            <p className="modern-subtitle" style={{ marginBottom: '30px' }}>
              Selecciona tu aventura preferida para jugar
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              
              {/* Game 1: Rescate en las Alturas */}
              <div 
                onClick={() => handleLaunchGame('rescue')}
                style={{
                  background: 'rgba(168, 85, 247, 0.07)',
                  border: '2px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '20px',
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: '0 4px 15px rgba(168, 85, 247, 0.15)'
                }}
                className="char-select-card"
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '15px',
                  color: '#c084fc'
                }}>
                  <Gamepad2 size={32} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.8rem', color: '#c084fc', marginBottom: '8px', textAlign: 'center' }}>
                  Rescate en las Alturas
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
                  Esquiva barriles del gorila y sube escaleras
                </p>
              </div>

              {/* Game 2: Burbujas Flotantes */}
              <div 
                onClick={() => handleLaunchGame('bubbles')}
                style={{
                  background: 'rgba(6, 182, 212, 0.07)',
                  border: '2px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '20px',
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: '0 4px 15px rgba(6, 182, 212, 0.15)'
                }}
                className="char-select-card"
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '15px',
                  color: '#22d3ee'
                }}>
                  <Sparkles size={32} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.8rem', color: '#22d3ee', marginBottom: '8px', textAlign: 'center' }}>
                  Burbujas Flotantes
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
                  Revienta burbujas con caras divertidas
                </p>
              </div>

              {/* Game 3: Atrapa la Fruta */}
              <div 
                onClick={() => handleLaunchGame('catch')}
                style={{
                  background: 'rgba(236, 72, 153, 0.07)',
                  border: '2px solid rgba(236, 72, 153, 0.3)',
                  borderRadius: '20px',
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: '0 4px 15px rgba(236, 72, 153, 0.15)'
                }}
                className="char-select-card"
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(236, 72, 153, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '15px',
                  color: '#f472b6'
                }}>
                  <Cherry size={32} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.8rem', color: '#f472b6', marginBottom: '8px', textAlign: 'center' }}>
                  Atrapa la Fruta
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
                  Atrapa frutas y esquiva bombas
                </p>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => setScreen('selection')} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                ← Cambiar Hermano
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla 3: El Juego */}
      {screen === 'game' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
          width: '100%',
          position: 'relative'
        }}>
          {/* Botón Volver al Menú */}
          <div style={{
            width: '100%',
            maxWidth: '450px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            padding: '0 5px'
          }}>
            <button 
              onClick={() => setScreen('game_selection')}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '50px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-modern)',
                fontWeight: '600'
              }}
            >
              ← Cambiar Juego
            </button>

            {/* Alternador manual de controles táctiles */}
            {gameType !== 'bubbles' ? (
              <button
                onClick={() => setForceTouchControls(!forceTouchControls)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: forceTouchControls ? '#a855f7' : '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.85rem'
                }}
              >
                {forceTouchControls ? <Smartphone size={16} /> : <Keyboard size={16} />}
                {forceTouchControls ? 'Controles ON' : 'Controles OFF'}
              </button>
            ) : <div />}
          </div>

          {/* Renderizado de juego según selección */}
          {gameType === 'rescue' && (
            <GameCanvas
              heroName={selectedHero}
              heroFace={selectedHero === 'Dante' ? faces.dante : faces.francesca}
              siblingFace={selectedHero === 'Dante' ? faces.francesca : faces.dante}
              onVictory={handleVictory}
              activeControls={activeControls}
            />
          )}

          {gameType === 'bubbles' && (
            <BubbleGame
              heroName={selectedHero}
              faces={faces}
              onVictory={handleVictory}
              onExit={() => setScreen('game_selection')}
            />
          )}

          {gameType === 'catch' && (
            <CatchGame
              heroName={selectedHero}
              heroFace={selectedHero === 'Dante' ? faces.dante : faces.francesca}
              onVictory={handleVictory}
              onExit={() => setScreen('game_selection')}
              activeControls={activeControls}
            />
          )}

          {/* Controles táctiles virtuales para celulares */}
          {forceTouchControls && gameType !== 'bubbles' && (
            <GameControls onControlChange={handleControlChange} />
          )}

          {/* Superposición de Pantalla de Victoria */}
          {showVictory && (
            <VictoryScreen
              heroName={selectedHero}
              heroFace={selectedHero === 'Dante' ? faces.dante : faces.francesca}
              siblingFace={selectedHero === 'Dante' ? faces.francesca : faces.dante}
              score={score}
              onRestart={() => {
                setShowVictory(false);
                setScreen('game_selection');
                setTimeout(() => handleLaunchGame(gameType), 50);
              }}
              onChangeFaces={handleChangeFaces}
            />
          )}
        </div>
      )}

      {/* Estilos embebidos para efectos en tarjetas de personajes */}
      <style dangerouslySetInnerHTML={{__html: `
        .char-select-card:hover {
          transform: translateY(-8px) scale(1.03);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 10px 30px rgba(168, 85, 247, 0.25) !important;
        }
      `}} />
    </div>
  );
}


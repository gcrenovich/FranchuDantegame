import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

export default function GameControls({ onControlChange }) {
  // Manejo de pulsado/soltado
  const handlePress = (control, value) => {
    onControlChange(control, value);
  };

  const btnStyle = {
    width: '55px',
    height: '55px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1.5px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    touchAction: 'none', // Muy importante para prevenir gestos por defecto en móviles
    transition: 'all 0.1s ease',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
  };

  const activeBtnStyle = {
    transform: 'scale(0.92)',
    background: 'rgba(168, 85, 247, 0.4)',
    borderColor: '#a855f7',
    boxShadow: '0 0 15px rgba(168, 85, 247, 0.6)'
  };

  const renderButton = (control, Icon) => {
    const handleStart = (e) => {
      e.preventDefault();
      handlePress(control, true);
    };

    const handleEnd = (e) => {
      e.preventDefault();
      handlePress(control, false);
    };

    return (
      <button
        style={btnStyle}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        aria-label={control}
      >
        <Icon size={24} />
      </button>
    );
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '450px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 10px',
      marginTop: '10px',
      background: 'rgba(26, 21, 44, 0.3)',
      borderRadius: '24px',
      border: '1px solid var(--glass-border)',
      backdropFilter: 'blur(10px)',
      gap: '15px'
    }}>
      {/* Pad de Dirección (Izquierda) */}
      <div style={{
        position: 'relative',
        width: '155px',
        height: '155px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '2px',
        alignItems: 'center',
        justifyItems: 'center'
      }}>
        <div style={{ gridColumn: '2', gridRow: '1' }}>{renderButton('up', ArrowUp)}</div>
        <div style={{ gridColumn: '1', gridRow: '2' }}>{renderButton('left', ArrowLeft)}</div>
        {/* Centro vacío */}
        <div style={{ gridColumn: '2', gridRow: '2', width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
        <div style={{ gridColumn: '3', gridRow: '2' }}>{renderButton('right', ArrowRight)}</div>
        <div style={{ gridColumn: '2', gridRow: '3' }}>{renderButton('down', ArrowDown)}</div>
      </div>

      {/* Botón de Salto (Derecha) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: '15px'
      }}>
        <button
          onTouchStart={(e) => { e.preventDefault(); handlePress('jump', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handlePress('jump', false); }}
          onMouseDown={(e) => { e.preventDefault(); handlePress('jump', true); }}
          onMouseUp={(e) => { e.preventDefault(); handlePress('jump', false); }}
          onMouseLeave={(e) => { e.preventDefault(); handlePress('jump', false); }}
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #a855f7 0%, #db2777 100%)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            color: '#fff',
            fontFamily: 'var(--font-retro)',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'none',
            boxShadow: '0 6px 20px rgba(168, 85, 247, 0.4)',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            transition: 'all 0.1s ease'
          }}
        >
          SALTAR
        </button>
      </div>
    </div>
  );
}

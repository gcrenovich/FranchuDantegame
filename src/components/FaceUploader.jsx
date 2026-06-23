import React, { useState, useRef, useEffect } from 'react';
import { Upload, Check, Trash2, ArrowRight, UserCheck } from 'lucide-react';
import { DEFAULT_DANTE, DEFAULT_FRANCESCA } from './DefaultFaces';

export default function FaceUploader({ onComplete }) {
  const [dantePhoto, setDantePhoto] = useState(null);
  const [francescaPhoto, setFrancescaPhoto] = useState(null);

  // Estados del editor activo
  const [activeChild, setActiveChild] = useState(null); // 'dante' o 'francesca'
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Cargar fotos guardadas al inicio
  useEffect(() => {
    const savedDante = localStorage.getItem('game_face_dante');
    const savedFrancesca = localStorage.getItem('game_face_francesca');
    if (savedDante) setDantePhoto(savedDante);
    if (savedFrancesca) setFrancescaPhoto(savedFrancesca);
  }, []);

  // Manejar selección de archivo
  const handleFileChange = (e, child) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setActiveChild(child);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Eventos de arrastre (Mouse & Touch)
  const handleStartDrag = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleDrag = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleEndDrag = () => {
    setIsDragging(false);
  };

  // Procesar y recortar la imagen en un círculo
  const handleSaveCrop = () => {
    if (!imageSrc) return;

    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Crear máscara circular
      ctx.beginPath();
      ctx.arc(80, 80, 80, 0, Math.PI * 2);
      ctx.clip();

      // Calcular posiciones de dibujo en base a zoom y offset
      const containerWidth = 250;
      const containerHeight = 250;

      // Escalar la imagen de acuerdo a su tamaño original y el zoom
      const ratio = Math.min(containerWidth / img.width, containerHeight / img.height);
      const drawWidth = img.width * ratio * zoom;
      const drawHeight = img.height * ratio * zoom;

      // Mapear el offset del contenedor (250x250) al canvas (160x160)
      const scaleFactor = 160 / containerWidth;
      
      const dx = (containerWidth / 2 + offset.x - drawWidth / 2) * scaleFactor;
      const dy = (containerHeight / 2 + offset.y - drawHeight / 2) * scaleFactor;

      ctx.drawImage(img, dx, dy, drawWidth * scaleFactor, drawHeight * scaleFactor);

      const croppedDataUrl = canvas.toDataURL('image/png');

      if (activeChild === 'dante') {
        setDantePhoto(croppedDataUrl);
        localStorage.setItem('game_face_dante', croppedDataUrl);
      } else {
        setFrancescaPhoto(croppedDataUrl);
        localStorage.setItem('game_face_francesca', croppedDataUrl);
      }

      // Reiniciar editor
      setActiveChild(null);
      setImageSrc(null);
    };
  };

  const handleDelete = (child) => {
    if (child === 'dante') {
      setDantePhoto(null);
      localStorage.removeItem('game_face_dante');
    } else {
      setFrancescaPhoto(null);
      localStorage.removeItem('game_face_francesca');
    }
  };

  const handleLoadDefaults = () => {
    setDantePhoto(DEFAULT_DANTE);
    setFrancescaPhoto(DEFAULT_FRANCESCA);
    localStorage.setItem('game_face_dante', DEFAULT_DANTE);
    localStorage.setItem('game_face_francesca', DEFAULT_FRANCESCA);
  };

  const handleNext = () => {
    if (dantePhoto && francescaPhoto) {
      onComplete(dantePhoto, francescaPhoto);
    }
  };

  return (
    <div className="screen-container">
      {!activeChild ? (
        <div className="glass-card" style={{ width: '100%', maxWidth: '650px', textAlign: 'center' }}>
          <h1 className="retro-title" style={{ marginBottom: '10px' }}>CARGAR ROSTROS</h1>
          <p className="modern-subtitle" style={{ marginBottom: '30px' }}>
            Sube fotos de Dante y Francesca para verlos en el juego
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px', marginBottom: '30px' }}>
            {/* Dante Card */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '2px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '20px',
              padding: '25px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}>
              <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.9rem', color: '#60a5fa', marginBottom: '15px' }}>Dante</h3>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '3px solid #3b82f6',
                background: 'rgba(0,0,0,0.4)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '15px',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
              }}>
                {dantePhoto ? (
                  <img src={dantePhoto} alt="Rostro Dante" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Upload size={40} style={{ color: 'rgba(59, 130, 246, 0.4)' }} />
                )}
              </div>

              {dantePhoto ? (
                <button 
                  onClick={() => handleDelete('dante')}
                  className="btn-secondary" 
                  style={{ padding: '8px 16px', fontSize: '0.9rem', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)' }}
                >
                  <Trash2 size={16} /> Eliminar
                </button>
              ) : (
                <label className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem', cursor: 'pointer', background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
                  <Upload size={16} /> Subir Foto
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'dante')} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {/* Francesca Card */}
            <div style={{
              background: 'rgba(236, 72, 153, 0.08)',
              border: '2px solid rgba(236, 72, 153, 0.2)',
              borderRadius: '20px',
              padding: '25px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}>
              <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.9rem', color: '#f472b6', marginBottom: '15px' }}>Francesca</h3>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '3px solid #ec4899',
                background: 'rgba(0,0,0,0.4)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '15px',
                boxShadow: '0 0 15px rgba(236, 72, 153, 0.3)'
              }}>
                {francescaPhoto ? (
                  <img src={francescaPhoto} alt="Rostro Francesca" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Upload size={40} style={{ color: 'rgba(236, 72, 153, 0.4)' }} />
                )}
              </div>

              {francescaPhoto ? (
                <button 
                  onClick={() => handleDelete('francesca')}
                  className="btn-secondary" 
                  style={{ padding: '8px 16px', fontSize: '0.9rem', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)' }}
                >
                  <Trash2 size={16} /> Eliminar
                </button>
              ) : (
                <label className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem', cursor: 'pointer', background: 'linear-gradient(135deg, #db2777, #ec4899)' }}>
                  <Upload size={16} /> Subir Foto
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'francesca')} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '10px' }}>
            <button
              onClick={handleNext}
              className="btn-primary"
              disabled={!dantePhoto || !francescaPhoto}
              style={{
                width: '100%',
                opacity: (dantePhoto && francescaPhoto) ? 1 : 0.4,
                cursor: (dantePhoto && francescaPhoto) ? 'pointer' : 'not-allowed',
              }}
            >
              Continuar al Juego <ArrowRight size={18} />
            </button>

            {(!dantePhoto || !francescaPhoto) && (
              <button
                type="button"
                onClick={handleLoadDefaults}
                className="btn-secondary"
                style={{
                  width: '100%',
                  fontSize: '0.95rem',
                  padding: '12px 24px',
                  background: 'rgba(168, 85, 247, 0.1)',
                  borderColor: 'rgba(168, 85, 247, 0.3)'
                }}
              >
                <UserCheck size={18} style={{ color: '#c084fc' }} /> Usar Personajes Ilustrados
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Editor de Recorte */
        <div className="glass-card" style={{ width: '100%', maxWidth: '450px', textAlign: 'center' }}>
          <h2 className="retro-title" style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
            Recortar Rostro ({activeChild === 'dante' ? 'Dante' : 'Francesca'})
          </h2>
          <p className="modern-subtitle" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
            Arrastra la imagen y usa el deslizador para acomodar la cara en el círculo
          </p>

          <div
            ref={containerRef}
            className="cropper-container"
            onMouseDown={handleStartDrag}
            onMouseMove={handleDrag}
            onMouseUp={handleEndDrag}
            onMouseLeave={handleEndDrag}
            onTouchStart={handleStartDrag}
            onTouchMove={handleDrag}
            onTouchEnd={handleEndDrag}
            style={{
              borderColor: activeChild === 'dante' ? '#3b82f6' : '#ec4899'
            }}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Para recortar"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease',
                pointerEvents: 'none',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
            <div 
              className="cropper-overlay"
              style={{
                borderColor: activeChild === 'dante' ? '#3b82f6' : '#ec4899'
              }}
            />
          </div>

          <div style={{ margin: '20px 0' }}>
            <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Zoom</span>
            <input
              type="range"
              min="1"
              max="4"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="scale-slider"
              style={{
                accentColor: activeChild === 'dante' ? '#3b82f6' : '#ec4899'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => {
                setActiveChild(null);
                setImageSrc(null);
              }}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveCrop}
              className="btn-primary"
              style={{
                flex: 1,
                background: activeChild === 'dante' ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'linear-gradient(135deg, #db2777, #ec4899)'
              }}
            >
              <Check size={18} /> Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getAssetUrl } from '../utils/assets';

const Hero = ({ onCandleBlown, ambientAudioPlaying, toggleAmbientAudio }) => {
  const [isBlown, setIsBlown] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [micSupported, setMicSupported] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Tiup lilin di bawah untuk memulai perayaan! 🕯️');

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const rafIdRef = useRef(null);

  // Check if getUserMedia is supported
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicSupported(false);
    }
  }, []);

  // Cleanup microphone on unmount
  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, []);

  // Trigger Confetti Explosion
  const triggerConfetti = () => {
    // 1. Center burst
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    // 2. Continuous side fireworks for 3 seconds
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  // Start Mic Listening
  const startMicrophone = async () => {
    if (isBlown) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      setMicActive(true);
      setStatusMessage('Mikrofon aktif! Silakan tiup mikrofon Anda sekarang... 💨🎙️');

      // Detection Loop
      let blowCount = 0;
      const detectBlow = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average amplitude of lower frequencies (blowing noise is mostly low freq rumble)
        let sum = 0;
        // Focus on index 0 to 15 (lower frequencies)
        const checkRange = 15;
        for (let i = 0; i < checkRange; i++) {
          sum += dataArray[i];
        }
        const average = sum / checkRange;

        // Normalize value for visual level meter (0 to 100)
        const visualLevel = Math.min((average / 255) * 100 * 2.5, 100);
        setVolumeLevel(visualLevel);

        // Blowing threshold: wind noise from blowing usually saturates low frequencies
        if (average > 65) {
          blowCount++;
          if (blowCount > 8) { // Requires ~150-200ms of sustained blow noise to avoid transient spikes
            handleBlowSuccess();
            return;
          }
        } else {
          if (blowCount > 0) blowCount--;
        }

        rafIdRef.current = requestAnimationFrame(detectBlow);
      };

      detectBlow();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setMicSupported(false);
      setMicActive(false);
      setStatusMessage('Gagal mengakses mikrofon. Silakan gunakan tombol manual.');
    }
  };

  // Stop Mic Listening
  const stopMicrophone = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setMicActive(false);
    setVolumeLevel(0);
  };

  const handleBlowSuccess = () => {
    stopMicrophone();
    setIsBlown(true);
    setStatusMessage('HBD Aqilah Permata Dinanti (Ody)! 🎉💖');
    triggerConfetti();
    if (onCandleBlown) {
      onCandleBlown();
    }
  };

  const handleManualBlow = () => {
    handleBlowSuccess();
  };

  return (
    <section id="hero" className={`section-hero ${isBlown ? 'celebrating' : ''}`}>
      <div className="hero-background-effects">
        <div className="pink-orb-1" />
        <div className="pink-orb-2" />
        {isBlown && (
          <div className="floating-elements">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="floating-heart"
                style={{
                  left: `${Math.random() * 90 + 5}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  fontSize: `${Math.random() * 15 + 15}px`
                }}
              >
                🎈
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hero-container">
        {/* Title and greetings */}
        <div className="hero-content">
          <div className="birthday-badge">
            <Sparkles size={16} className="sparkle-icon" />
            <span>Special Day - 1 Juli 2026</span>
          </div>

          <h1 className="hero-title">
            <span className="title-small">Happy Birthday</span>
            <span className="title-name animate-gradient">Aqilah Permata Dinanti</span>
            <span className="title-nick">(Ody)</span>
          </h1>

          <p className="hero-status-text">{statusMessage}</p>

          {/* Blow Controls Panel */}
          {!isBlown && (
            <div className="blow-controls-panel">
              {micSupported ? (
                <div className="mic-detector-wrapper">
                  {!micActive ? (
                    <button onClick={startMicrophone} className="control-btn mic-start-btn">
                      <Mic size={18} /> Aktifkan Mikrofon Tiup 🎙️
                    </button>
                  ) : (
                    <div className="mic-listening-mode">
                      <button onClick={stopMicrophone} className="control-btn mic-stop-btn">
                        <MicOff size={18} /> Matikan Detektor
                      </button>

                      {/* Visual Volume Meter */}
                      <div className="volume-meter-container">
                        <span className="meter-label">Volume Tiupan:</span>
                        <div className="meter-track">
                          <div
                            className="meter-fill"
                            style={{
                              width: `${volumeLevel}%`,
                              backgroundColor: volumeLevel > 60 ? '#ff4d6d' : '#ffb7c5'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mic-fallback-warning">
                  Detektor mikrofon tidak didukung di browser ini.
                </div>
              )}

              <button onClick={handleManualBlow} className="control-btn manual-blow-btn">
                Tiup Lilin Manual 🕯️
              </button>
            </div>
          )}

          {isBlown && (
            <div className="post-blow-controls">
              <div className="gift-message-card">
                <p>
                  Hari ini adalah hari istimewamu! Kami membuatkan website penuh memori ini untuk menemani hari ulang tahunmu. Scroll ke bawah untuk melihat ucapan manis, playlist lagu, dan album kenangan!
                </p>
              </div>

              {/* Ambient Music Toggle Button */}
              <button
                onClick={toggleAmbientAudio}
                className={`ambient-audio-toggle ${ambientAudioPlaying ? 'playing' : ''}`}
              >
                {ambientAudioPlaying ? (
                  <>
                    <Volume2 size={16} /> Musik Latar Aktif
                  </>
                ) : (
                  <>
                    <VolumeX size={16} /> Aktifkan Musik Latar
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Cake Video Loop wrapped in a premium glass card */}
        <div className="hero-cake-panel">
          <div 
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1.5px solid var(--glass-border)',
              borderRadius: '32px',
              boxShadow: 'var(--glass-shadow)',
              maxWidth: '444px',
              width: '100%'
            }}
          >
            <video
              src={getAssetUrl('/videos/KueUlangTahun.mp4')}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                borderRadius: '20px',
                display: 'block',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

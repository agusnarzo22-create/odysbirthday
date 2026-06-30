import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Wishes from './components/Wishes';
import SpotifyPlayer from './components/SpotifyPlayer';
import MemoryGallery from './components/MemoryGallery';
import { getAssetUrl } from './utils/assets';

const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'wishes', label: 'Wishes' },
  { id: 'spotify', label: 'Music' },
  { id: 'memories', label: 'Memories' }
];

// Ambient Background Music track URL (royalty-free soft tune)
const AMBIENT_MUSIC_URL = '/music/Berdua Saja.mp3';

function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isCandleBlown, setIsCandleBlown] = useState(false);
  const [ambientAudioPlaying, setAmbientAudioPlaying] = useState(false);

  const ambientAudioRef = useRef(null);

  // Initialize Ambient Audio object
  useEffect(() => {
    const audio = new Audio(getAssetUrl(AMBIENT_MUSIC_URL));
    audio.loop = true;
    audio.volume = 0.5; // half volume to be subtle
    ambientAudioRef.current = audio;

    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    };
  }, []);

  // Sync ambient play state
  useEffect(() => {
    if (!ambientAudioRef.current) return;

    if (ambientAudioPlaying) {
      ambientAudioRef.current.play().catch(e => {
        console.log('Audio autoplay blocked by browser policy:', e);
        setAmbientAudioPlaying(false);
      });
    } else {
      ambientAudioRef.current.pause();
    }
  }, [ambientAudioPlaying]);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observerOptions = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.5 // trigger when 50% of the section is visible
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleCandleBlown = () => {
    setIsCandleBlown(true);
    // Automatically turn on background music when cake is blown out!
    setAmbientAudioPlaying(true);
  };

  const toggleAmbientAudio = () => {
    setAmbientAudioPlaying(!ambientAudioPlaying);
  };

  return (
    <div className="app-root">
      {/* Floating Navigation Dots */}
      <Navigation activeSection={activeSection} sections={SECTIONS} />

      {/* Section 1: Hero & 3D Cake */}
      <Hero 
        onCandleBlown={handleCandleBlown}
        ambientAudioPlaying={ambientAudioPlaying}
        toggleAmbientAudio={toggleAmbientAudio}
      />

      {/* Section 2: Wishes (Chat Social Media) */}
      <Wishes />

      {/* Section 3: Music Player (Spotify Style) */}
      <SpotifyPlayer />

      {/* Section 4: Memories Gallery (Masonry Grid) */}
      <MemoryGallery />
    </div>
  );
}

export default App;

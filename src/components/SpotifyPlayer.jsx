import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Plus, Music, Trash2, Heart, Disc } from 'lucide-react';
import { addSong, getAllSongs, deleteSong } from '../utils/db';
import { getAssetUrl } from '../utils/assets';

const DEFAULT_SONGS = [
  {
    id: 'default-1',
    title: 'Berdua Saja',
    artist: 'Payung Teduh',
    url: '/music/Berdua Saja.mp3',
    coverUrl: '/images/fathur.jpeg',
    isDefault: true
  },
  {
    id: 'default-2',
    title: 'The Nights',
    artist: 'Avicii',
    url: '/music/Avicii - The Nights (Lyrics) _my father told me_.mp3',
    coverUrl: '/images/adam.jpeg',
    isDefault: true
  },
  {
    id: 'default-3',
    title: 'Unwritten',
    artist: 'Natasha Bedingfield',
    url: '/music/Natasha Bedingfield - Unwritten (Official Video) (as featured in Anyone But You).mp3',
    coverUrl: '/images/wangi.jpeg',
    isDefault: true
  },
  {
    id: 'default-4',
    title: "IQRO'",
    artist: 'Raim Laode',
    url: "/music/Raim Laode - IQRO' (official Music Video).mp3",
    coverUrl: '/images/hilal.jpeg',
    isDefault: true
  },
  {
    id: 'default-5',
    title: 'Negara Lucu',
    artist: 'eńau',
    url: '/music/eńau - Negara Lucu (Official Lyric Video).mp3',
    coverUrl: '/images/agus.jpeg',
    isDefault: true
  }
];

const SpotifyPlayer = () => {
  const [songs, setSongs] = useState(DEFAULT_SONGS);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLiked, setIsLiked] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form states for uploading custom songs
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load custom songs from IndexedDB on mount
  useEffect(() => {
    loadCustomSongs();
  }, []);

  const loadCustomSongs = async () => {
    try {
      const customSongs = await getAllSongs();
      // Format IndexedDB songs into playable URLs
      const formattedCustom = customSongs.map(song => {
        // Create an Object URL from the stored audio file Blob
        const blobUrl = URL.createObjectURL(song.audioBlob);
        return {
          id: song.id,
          title: song.title,
          artist: song.artist,
          url: blobUrl,
          coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&h=200&fit=crop', // default aesthetic cover
          isDefault: false,
          rawBlob: song.audioBlob // keep ref to clean up if deleted
        };
      });
      setSongs([...DEFAULT_SONGS, ...formattedCustom]);
    } catch (err) {
      console.error('Failed to load custom songs from DB', err);
    }
  };

  const currentSong = songs[currentSongIndex] || DEFAULT_SONGS[0];

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log('Audio playback error', e));
    }
    setIsPlaying(!isPlaying);
  };

  // Skip Forward
  const skipForward = () => {
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= songs.length) nextIndex = 0;
    setCurrentSongIndex(nextIndex);
    setIsPlaying(true);
  };

  // Skip Backward
  const skipBackward = () => {
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) prevIndex = songs.length - 1;
    setCurrentSongIndex(prevIndex);
    setIsPlaying(true);
  };

  // Select specific song
  const selectSong = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  // Handle Song File Selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewFile(file);
      // Auto-populate title if empty
      if (!newTitle) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setNewTitle(nameWithoutExt);
      }
    }
  };

  // Handle Custom Song Upload
  const handleUploadSong = async (e) => {
    e.preventDefault();
    if (!newFile || !newTitle.trim()) return;

    setIsUploading(true);
    try {
      const songData = {
        title: newTitle.trim(),
        artist: newArtist.trim() || 'Teman Ody',
        audioBlob: newFile,
        addedAt: Date.now()
      };

      await addSong(songData);

      // Reset form states
      setNewTitle('');
      setNewArtist('');
      setNewFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowUploadModal(false);

      // Reload songs list
      await loadCustomSongs();
    } catch (err) {
      alert('Gagal menyimpan lagu ke database lokal browser.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Custom Song
  const handleDeleteSong = async (e, songId, index) => {
    e.stopPropagation(); // prevent clicking the row to play
    if (confirm('Apakah kamu yakin ingin menghapus lagu ini dari playlist?')) {
      try {
        const songToDelete = songs[index];
        // Clean up Object URL
        if (!songToDelete.isDefault && songToDelete.url.startsWith('blob:')) {
          URL.revokeObjectURL(songToDelete.url);
        }

        await deleteSong(songId);

        // If current song was deleted, move index back
        if (currentSongIndex === index) {
          setIsPlaying(false);
          setCurrentSongIndex(0);
        } else if (currentSongIndex > index) {
          setCurrentSongIndex(prev => prev - 1);
        }

        await loadCustomSongs();
      } catch (err) {
        alert('Gagal menghapus lagu.');
        console.error(err);
      }
    }
  };

  // Audio effects and listeners
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // Play audio when currentSongIndex changes, if isPlaying is true
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.log('Autoplay blocked or error', e);
          setIsPlaying(false);
        });
      }
    }
  }, [currentSongIndex]);

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <section id="spotify" className="section-spotify">
      <div className="section-container">
        <h2 className="section-title">Ody's Spotify Playlist 🎵</h2>
        <p className="section-subtitle">Dengarkan lagu-lagu favorit pilihan teman dekatmu, atau unggah lagu kreasimu sendiri!</p>

        <div className="spotify-player-container">
          {/* Audio HTML element */}
          <audio
            ref={audioRef}
            src={getAssetUrl(currentSong.url)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={skipForward}
          />

          {/* Left Panel: Cover & Controls */}
          <div className="spotify-main-panel">
            <div className={`album-art-container ${isPlaying ? 'playing' : ''}`}>
              <img
                src={getAssetUrl(currentSong.coverUrl)}
                alt={currentSong.title}
                className="album-art"
              />
              <div className="disc-overlay">
                <Disc size={36} className={`spinning-disc ${isPlaying ? 'spin' : ''}`} />
              </div>
            </div>

            <div className="track-details">
              <div className="track-text">
                <h3 className="track-title">{currentSong.title}</h3>
                <p className="track-artist">{currentSong.artist}</p>
              </div>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`like-btn ${isLiked ? 'liked' : ''}`}
                aria-label="Like song"
              >
                <Heart size={20} fill={isLiked ? '#ff4d6d' : 'none'} stroke={isLiked ? '#ff4d6d' : '#888'} />
              </button>
            </div>

            {/* Seek Bar */}
            <div className="progress-container">
              <span className="time-text">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="seek-slider"
              />
              <span className="time-text">{formatTime(duration)}</span>
            </div>

            {/* Control Buttons */}
            <div className="playback-controls">
              <button onClick={skipBackward} className="ctrl-btn" aria-label="Previous song">
                <SkipBack size={22} />
              </button>
              <button onClick={togglePlay} className="play-pause-btn" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause size={24} fill="#fff" /> : <Play size={24} fill="#fff" style={{ marginLeft: '4px' }} />}
              </button>
              <button onClick={skipForward} className="ctrl-btn" aria-label="Next song">
                <SkipForward size={22} />
              </button>
            </div>

            {/* Volume Control */}
            <div className="volume-container">
              <Volume2 size={16} className="volume-icon" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
              />
            </div>
          </div>

          {/* Right Panel: Playlist Table */}
          <div className="spotify-playlist-panel">
            <div className="playlist-header">
              <h4>Playlist Antrean</h4>
              <button
                className="add-song-trigger-btn"
                onClick={() => setShowUploadModal(true)}
              >
                <Plus size={16} /> Tambah Lagu
              </button>
            </div>

            <div className="playlist-list-wrapper">
              <div className="playlist-list">
                {songs.map((song, index) => {
                  const isCurrent = index === currentSongIndex;
                  return (
                    <div
                      key={song.id}
                      className={`playlist-item ${isCurrent ? 'active' : ''}`}
                      onClick={() => selectSong(index)}
                    >
                      <div className="item-left">
                        <div className="item-icon-wrapper">
                          {isCurrent && isPlaying ? (
                            <div className="music-bars">
                              <span className="bar bar1" />
                              <span className="bar bar2" />
                              <span className="bar bar3" />
                            </div>
                          ) : (
                            <Music size={16} className="music-node" />
                          )}
                        </div>
                        <div className="item-meta">
                          <span className="item-title">{song.title}</span>
                          <span className="item-artist">{song.artist}</span>
                        </div>
                      </div>
                      <div className="item-right">
                        {!song.isDefault && (
                          <button
                            className="delete-song-btn"
                            onClick={(e) => handleDeleteSong(e, song.id, index)}
                            title="Hapus lagu"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <span className="item-duration">Local</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Modal (Glassmorphism Modal) */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Tambah Lagu ke Playlist 🎵</h3>
              <p className="modal-desc">
                Pilih file `.mp3` dari komputermu. File ini disimpan sepenuhnya secara privat di browser Ody!
              </p>

              <form onSubmit={handleUploadSong} className="upload-form">
                <div className="form-group">
                  <label htmlFor="song-title">Judul Lagu *</label>
                  <input
                    id="song-title"
                    type="text"
                    required
                    placeholder="Contoh: Lagu Kenangan Kita"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="song-artist">Artis / Nama Pengirim</label>
                  <input
                    id="song-artist"
                    type="text"
                    placeholder="Contoh: Rian & Sarah"
                    value={newArtist}
                    onChange={(e) => setNewArtist(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="song-file">Pilih Audio File (.mp3)*</label>
                  <input
                    id="song-file"
                    type="file"
                    accept="audio/mp3,audio/*"
                    required
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setShowUploadModal(false)}
                    disabled={isUploading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="modal-submit-btn"
                    disabled={isUploading || !newFile || !newTitle.trim()}
                  >
                    {isUploading ? 'Menyimpan...' : 'Tambahkan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SpotifyPlayer;

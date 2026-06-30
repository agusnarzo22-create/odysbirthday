import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Trash2, Heart, Calendar, User } from 'lucide-react';
import { addMemory, getAllMemories, deleteMemory } from '../utils/db';

const DEFAULT_MEMORIES = [
  {
    id: 'default-m1',
    imageUrl: '/images/memory/foto1.jpeg',
    caption: 'Kayakna TSM ini deh, kulupai juga',
    sender: 'Hilal',
    date: 'Unknown',
    isDefault: true
  },
  {
    id: 'default-m2',
    imageUrl: '/images/memory/foto3.jpeg',
    caption: 'Pameran Lukisan Partam kala itu',
    sender: 'Agus',
    date: 'Unknown',
    isDefault: true
  },
  {
    id: 'default-m3',
    imageUrl: '/images/memory/foto2.jpeg',
    caption: 'Parah ndk ngajak guweh (Agus)',
    sender: 'Wangih',
    date: 'Unknown',
    isDefault: true
  },
  {
    id: 'default-m4',
    imageUrl: '/images/memory/foto4.jpeg',
    caption: 'Pintu Finance Talk, mayan cuy dapat Bitcoin 50K',
    sender: 'Hilal',
    date: 'Unknown',
    isDefault: true
  },
  {
    id: 'default-m5',
    imageUrl: '/images/memory/foto5.jpeg',
    caption: 'Ngang-ngong ngang-ngong dikelas with Hilal and Adams',
    sender: 'Hilal',
    date: 'Unknown',
    isDefault: true
  },
  {
    id: 'default-m6',
    imageUrl: '/images/memory/foto6.jpeg',
    caption: 'Last time in Tempa Semester 1',
    sender: 'Hilal',
    date: 'Unknown',
    isDefault: true
  },
  {
    id: 'default-m7',
    imageUrl: '/images/memory/foto7.jpeg',
    caption: 'Makan-makan with all in Odys House',
    sender: 'Hilal',
    date: 'Unknown',
    isDefault: true
  },
  {
    id: 'default-m8',
    imageUrl: '/images/memory/foto8.jpeg',
    caption: 'Pas masih gadis',
    sender: 'Hilal',
    date: 'Unknown',
    isDefault: true
  },
  {
    id: 'default-m9',
    imageUrl: '/images/memory/foto9.jpeg',
    caption: 'Tempa with gurllss ✨',
    sender: 'Fauziah',
    date: 'Unknown',
    isDefault: true
  },
  {
    id: 'default-m10',
    imageUrl: '/images/memory/foto10.jpeg',
    caption: 'Photoboth ala ala with Uci! 🌸',
    sender: 'Fauziah',
    date: 'Unknown',
    isDefault: true
  },
  {
    id: 'default-m11',
    imageUrl: '/images/memory/foto11.jpeg',
    caption: 'Uci time! ❤️',
    sender: 'Fauziah',
    date: 'Unknown',
    isDefault: true
  },
  {
    id: 'default-m12',
    imageUrl: '/images/memory/foto12.jpeg',
    caption: 'Vintage gurl! 🌟',
    sender: 'Fauziah',
    date: 'Unknown',
    isDefault: true
  },
  {
    id: 'default-m13',
    imageUrl: '/images/memory/foto13.jpeg',
    caption: 'Ngerinya kelas A25! 📸',
    sender: 'Fauziah',
    date: 'Unknown',
    isDefault: true
  }
];

const MemoryGallery = () => {
  const [memories, setMemories] = useState(DEFAULT_MEMORIES);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [likedPhotos, setLikedPhotos] = useState({});

  // Form states for uploading custom memories
  const [newCaption, setNewCaption] = useState('');
  const [newSender, setNewSender] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadCustomMemories();
  }, []);

  const loadCustomMemories = async () => {
    try {
      const customMemories = await getAllMemories();
      const formattedCustom = customMemories.map(m => {
        const imageUrl = URL.createObjectURL(m.imageBlob);
        const formattedDate = new Date(m.addedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        return {
          id: m.id,
          imageUrl: imageUrl,
          caption: m.caption,
          sender: m.sender,
          date: formattedDate,
          isDefault: false,
          rawBlob: m.imageBlob
        };
      });
      setMemories([...DEFAULT_MEMORIES, ...formattedCustom]);
    } catch (err) {
      console.error('Failed to load memories from IndexedDB', err);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadMemory = async (e) => {
    e.preventDefault();
    if (!newImage || !newCaption.trim()) return;

    setIsUploading(true);
    try {
      const memoryData = {
        imageBlob: newImage,
        caption: newCaption.trim(),
        sender: newSender.trim() || 'Teman Ody',
        addedAt: Date.now()
      };

      await addMemory(memoryData);

      // Reset
      setNewCaption('');
      setNewSender('');
      setNewImage(null);
      setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowUploadModal(false);

      // Reload
      await loadCustomMemories();
    } catch (err) {
      alert('Gagal mengunggah foto ke database lokal.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMemory = async (e, memoryId, index) => {
    e.stopPropagation();
    if (confirm('Apakah kamu yakin ingin menghapus foto kenangan ini?')) {
      try {
        const memoryToDelete = memories[index];
        // Clean up Object URL
        if (!memoryToDelete.isDefault && memoryToDelete.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(memoryToDelete.imageUrl);
        }

        await deleteMemory(memoryId);

        // Close lightbox if open on this photo
        if (selectedPhoto && selectedPhoto.id === memoryId) {
          setSelectedPhoto(null);
        }

        await loadCustomMemories();
      } catch (err) {
        alert('Gagal menghapus foto.');
        console.error(err);
      }
    }
  };

  const toggleLike = (e, photoId) => {
    e.stopPropagation();
    setLikedPhotos(prev => ({
      ...prev,
      [photoId]: !prev[photoId]
    }));
  };

  return (
    <section id="memories" className="section-memories">
      <div className="section-container">
        <h2 className="section-title">Memory Board 📸</h2>
        <p className="section-subtitle">Galeri album kenangan untukmu</p>

        <div className="gallery-toolbar">
          <button
            className="add-memory-btn"
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={18} /> Unggah Foto Kenangan Baru
          </button>
        </div>

        {/* Masonry Grid */}
        <div className="masonry-gallery">
          {memories.map((m, index) => (
            <div
              key={m.id}
              className="gallery-item"
              onClick={() => setSelectedPhoto({ ...m, index })}
            >
              <img src={m.imageUrl} alt={m.caption} className="gallery-img" />

              <div className="gallery-overlay">
                <p className="gallery-caption-overlay">{m.caption}</p>
                <div className="gallery-meta-overlay">
                  <span className="gallery-sender-badge">
                    <User size={12} style={{ marginRight: '4px' }} />
                    {m.sender}
                  </span>

                  <div className="gallery-actions">
                    <button
                      onClick={(e) => toggleLike(e, m.id)}
                      className={`gallery-icon-btn heart-icon ${likedPhotos[m.id] ? 'liked' : ''}`}
                    >
                      <Heart size={14} fill={likedPhotos[m.id] ? '#ff4d6d' : 'none'} stroke={likedPhotos[m.id] ? '#ff4d6d' : '#fff'} />
                    </button>
                    {!m.isDefault && (
                      <button
                        onClick={(e) => handleDeleteMemory(e, m.id, index)}
                        className="gallery-icon-btn delete-icon"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedPhoto && (
          <div className="lightbox-overlay" onClick={() => setSelectedPhoto(null)}>
            <button className="lightbox-close" onClick={() => setSelectedPhoto(null)}>
              <X size={28} />
            </button>

            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <div className="lightbox-img-wrapper">
                <img src={selectedPhoto.imageUrl} alt={selectedPhoto.caption} className="lightbox-img" />
              </div>

              <div className="lightbox-details">
                <div className="lightbox-meta">
                  <span className="lightbox-sender">
                    <User size={16} />
                    Pengirim: <strong>{selectedPhoto.sender}</strong>
                  </span>
                  <span className="lightbox-date">
                    <Calendar size={16} />
                    {selectedPhoto.date}
                  </span>
                </div>
                <p className="lightbox-caption">{selectedPhoto.caption}</p>

                <div className="lightbox-actions">
                  <button
                    onClick={(e) => toggleLike(e, selectedPhoto.id)}
                    className={`lightbox-like-btn ${likedPhotos[selectedPhoto.id] ? 'active' : ''}`}
                  >
                    <Heart size={18} fill={likedPhotos[selectedPhoto.id] ? '#ff4d6d' : 'none'} stroke={likedPhotos[selectedPhoto.id] ? '#ff4d6d' : 'currentColor'} />
                    {likedPhotos[selectedPhoto.id] ? 'Tersimpan di Hati' : 'Sukai Foto'}
                  </button>

                  {!selectedPhoto.isDefault && (
                    <button
                      onClick={(e) => {
                        handleDeleteMemory(e, selectedPhoto.id, selectedPhoto.index);
                      }}
                      className="lightbox-delete-btn"
                    >
                      <Trash2 size={18} /> Hapus Foto
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Memory Modal */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Unggah Foto Kenangan Baru 📸</h3>
              <p className="modal-desc">
                Pilih foto kenangan terbaikmu bersama Ody. Foto akan disimpan di penyimpanan browser lokal miliknya.
              </p>

              <form onSubmit={handleUploadMemory} className="upload-form">
                <div className="form-group">
                  <label htmlFor="mem-sender">Nama Pengirim</label>
                  <input
                    id="mem-sender"
                    type="text"
                    placeholder="Contoh: Amanda / Budi"
                    value={newSender}
                    onChange={(e) => setNewSender(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mem-caption">Deskripsi / Cerita Singkat Kenangan *</label>
                  <textarea
                    id="mem-caption"
                    rows="3"
                    required
                    placeholder="Tulis cerita manis di balik foto ini..."
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mem-file">Pilih Gambar *</label>
                  <input
                    id="mem-file"
                    type="file"
                    accept="image/*"
                    required
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </div>

                {imagePreview && (
                  <div className="image-upload-preview">
                    <span className="preview-label">Pratinjau Foto:</span>
                    <img src={imagePreview} alt="Preview" className="img-preview" />
                  </div>
                )}

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
                    disabled={isUploading || !newImage || !newCaption.trim()}
                  >
                    {isUploading ? 'Mengunggah...' : 'Simpan Kenangan'}
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

export default MemoryGallery;

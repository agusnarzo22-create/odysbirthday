const DB_NAME = 'ody_birthday_db';
const DB_VERSION = 1;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject('Failed to open database');
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('songs')) {
        db.createObjectStore('songs', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('memories')) {
        db.createObjectStore('memories', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const addSong = async (song) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['songs'], 'readwrite');
    const store = transaction.objectStore('songs');
    const request = store.add(song);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Failed to add song');
  });
};

export const getAllSongs = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['songs'], 'readonly');
    const store = transaction.objectStore('songs');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Failed to fetch songs');
  });
};

export const deleteSong = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['songs'], 'readwrite');
    const store = transaction.objectStore('songs');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject('Failed to delete song');
  });
};

export const addMemory = async (memory) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['memories'], 'readwrite');
    const store = transaction.objectStore('memories');
    const request = store.add(memory);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Failed to add memory');
  });
};

export const getAllMemories = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['memories'], 'readonly');
    const store = transaction.objectStore('memories');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Failed to fetch memories');
  });
};

export const deleteMemory = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['memories'], 'readwrite');
    const store = transaction.objectStore('memories');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject('Failed to delete memory');
  });
};

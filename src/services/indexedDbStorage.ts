/**
 * Layer penyimpanan terisolasi untuk aset berukuran besar (IndexedDB)
 * Mencegah QuotaExceededError pada LocalStorage browser.
 */

const DB_NAME = 'SMPIT_Bunayya_Persuratan_DB';
const DB_VERSION = 1;
const STORE_NAME = 'assets';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('Browser ini tidak mendukung IndexedDB.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e: any) => {
      const db = e.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Gagal membuka IndexedDB.'));
    };
  });
}

export const IndexedDBStorage = {
  async setItem(key: string, value: string): Promise<boolean> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);

        req.onsuccess = () => resolve(true);
        req.onerror = () => {
          console.warn(`IndexedDB put failed for key ${key}:`, req.error);
          resolve(false);
        };
      });
    } catch (err) {
      console.warn('IndexedDB unavailable, falling back to localStorage:', err);
      try {
        localStorage.setItem(`idb_fallback_${key}`, value);
        return true;
      } catch (e) {
        console.error('LocalStorage fallback also failed:', e);
        return false;
      }
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          if (req.result !== undefined) {
            resolve(req.result);
          } else {
            // Check fallback
            resolve(localStorage.getItem(`idb_fallback_${key}`));
          }
        };
        req.onerror = () => {
          resolve(localStorage.getItem(`idb_fallback_${key}`));
        };
      });
    } catch {
      return localStorage.getItem(`idb_fallback_${key}`);
    }
  },

  async removeItem(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(`idb_fallback_${key}`);
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },
};

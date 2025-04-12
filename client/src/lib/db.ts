import { LotteryDraw, LotteryCategory } from "@shared/schema";

// Database name and store
const DB_NAME = 'systemE-lottery';
const DB_VERSION = 1;
const DRAWS_STORE = 'draws';

// Interface for the database structure
interface LotteryDB {
  draws: LotteryDraw[];
}

// Database initialization
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(event);
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create the draws store with an id as key path
      if (!db.objectStoreNames.contains(DRAWS_STORE)) {
        const store = db.createObjectStore(DRAWS_STORE, { keyPath: 'id' });
        
        // Create indexes for quick searches
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('drawDate', 'drawDate', { unique: false });
        store.createIndex('balls', ['ball1', 'ball2', 'ball3', 'ball4', 'ball5'], { unique: false });
      }
    };
  });
};

// Generic function to open a database transaction
const openTransaction = (
  mode: IDBTransactionMode = 'readonly'
): Promise<{ 
  db: IDBDatabase; 
  transaction: IDBTransaction; 
  store: IDBObjectStore; 
}> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(DRAWS_STORE, mode);
      const store = transaction.objectStore(DRAWS_STORE);
      
      resolve({ db, transaction, store });
    } catch (error) {
      reject(error);
    }
  });
};

// Add a new draw
export const addDraw = (draw: LotteryDraw): Promise<LotteryDraw> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { transaction, store } = await openTransaction('readwrite');
      
      const request = store.add(draw);
      
      request.onsuccess = () => {
        resolve(draw);
      };
      
      request.onerror = (event) => {
        reject(event);
      };
      
      transaction.oncomplete = () => {
        // Transaction completed
      };
    } catch (error) {
      reject(error);
    }
  });
};

// Get all draws for a category
export const getDrawsByCategory = (category: LotteryCategory): Promise<LotteryDraw[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { transaction, store } = await openTransaction();
      const index = store.index('category');
      const request = index.getAll(category);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(event);
      };
    } catch (error) {
      reject(error);
    }
  });
};

// Delete a draw by id
export const deleteDraw = (id: number): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { transaction, store } = await openTransaction('readwrite');
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(event);
      };
    } catch (error) {
      reject(error);
    }
  });
};

// Delete all draws for a category
export const deleteAllDrawsByCategory = (category: LotteryCategory): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // First get all draws for the category to find their IDs
      const draws = await getDrawsByCategory(category);
      
      if (draws.length === 0) {
        resolve();
        return;
      }
      
      const { transaction, store } = await openTransaction('readwrite');
      
      // Delete each draw
      let deletedCount = 0;
      
      for (const draw of draws) {
        const request = store.delete(draw.id);
        
        request.onsuccess = () => {
          deletedCount++;
          if (deletedCount === draws.length) {
            resolve();
          }
        };
        
        request.onerror = (event) => {
          reject(event);
        };
      }
      
      transaction.oncomplete = () => {
        // Transaction completed
      };
    } catch (error) {
      reject(error);
    }
  });
};

// Sync offline data with the server
export const syncWithServer = async (): Promise<void> => {
  // This function would sync data between IndexedDB and the server
  // when the app comes back online
};

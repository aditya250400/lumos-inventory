const DB_NAME = 'lumos-tool-drafts';
const STORE_NAME = 'new-images';
const DB_VERSION = 1;

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'draftKey' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * images: [{ key, name, type, blob, isPrimary }]
 * Disimpen sebagai Blob + metadata (name, type) biar bisa direkonstruksi jadi
 * File lagi pas di-restore (Blob polos gak nyimpen nama file).
 */
export async function saveDraftImages(draftKey, images) {
    try {
        const db = await openDb();
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put({ draftKey, images });
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    } catch {
        // IndexedDB gagal (mode private browsing, dsb) -> draft foto cuma "nice to have",
        // biarin gagal diam-diam, jangan sampai bikin form utama ikut error.
        return false;
    }
}

export async function getDraftImages(draftKey) {
    try {
        const db = await openDb();
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const request = tx.objectStore(STORE_NAME).get(draftKey);
            request.onsuccess = () => resolve(request.result?.images ?? []);
            request.onerror = () => reject(request.error);
        });
    } catch {
        return [];
    }
}

export async function clearDraftImages(draftKey) {
    try {
        const db = await openDb();
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).delete(draftKey);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    } catch {
        return false;
    }
}

/** Blob -> File lagi (dipakai pas restore draft ke form) */
export function blobToFile(blob, name, type) {
    return new File([blob], name, { type });
}

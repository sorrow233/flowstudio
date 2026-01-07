import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    writeBatch,
    deleteDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/services/firebase';

class CloudDataService {
    constructor() {
        // We don't cache items here because we rely on React Query cache
    }

    _getUser() {
        return auth.currentUser;
    }

    _getCollectionRef() {
        const user = this._getUser();
        if (!user) throw new Error("User not authenticated");
        return collection(db, 'users', user.uid, 'projects');
    }

    async init() {
        const user = this._getUser();
        if (!user) return;

        // Migration Logic
        const userDocRef = doc(db, 'users', user.uid);
        try {
            const legacySnap = await getDoc(userDocRef);
            if (legacySnap.exists() && legacySnap.data().items) {
                console.log("[CloudDataService] Migrating legacy array data to sub-collection...");
                const legacyItems = legacySnap.data().items;
                console.log(`[CloudDataService] Found ${legacyItems.length} legacy items`);
                const batch = writeBatch(db);
                const projectsColRef = this._getCollectionRef();

                legacyItems.forEach(item => {
                    const itmRef = doc(projectsColRef, item.id.toString());
                    batch.set(itmRef, {
                        ...item,
                        updatedAt: item.updatedAt || new Date().toISOString()
                    }, { merge: true });
                });
                // Clear legacy items field
                batch.update(userDocRef, { items: null });
                await batch.commit();
                console.log("[CloudDataService] Migration complete.");
            }
        } catch (e) {
            console.error("[CloudDataService] Migration failed", e);
        }
    }

    async getItems() {
        console.log('[CloudDataService] Fetching items...');
        const colRef = this._getCollectionRef();
        const snapshot = await getDocs(colRef);
        console.log(`[CloudDataService] Fetched ${snapshot.docs.length} items`);
        const items = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                // Convert Firestore Timestamp to ISO string if needed, or keep as is?
                // Frontend expects standard dates or strings. Let's normalize to ISO string for consistency with LocalService?
                // Or just keep it as is and let UI handle it. 
                // ProjectContext used to convert timestamps. Let's convert to ensure consistent format across app.
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
            };
        });

        return items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    async addItem(item) {
        console.log('[CloudDataService] Adding item:', item);
        const colRef = this._getCollectionRef();
        // Use provided ID or generate one. ProjectContext used uuidv4(), let's respect that if passed.
        // If not passed, use doc().id
        const docRef = item.id ? doc(colRef, item.id.toString()) : doc(colRef);

        const newItem = {
            ...item,
            id: docRef.id,
            createdAt: serverTimestamp(), // Use server timestamp for cloud
            updatedAt: serverTimestamp()
        };

        await setDoc(docRef, newItem);

        // Return with local estimate of timestamp until re-fetched
        return {
            ...newItem,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    async updateItem(id, updates) {
        console.log('[CloudDataService] Updating item:', id, updates);
        const colRef = this._getCollectionRef();
        const docRef = doc(colRef, id.toString());

        const payload = {
            ...updates,
            updatedAt: serverTimestamp()
        };

        await setDoc(docRef, payload, { merge: true });
        return { id, ...updates, updatedAt: new Date().toISOString() };
    }

    async deleteItem(id) {
        console.log('[CloudDataService] Deleting item:', id);
        const colRef = this._getCollectionRef();
        const docRef = doc(colRef, id.toString());
        await deleteDoc(docRef);
    }
}

export const cloudDataService = new CloudDataService();

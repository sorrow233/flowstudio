import { v4 as uuidv4 } from 'uuid';

const SYNC_KEY = 'flow_items_v2';
const LEGACY_SYNC_KEY = 'flow_items';

class LocalDataService {
    constructor() {
        this.items = [];
    }

    async init() {
        const saved = localStorage.getItem(SYNC_KEY);
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse local items", e);
                this.items = [];
            }
        } else {
            // Check legacy
            const legacy = localStorage.getItem(LEGACY_SYNC_KEY);
            if (legacy) {
                try {
                    const legacyData = JSON.parse(legacy).map(item => ({
                        ...item,
                        updatedAt: item.updatedAt || new Date().toISOString()
                    }));
                    this.items = legacyData;
                    this._persist();
                } catch (e) {
                    console.error(e);
                    this.items = [];
                }
            }
        }
        return Promise.resolve(this.items);
    }

    async getItems() {
        // Always ensure we have fresh data from storage in case of multi-tab (though not perfect without storage event listener)
        // For simplicity, we just rely on what we loaded or reload if we want strictness.
        // But for "Guest" mode, simplified reload is better.
        await this.init();
        return this.items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    async addItem(item) {
        const newItem = {
            ...item,
            id: item.id || uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.items = [...this.items, newItem];
        this._persist();
        return newItem;
    }

    async updateItem(id, updates) {
        const timestamp = new Date().toISOString();
        this.items = this.items.map(i =>
            i.id === id ? { ...i, ...updates, updatedAt: timestamp } : i
        );
        this._persist();
        return this.items.find(i => i.id === id);
    }

    async deleteItem(id) {
        this.items = this.items.filter(i => i.id !== id);
        this._persist();
    }

    _persist() {
        localStorage.setItem(SYNC_KEY, JSON.stringify(this.items));
    }
}

export const localDataService = new LocalDataService();

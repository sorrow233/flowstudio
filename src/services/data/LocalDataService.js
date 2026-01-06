import { v4 as uuidv4 } from 'uuid';

const SYNC_KEY = 'flow_items_v2';
const LEGACY_SYNC_KEY = 'flow_items';

class LocalDataService {
    constructor() {
        this.items = [];
        this._initialized = false;
    }

    async init() {
        if (this._initialized) return this.items;

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
        this._initialized = true;
        return this.items;
    }

    async getItems() {
        if (!this._initialized) {
            await this.init();
        }
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

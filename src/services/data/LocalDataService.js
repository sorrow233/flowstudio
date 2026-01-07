import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@/utils/logger';

const SYNC_KEY = 'flow_items_v2';
const LEGACY_SYNC_KEY = 'flow_items';

class LocalDataService {
    constructor() {
        this.items = [];
        this._initialized = false;
    }

    async init() {
        if (this._initialized) return this.items;

        Logger.info('LocalDataService', 'Initializing...');
        const saved = localStorage.getItem(SYNC_KEY);
        if (saved) {
            try {
                this.items = JSON.parse(saved);
                Logger.info('LocalDataService', `Loaded ${this.items.length} items from ${SYNC_KEY}`);
            } catch (e) {
                Logger.error('LocalDataService', 'Failed to parse local items', e);
                this.items = [];
            }
        } else {
            // Check legacy
            const legacy = localStorage.getItem(LEGACY_SYNC_KEY);
            if (legacy) {
                Logger.info('LocalDataService', 'Found legacy items, migrating...');
                try {
                    const legacyData = JSON.parse(legacy).map(item => ({
                        ...item,
                        updatedAt: item.updatedAt || new Date().toISOString()
                    }));
                    this.items = legacyData;
                    this._persist();
                    Logger.info('LocalDataService', `Migrated ${legacyData.length} items`);
                } catch (e) {
                    Logger.error('LocalDataService', 'Legacy migration error', e);
                    this.items = [];
                }
            } else {
                Logger.info('LocalDataService', 'No existing data found');
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
        Logger.info('LocalDataService', 'Adding item:', item);
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
        Logger.info('LocalDataService', 'Updating item:', id, updates);
        const timestamp = new Date().toISOString();
        this.items = this.items.map(i =>
            i.id === id ? { ...i, ...updates, updatedAt: timestamp } : i
        );
        this._persist();
        return this.items.find(i => i.id === id);
    }

    async deleteItem(id) {
        Logger.info('LocalDataService', 'Deleting item:', id);
        this.items = this.items.filter(i => i.id !== id);
        this._persist();
    }

    _persist() {
        localStorage.setItem(SYNC_KEY, JSON.stringify(this.items));
    }
}

export const localDataService = new LocalDataService();

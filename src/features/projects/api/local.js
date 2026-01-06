const STORAGE_KEY = 'flow_items_v2'; // Same key as before to keep guest data

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getLocalItems = () => {
    try {
        const item = localStorage.getItem(STORAGE_KEY);
        return item ? JSON.parse(item) : [];
    } catch (e) {
        console.error("Error reading from local storage", e);
        return [];
    }
};

const setLocalItems = (items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const fetchProjects = async () => {
    // Simulate async network request
    await delay(100);
    return getLocalItems();
};

export const addProject = async (_, project) => {
    await delay(50);
    const items = getLocalItems();
    // Check if exists? Usually addProject implies new, but we might want upsert behavior
    const exists = items.find(i => i.id === project.id);
    let nextItems;

    if (exists) {
        nextItems = items.map(i => i.id === project.id ? project : i);
    } else {
        nextItems = [...items, project];
    }

    setLocalItems(nextItems);
    return project;
};

export const updateProject = async (_, projectId, updates) => {
    await delay(50);
    const items = getLocalItems();
    const nextItems = items.map(item => {
        if (item.id === projectId) {
            return {
                ...item,
                ...updates,
                updatedAt: new Date().toISOString()
            };
        }
        return item;
    });
    setLocalItems(nextItems);
};

export const deleteProject = async (_, projectId) => {
    await delay(50);
    const items = getLocalItems();
    const nextItems = items.filter(i => i.id !== projectId);
    setLocalItems(nextItems);
};

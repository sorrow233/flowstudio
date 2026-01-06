import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from '@/services/firebase';

const COLLECTION = 'projects';

/**
 * Fetch all projects for a user from Firestore
 * @param {string} userId 
 * @returns {Promise<Array>} List of projects
 */
export const fetchProjects = async (userId) => {
    if (!userId) throw new Error("User ID required");

    // We fetch from users/{userId}/projects
    const projectsRef = collection(db, 'users', userId, COLLECTION);
    // Determine sort order if needed, otherwise client-side sort
    const q = query(projectsRef); // can add orderBy('createdAt') if indexed

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        // Convert Timestamps to dates/strings if needed here, 
        // or let the UI handle it. For consistency with LocalStorage, 
        // serializing to ISO string might be safer for now.
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
    }));
};

/**
 * Add or overwrite a project
 * @param {string} userId 
 * @param {object} project 
 */
export const addProject = async (userId, project) => {
    if (!userId) throw new Error("User ID required");

    const projectRef = doc(db, 'users', userId, COLLECTION, project.id);
    await setDoc(projectRef, {
        ...project,
        updatedAt: serverTimestamp(), // Use server timestamp for consistency
        createdAt: project.createdAt || new Date().toISOString()
    });

    return project;
};

/**
 * Update an existing project
 * @param {string} userId 
 * @param {string} projectId 
 * @param {object} updates 
 */
export const updateProject = async (userId, projectId, updates) => {
    if (!userId) throw new Error("User ID required");

    const projectRef = doc(db, 'users', userId, COLLECTION, projectId);
    await setDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
    }, { merge: true });
};

/**
 * Delete a project
 * @param {string} userId 
 * @param {string} projectId 
 */
export const deleteProject = async (userId, projectId) => {
    if (!userId) throw new Error("User ID required");

    const projectRef = doc(db, 'users', userId, COLLECTION, projectId);
    await deleteDoc(projectRef);
};

// src/appwrite_watchlist.js
import { Client, Databases, Account, ID, Query } from 'appwrite';

const client = new Client();

// --- Configuration ---
client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // Uses .env.local
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // Uses .env.local

const databases = new Databases(client);
const account = new Account(client);

// --- Appwrite Database and Collection IDs from .env.local ---
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const WATCHLIST_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_FAVORITES_COLLECTION_ID; // Use your favorites collection ID

// --- User Authentication Functions (No changes needed here as they use 'account' object) ---
export const getCurrentUser = async () => {
    try {
        return await account.get();
    } catch (error) {
        if (error.code === 401) { // User is not logged in
            return null;
        }
        console.error("Error getting current user:", error);
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        await account.createEmailPasswordSession(email, password);
        return true;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const register = async (email, password, name) => {
    try {
        await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password); // Log in after registration
        return true;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await account.deleteSession('current');
        return true;
    } catch (error) {
        console.error("Logout failed:", error);
        throw error;
    }
};

// --- Watchlist Functions (UPDATED TO MATCH YOUR APPWRITE SCHEMA) ---

/**
 * Adds a movie to the user's watchlist.
 * @param {string} userId - The ID of the current user.
 * @param {object} movie - The movie object from OMDB API.
 */
export const addMovieToWatchlist = async (userId, movie) => {
    try {
        return await databases.createDocument(
            DATABASE_ID,
            WATCHLIST_COLLECTION_ID,
            ID.unique(),
            {
                user_id: userId, // <-- Corrected: matches Appwrite schema 'user_id'
                movie_imdb_id: movie.imdbID, // <-- Corrected: matches Appwrite schema 'movie_imdb_id'
                movie_title: movie.Title,    // <-- Corrected: matches Appwrite schema 'movie_title'
                movie_poster: movie.Poster !== 'N/A' ? movie.Poster : './fallback.png', // <-- Corrected: matches Appwrite schema 'movie_poster'
                movie_year: movie.Year       // <-- Corrected: matches Appwrite schema 'movie_year'
                // If you have 'movie_type' or 'added_at' in your schema, add them here:
                // movie_type: movie.Type || 'N/A',
                // added_at: new Date().toISOString()
            }
        );
    } catch (error) {
        console.error("Error adding movie to watchlist:", error);
        throw error;
    }
};

/**
 * Removes a movie from the user's watchlist.
 * @param {string} documentId - The Appwrite document ID of the watchlist entry.
 */
export const removeMovieFromWatchlist = async (documentId) => {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            WATCHLIST_COLLECTION_ID,
            documentId
        );
        return true;
    } catch (error) {
        console.error("Error removing movie from watchlist:", error);
        throw error;
    }
};

/**
 * Fetches the watchlist for a specific user.
 * @param {string} userId - The ID of the current user.
 * @returns {Array} An array of movie objects in the watchlist.
 */
export const getWatchlist = async (userId) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            WATCHLIST_COLLECTION_ID,
            [
                Query.equal('user_id', userId) // <-- Corrected: matches Appwrite schema 'user_id'
            ]
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching watchlist:", error);
        throw error;
    }
};

/**
 * Checks if a movie is already in the user's watchlist.
 * @param {string} userId - The ID of the current user.
 * @param {string} imdbID - The IMDb ID of the movie to check.
 * @returns {object|null} The watchlist document if found, otherwise null.
 */
export const isMovieInWatchlist = async (userId, imdbID) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            WATCHLIST_COLLECTION_ID,
            [
                Query.equal('user_id', userId),     // <-- Corrected: matches Appwrite schema 'user_id'
                Query.equal('movie_imdb_id', imdbID) // <-- Corrected: matches Appwrite schema 'movie_imdb_id'
            ]
        );
        return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
        console.error("Error checking movie in watchlist:", error);
        throw error;
    }
};
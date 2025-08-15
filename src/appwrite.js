// src/appwrite.js
// Assuming this file handles trending movies and search history
import { Client, Databases, Query, ID } from 'appwrite';

const client = new Client();

// --- Configuration ---
client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // Uses .env.local
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // Uses .env.local

const databases = new Databases(client);

// --- Appwrite Database and Collection IDs from .env.local ---
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TRENDING_MOVIES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TRENDING_MOVIES_COLLECTION_ID;
const SEARCH_HISTORY_COLLECTION_ID = import.meta.env.VITE_APPWRITE_SEARCH_HISTORY_COLLECTION_ID;

// --- Trending Movies Functions ---

export const getTrendingMovies = async () => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            TRENDING_MOVIES_COLLECTION_ID,
            [
                Query.orderDesc('count'), // Order by search count descending
                Query.limit(10) // Get top 10 trending
            ]
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching trending movies:", error);
        return [];
    }
};

export const updateSearchCount = async (searchTerm, movieDetails) => {
    try {
        const existingEntries = await databases.listDocuments(
            DATABASE_ID,
            SEARCH_HISTORY_COLLECTION_ID,
            [
                Query.equal('search_term', searchTerm.toLowerCase()), // <-- Corrected: 'search_term'
                Query.limit(1)
            ]
        );

        if (existingEntries.documents.length > 0) {
            const doc = existingEntries.documents[0];
            await databases.updateDocument(
                DATABASE_ID,
                SEARCH_HISTORY_COLLECTION_ID,
                doc.$id,
                {
                    count: doc.count + 1, // <-- Now 'count' exists in schema
                    searched_at: new Date().toISOString() // <-- Update timestamp
                }
            );
        } else {
            await databases.createDocument(
                DATABASE_ID,
                SEARCH_HISTORY_COLLECTION_ID,
                ID.unique(),
                {
                    search_term: searchTerm.toLowerCase(), // <-- Corrected: 'search_term'
                    count: 1, // <-- Now 'count' exists in schema
                    movie_title: movieDetails.Title, // <-- Corrected: 'movie_title'
                    movie_poster: movieDetails.Poster !== 'N/A' ? movieDetails.Poster : './fallback.png', // <-- Corrected: 'movie_poster'
                    movie_imdb_id: movieDetails.imdbID, // <-- Corrected: 'movie_imdb_id'
                    searched_at: new Date().toISOString() // <-- Add 'searched_at'
                }
            );
        }
    } catch (error) {
        console.error("Error updating search count:", error);
    }
};
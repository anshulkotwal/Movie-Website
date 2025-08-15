import { Client, Databases, ID, Query } from 'appwrite';

// Appwrite Configuration (Centralized)
// This client instance will be used across all Appwrite-related functions.
const client = new Client();
client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

// Appwrite Database and Collection IDs from .env.local
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TRENDING_MOVIES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TRENDING_MOVIES_COLLECTION_ID;
const SEARCH_HISTORY_COLLECTION_ID = import.meta.env.VITE_APPWRITE_SEARCH_HISTORY_COLLECTION_ID;
const WATCHLIST_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USER_FAVORITES_COLLECTION_ID;

// Export the client for use in AuthContext if needed
export { client };

// --- Appwrite Watchlist Functions ---
export const addMovieToWatchlist = async (userId, movie) => {
    console.log("Attempting to add movie to watchlist for user:", userId, "Movie:", movie.Title);
    try {
        const newDoc = await databases.createDocument(
            DATABASE_ID,
            WATCHLIST_COLLECTION_ID,
            ID.unique(),
            {
                user_id: userId,
                movie_imdb_id: movie.imdbID,
                movie_title: movie.Title,
                movie_poster: movie.Poster !== 'N/A' ? movie.Poster : './fallback.png',
                movie_year: movie.Year
            }
        );
        console.log("Movie added to watchlist:", newDoc);
        return newDoc;
    } catch (error) {
        console.error("Error adding movie to watchlist:", error);
        // Provide more specific error messages based on Appwrite error codes
        if (error.code === 401 || error.code === 403) {
            console.error("Appwrite Permission Error: Check if 'Create' permission is granted for the 'users' role on the Watchlist collection.");
        } else if (error.code === 404) {
            console.error("Appwrite Not Found Error: Check if WATCHLIST_COLLECTION_ID and DATABASE_ID are correct and exist in your Appwrite console.");
        }
        throw error;
    }
};

export const removeMovieFromWatchlist = async (documentId) => {
    console.log("Attempting to remove movie from watchlist, document ID:", documentId);
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            WATCHLIST_COLLECTION_ID,
            documentId
        );
        console.log("Movie removed from watchlist successfully.");
        return true;
    } catch (error) {
        console.error("Error removing movie from watchlist:", error);
        if (error.code === 401 || error.code === 403) {
            console.error("Appwrite Permission Error: Check if 'Delete' permission is granted for the 'users' role on the Watchlist collection.");
        } else if (error.code === 404) {
            console.error("Appwrite Not Found Error: Check if WATCHLIST_COLLECTION_ID and DATABASE_ID are correct and exist in your Appwrite console.");
        }
        throw error;
    }
};

export const getWatchlist = async (userId) => {
    console.log("Attempting to fetch watchlist for user:", userId);
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            WATCHLIST_COLLECTION_ID,
            [
                Query.equal('user_id', userId)
            ]
        );
        console.log("Watchlist fetched:", response.documents);
        return response.documents;
    } catch (error) {
        console.error("Error fetching watchlist:", error);
        if (error.code === 401 || error.code === 403) {
            console.error("Appwrite Permission Error: Check if 'Read' permission is granted for the 'users' role on the Watchlist collection.");
        } else if (error.code === 404) {
            console.error("Appwrite Not Found Error: Check if WATCHLIST_COLLECTION_ID and DATABASE_ID are correct and exist in your Appwrite console.");
        }
        throw error;
    }
};

export const isMovieInWatchlist = async (userId, imdbID) => {
    console.log("Checking if movie is in watchlist for user:", userId, "Movie IMDB ID:", imdbID);
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            WATCHLIST_COLLECTION_ID,
            [
                Query.equal('user_id', userId),
                Query.equal('movie_imdb_id', imdbID)
            ]
        );
        const isIn = response.documents.length > 0 ? response.documents[0] : null;
        console.log("Movie in watchlist status:", isIn ? "Found" : "Not Found", isIn);
        return isIn;
    } catch (error) {
        console.error("Error checking movie in watchlist:", error);
        if (error.code === 401 || error.code === 403) {
            console.error("Appwrite Permission Error: Check if 'Read' permission is granted for the 'users' role on the Watchlist collection.");
        } else if (error.code === 404) {
            console.error("Appwrite Not Found Error: Check if WATCHLIST_COLLECTION_ID and DATABASE_ID are correct and exist in your Appwrite console.");
        }
        throw error;
    }
};

// --- Appwrite Trending Movies & Search History Functions ---
export const getTrendingMovies = async () => {
    console.log("Attempting to fetch trending movies.");
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            TRENDING_MOVIES_COLLECTION_ID,
            [
                Query.orderDesc('count'),
                Query.limit(10)
            ]
        );
        console.log("Trending movies fetched:", response.documents);
        return response.documents;
    } catch (error) {
        console.error("Error fetching trending movies:", error);
        if (error.code === 401 || error.code === 403) {
            console.error("Appwrite Permission Error: Check if 'Read' permission is granted for the 'any' or 'users' role on the Trending Movies collection.");
        } else if (error.code === 404) {
            console.error("Appwrite Not Found Error: Check if TRENDING_MOVIES_COLLECTION_ID and DATABASE_ID are correct and exist in your Appwrite console.");
        }
        return [];
    }
};

export const updateSearchCount = async (searchTerm, movieDetails) => {
    console.log("Attempting to update search count for:", searchTerm);
    try {
        // --- Update Search History Collection ---
        const existingSearchEntries = await databases.listDocuments(
            DATABASE_ID,
            SEARCH_HISTORY_COLLECTION_ID,
            [
                Query.equal('search_term', searchTerm.toLowerCase()),
                Query.limit(1)
            ]
        );

        let currentSearchCount = 1;
        let searchDocId = ID.unique(); // Default for new document
        if (existingSearchEntries.documents.length > 0) {
            const doc = existingSearchEntries.documents[0];
            currentSearchCount = doc.count + 1;
            searchDocId = doc.$id; // Use existing document ID for update
            console.log("Updating existing search history entry:", searchTerm, "new count:", currentSearchCount);
            await databases.updateDocument(
                DATABASE_ID,
                SEARCH_HISTORY_COLLECTION_ID,
                searchDocId,
                {
                    count: currentSearchCount,
                    searched_at: new Date().toISOString()
                }
            );
        } else {
            console.log("Creating new search history entry:", searchTerm);
            await databases.createDocument(
                DATABASE_ID,
                SEARCH_HISTORY_COLLECTION_ID,
                searchDocId,
                {
                    search_term: searchTerm.toLowerCase(),
                    count: currentSearchCount,
                    movie_title: movieDetails.Title,
                    movie_poster: movieDetails.Poster !== 'N/A' ? movieDetails.Poster : './fallback.png',
                    movie_imdb_id: movieDetails.imdbID,
                    searched_at: new Date().toISOString()
                }
            );
        }

        // --- Update Trending Movies Collection based on search count ---
        // This part requires 'Create' and 'Update' permissions for 'Any' role on TRENDING_MOVIES_COLLECTION_ID
        console.log("Attempting to update trending movies collection for movie:", movieDetails.Title);
        const existingTrendingEntries = await databases.listDocuments(
            DATABASE_ID,
            TRENDING_MOVIES_COLLECTION_ID,
            [
                Query.equal('imdb_id', movieDetails.imdbID), // Use imdb_id for unique movie identification
                Query.limit(1)
            ]
        );

        if (existingTrendingEntries.documents.length > 0) {
            const doc = existingTrendingEntries.documents[0];
            console.log("Updating existing trending movie entry:", movieDetails.Title, "new count:", doc.count + 1);
            await databases.updateDocument(
                DATABASE_ID,
                TRENDING_MOVIES_COLLECTION_ID,
                doc.$id,
                {
                    count: doc.count + 1, // Increment count for trending
                    last_searched: new Date().toISOString()
                }
            );
        } else {
            console.log("Creating new trending movie entry:", movieDetails.Title);
            await databases.createDocument(
                DATABASE_ID,
                TRENDING_MOVIES_COLLECTION_ID,
                ID.unique(),
                {
                    imdb_id: movieDetails.imdbID,
                    title: movieDetails.Title,
                    poster_url: movieDetails.Poster !== 'N/A' ? movieDetails.Poster : './fallback.png',
                    year: movieDetails.Year,
                    type: movieDetails.Type,
                    count: 1, // Initial count for trending
                    created_at: new Date().toISOString(),
                    last_searched: new Date().toISOString()
                }
            );
        }

    } catch (error) {
        console.error("Error updating search count or trending movies:", error);
        // Add more specific error messages based on Appwrite error codes
        if (error.code === 401 || error.code === 403) {
            console.error("Appwrite Permission Error: Check if 'Create' and 'Update' permissions are granted for the relevant roles on the Trending Movies and Search History collections.");
        } else if (error.code === 404) {
            console.error("Appwrite Not Found Error: Check if TRENDING_MOVIES_COLLECTION_ID, SEARCH_HISTORY_COLLECTION_ID, and DATABASE_ID are correct and exist in your Appwrite console.");
        }
    }
};

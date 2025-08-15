import { Client, Account, ID } from 'appwrite';

// Appwrite Configuration (Centralized)
const client = new Client();
client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);

// Export the client for use in AuthContext if needed
export { client };

// --- Appwrite Authentication Functions ---
export const login = async (email, password) => {
    try {
        await account.createEmailPasswordSession(email, password);
        return await account.get(); // Return user object after successful login
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const register = async (email, password, name) => {
    try {
        await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password); // Log in after registration
        return await account.get(); // Return user object after successful registration and login
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

// --- Appwrite OAuth Functions ---

/**
 * Initiates Google OAuth login/registration.
 * This will redirect the user to Google's OAuth page
 */
export const loginWithGoogle = () => {
    const successUrl = `${window.location.origin}/`;
    const failureUrl = `${window.location.origin}/login?error=oauth_failed`;
    
    // This will redirect the browser to Google's OAuth page
    account.createOAuth2Session('google', successUrl, failureUrl);
};

/**
 * Initiates Facebook OAuth login/registration.
 * This will redirect the user to Facebook's OAuth page
 */
export const loginWithFacebook = () => {
    const successUrl = `${window.location.origin}/`;
    const failureUrl = `${window.location.origin}/login?error=oauth_failed`;
    
    // This will redirect the browser to Facebook's OAuth page
    account.createOAuth2Session('facebook', successUrl, failureUrl);
};

/**
 * Check if user is authenticated (useful for handling OAuth callbacks)
 */
export const getCurrentUser = async () => {
    try {
        return await account.get();
    } catch (error) {
        return null;
    }
};
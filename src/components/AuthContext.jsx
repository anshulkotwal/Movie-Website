import React, { useState, useEffect, createContext, useContext } from 'react';
import { Account } from 'appwrite'; // Import Account from appwrite

// Re-import the client from AppwriteFunctions.js
import { client } from '../utils/AppwriteFunctions'; // Assuming client is exported from AppwriteFunctions

const account = new Account(client);

// --- Auth Context ---
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                // Attempt to get the current user session
                const user = await account.get();
                setCurrentUser(user);
                console.log("Current user session found:", user);
            } catch (error) {
                // If the user is not logged in (e.g., 401 Unauthorized), set currentUser to null
                if (error.code === 401) {
                    setCurrentUser(null);
                    console.log("No active user session found (401 Unauthorized).");
                } else {
                    // Log other types of errors for debugging
                    console.error("Error getting current user session:", error);
                }
            } finally {
                // Always set loadingAuth to false once the check is complete
                setLoadingAuth(false);
            }
        };

        // Call checkUser when the component mounts
        checkUser();
    }, []); // Empty dependency array means this effect runs once on mount

    // The value provided to any components consuming this context
    const value = {
        currentUser,
        setCurrentUser,
        loadingAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    // Custom hook to easily consume the AuthContext
    return useContext(AuthContext);
};

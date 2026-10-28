import { createContext } from 'react';

// Kept in its own file so AuthProvider.jsx only exports a component (keeps fast refresh happy).
export const AuthContext = createContext(null);

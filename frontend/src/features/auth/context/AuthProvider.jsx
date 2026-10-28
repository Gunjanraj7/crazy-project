import { useState } from 'react';
import * as authService from '../services/authService';
import { AuthContext } from './AuthContext';

// Holds the signed-in user for the whole app. Forms call the service themselves (so they can play
// their own success animation first) and then hand the user over with `startSession`.
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getSessionUser);

  const value = {
    user,
    prefs: user?.prefs ?? authService.DEFAULT_PREFS,
    startSession: setUser,
    logout: () => {
      authService.logout();
      setUser(null);
    },
    updateProfile: async (changes) => {
      const updated = await authService.updateProfile(user.username, changes);
      setUser(updated);
      return updated;
    },
    updatePrefs: (changes) => {
      // Optimistic: flip the toggle instantly, persist in the background.
      setUser((prev) => ({ ...prev, prefs: { ...prev.prefs, ...changes } }));
      authService.updateProfile(user.username, { prefs: changes }).catch(() => {});
    },
    changePassword: (passwords) => authService.changePassword(user.username, passwords),
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

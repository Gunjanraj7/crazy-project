import { useEffect, useState } from 'react';
import * as authService from '../services/authService';
import { AuthContext } from './AuthContext';

// Holds the signed-in user for the whole app. On load it asks the backend who the session cookie
// belongs to. Forms call the service themselves (so they can play their own success animation first)
// and then hand the user over with `startSession`.
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    authService
      .getCurrentUser()
      .catch(() => null) // backend unreachable: show the login page, which will explain on submit
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // A 401 mid-session means the session expired or was revoked elsewhere: sign out locally too.
  const signOutIfExpired = (err) => {
    if (err.status === 401) setUser(null);
    throw err;
  };

  const value = {
    user,
    ready,
    prefs: user?.prefs ?? authService.DEFAULT_PREFS,
    startSession: setUser,
    logout: async () => {
      await authService.logout();
      setUser(null);
    },
    updateProfile: async (changes) => {
      const updated = await authService.updateProfile(changes).catch(signOutIfExpired);
      setUser(updated);
      return updated;
    },
    updatePrefs: (changes) => {
      // Optimistic: flip the toggle instantly, persist in the background.
      setUser((prev) => ({ ...prev, prefs: { ...prev.prefs, ...changes } }));
      authService
        .updateProfile({ prefs: changes })
        .catch(signOutIfExpired)
        .catch(() => {});
    },
    changePassword: (passwords) => authService.changePassword(passwords).catch(signOutIfExpired),
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api, { tokenStorage } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

 

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    const accessToken = tokenStorage.getAccess();

    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/profile/");

      setUser(response.data);
    } catch (error) {
      console.error(
        "Could not restore authentication session:",
        error
      );

      tokenStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  

  async function login(username, password) {
    const response = await api.post("/auth/login/", {
      username: username.trim(),
      password,
    });

    const data = response.data;

    if (!data.access || !data.refresh) {
      throw new Error(
        "Login failed: authentication tokens were not returned."
      );
    }


    tokenStorage.setTokens(
      data.access,
      data.refresh
    );

   
    const profileResponse = await api.get(
      "/auth/profile/"
    );

    setUser(profileResponse.data);

    return profileResponse.data;
  }



  async function register(payload) {
    const response = await api.post(
      "/auth/register/",
      payload
    );

    return response.data;
  }



  async function refreshProfile() {
    const response = await api.get(
      "/auth/profile/"
    );

    setUser(response.data);

    return response.data;
  }

 
  function logout() {
    tokenStorage.clear();
    setUser(null);
  }

  
  const value = useMemo(
    () => ({
      user,

      role: user?.profile?.role ?? null,

      isAuthenticated: Boolean(user),

      isLoading,

      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}



export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}
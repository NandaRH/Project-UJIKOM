import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getProfileApi } from "../services/userApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }, []);

  const login = useCallback((userData, tokenData) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    if (tokenData) {
      localStorage.setItem("token", tokenData);
      setToken(tokenData);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      logout();
      return null;
    }

    let cachedUser = null;
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      try {
        cachedUser = JSON.parse(rawUser);
      } catch {
        cachedUser = null;
      }
    }

    if (cachedUser?.role === "admin") {
      setUser(cachedUser);
      setToken(storedToken);
      return cachedUser;
    }

    try {
      const res = await getProfileApi();
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setToken(storedToken);
        return res.data.user;
      }
      return null;
    } catch (error) {
      console.error("Gagal memuat profil:", error);
      if (error?.response?.status === 401) {
        logout();
      }
      throw error;
    }
  }, [logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    if (storedToken) {
      setToken(storedToken);
      refreshProfile()
        .catch(() => null)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshProfile]);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, loading, refreshProfile }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


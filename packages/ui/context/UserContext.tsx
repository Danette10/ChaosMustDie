import {createContext, useContext, useEffect, useRef, useState} from "react";
import axiosInstance from "../utils/axiosInstance";
import {UserTypeEnum} from "../enum/UserTypeEnum";
import {useNavigate} from "react-router-dom";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: UserTypeEnum;
  phone_number?: string;
  company?: {
      id: number;
      name: string;
      siren: string;
      address: string;
      contact_email: string;
      link: string;
  };
};

type UserContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  forceRefreshUser: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  loading: true,
  forceRefreshUser(): Promise<void> {
    return Promise.resolve(undefined);
  },
  refreshUser: async () => {},
  setUser: () => {},
});

export const useUser = () => useContext(UserContext);

const isTokenExpired = (): boolean => {
  const expiry = localStorage.getItem("token_expiry");
  if (!expiry) return true;
  return Date.now() > parseInt(expiry);
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const localToken = localStorage.getItem("access_token");

  const fetchUser = async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = localStorage.getItem("access_token");
    if (!token || isTokenExpired()) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_expiry");
      setUser(null);
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const res = await axiosInstance.get("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const onFocus = () => {
      fetchUser();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const forceRefreshUser = async () => {
    const token = localStorage.getItem("access_token");
    if (!token || isTokenExpired()) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_expiry");
      setUser(null);
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const res = await axiosInstance.get("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
      <UserContext.Provider
          value={{ user, token: localToken, loading, refreshUser: fetchUser, forceRefreshUser, setUser }}
      >
        {children}
      </UserContext.Provider>
  );
}

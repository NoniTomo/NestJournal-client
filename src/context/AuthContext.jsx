import { createContext, useState, useEffect } from "react";
import axios from "axios";
import inMemoryJWT from "../services/inMemoryJWT";
import config from "../config";
import showErrorMessage from "../utils/showErrorMessage";
import { CircularProgress } from "@mui/material";

//instance axios для отправки запроса на сервер
export const AuthClient = axios.create({
  baseURL: `${config.API_URL}/auth`,
  withCredentials: true,
});

export const ResourceClient = axios.create({
  baseURL: `${config.API_URL}/main`,
  withCredentials: true,
});

export const RequestClient = axios.create({
  baseURL: `${config.API_URL}/main`,
  withCredentials: true,
});

RequestClient.interceptors.request.use(
  (config) => {
    const accessToken = inMemoryJWT.getToken();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

ResourceClient.interceptors.request.use(
  (config) => {
    const accessToken = inMemoryJWT.getToken();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

export const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isUserLogged, setIsUserLogged] = useState(false);

  const handleLogOut = () => {
    AuthClient.post("/logout")
      .then(() => {
        setIsUserLogged(false);
        inMemoryJWT.deleteToken();
      })
      .catch(showErrorMessage);
  };

  const handleResetPassword = ({ data, setLinkSend }) => {
    AuthClient.post("/reset-password", data)
      .then(() => {
        setIsUserLogged(false);
        setLinkSend();
      })
      .catch(showErrorMessage);
  };

  const handleNewPassword = async ({ data, location }) => {
    AuthClient.post(`${config.API_URL}${location.pathname}/new-password`, data)
      .then(() => {
        setIsUserLogged(false);
        return { isItError: false };
      })
      .catch((error) => {
        showErrorMessage(error);
        return { isItError: true };
      });
  };

  const handleSignUp = (data) => {
    return AuthClient.post("/sign-up", data)
      .then((res) => {
        const { accessToken, accessTokenExpiration } = res.data;

        inMemoryJWT.setToken(accessToken, accessTokenExpiration);
        setIsUserLogged(true);
        return { isItError: false };
      })
      .catch((error) => {
        showErrorMessage(error);
        return { isItError: true };
      });
  };

  const handleSignIn = (data) => {
    return AuthClient.post("/sign-in", data)
      .then((res) => {
        const { accessToken, accessTokenExpiration } = res.data;

        inMemoryJWT.setToken(accessToken, accessTokenExpiration);
        setIsUserLogged(true);
        return { isItError: false };
      })
      .catch((err) => {
        showErrorMessage(err);
        return { isItError: true };
      });
  };

  useEffect(() => {
    AuthClient.post("/refresh")
      .then((res) => {
        const { accessToken, accessTokenExpiration } = res.data;
        inMemoryJWT.setToken(accessToken, accessTokenExpiration);

        setIsAppReady(true);
        setIsUserLogged(true);
      })
      .catch(() => {
        setIsAppReady(true);
        setIsUserLogged(false);
      });
  }, []);

  useEffect(() => {
    const handlePersistedLogOut = (event) => {
      if (event.key === config.LOGOUT_STORAGE_KEY) {
        inMemoryJWT.deleteToken();
        setIsUserLogged(false);
      }
    };

    window.addEventListener("storage", handlePersistedLogOut);

    return () => {
      window.removeEventListener("storage", handlePersistedLogOut);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        handleSignUp,
        handleSignIn,
        handleLogOut,
        handleResetPassword,
        isAppReady,
        isUserLogged,
        handleNewPassword,
      }}
    >
      {isAppReady ? (
        children
      ) : (
        <div
          style={{
            width: "100vw",
            height: "100vh",
            display: "inline-block",
            margin: "auto auto",
          }}
        >
          <CircularProgress size="80" />
        </div>
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

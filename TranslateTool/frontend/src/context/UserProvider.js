import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState();

  const navigate = useNavigate;
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);
  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserState = () => {
  return useContext(UserContext);
};

export default UserProvider;

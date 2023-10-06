import React from "react";
import { Navigate } from "react-router-dom";
import UserAuth, { UserState } from "../context/UserProvider";
import Homepage from "../pages/Homepage";

function ProtectedRoute(props) {
  const { user } = UserState();
  if (user) return props.page;
  return <Navigate to="/" />;
}

export default ProtectedRoute;

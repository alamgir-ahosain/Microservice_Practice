import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  console.log("PrivateRoute → token:", token ? "EXISTS " : "NULL ");
  console.log("PrivateRoute → user:", user);

  if (!token || !user) {
    console.log("PrivateRoute → redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  console.log("PrivateRoute -> ACCESS GRANTED ");
  return children;
}

import { createBrowserRouter, RouterProvider } from "react-router-dom";
//import layout from "../components/layout/Layout";
//import ProtectedRoute from "../components/ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
//import Lobby from "../pages/Lobby";
//import GamePage from "../pages/GamePage";
//import Profile from "../pages/Profile";
//import History from "../pages/History";
//import Leaderboard from "../pages/Leaderboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
]);

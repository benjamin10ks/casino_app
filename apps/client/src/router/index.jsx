import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../components/layout/Layout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Lobby from "../pages/Lobby";
import Game from "../pages/Game";
import Profile from "../pages/Profile";
//import History from "../pages/History";
//import Leaderboard from "../pages/Leaderboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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
      {
        path: "lobby",
        element: <Lobby />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "game",
        element: <Game />,
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}

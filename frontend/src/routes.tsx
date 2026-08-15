import { Navigate } from "react-router";
import { App } from "./App";
import { ErrorPage } from "./components/ErrorPage";
import { About } from "./components/About/About";
import { Universities } from "./components/Universities/Universities";
import { LogIn } from "./components/LogIn/LogIn";
import { SignUp } from "./components/SignUp/SignUp";
import { ContributionDashboard } from "./components/ContributionDashboard/ContributionDashboard";
import { AdminDashboard } from "./components/AdminDashboard/AdminDashboard";
import { Profile } from "./components/Profile/Profile";
import { Api } from "./components/Api/Api";

const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <Universities />,
        index: true,
      },
      {
        element: <Navigate to="/" replace />,
        path: "/home",
      },
      {
        element: <Navigate to="/" replace />,
        path: "universities",
      },
      {
        element: <About />,
        path: "about",
      },
      {
        element: <Api />,
        path: "api-docs",
      },
      {
        element: <ContributionDashboard />,
        path: "improve-data",
      },
      {
        element: <AdminDashboard />,
        path: "admin-dashboard",
      },
      { element: <Profile />, path: "profile" },
      {
        element: <LogIn />,
        path: "login",
      },
      {
        element: <SignUp />,
        path: "signup",
      },
    ],
  },
];

export { routes };

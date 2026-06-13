import { App } from "./App";
import { ErrorPage } from "./components/ErrorPage";
import { Home } from "./components/Home/Home";
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
        element: <Home />,
        index: true,
      },
      {
        element: <Home />,
        path: "/home",
      },
      {
        element: <Api />,
        path: "api-docs",
      },
      {
        element: <Universities />,
        path: "universities",
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

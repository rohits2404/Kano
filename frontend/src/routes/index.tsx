import LandingPage from "@/pages/landing/landing-page";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
    { path: "/", element: <LandingPage /> },
]);

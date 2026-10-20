import InvitePage from "@/pages/invite/invite-page";
import LandingPage from "@/pages/landing/landing-page";
import { createBrowserRouter } from "react-router";
import { PublicRoute } from "./public-route";
import SignInPage from "@/pages/auth/sign-in";
import SignUpPage from "@/pages/auth/sign-up";
import { ProtectedRoute } from "./protected-route";
import CreateWorkspacePage from "@/pages/onboarding/create-workspace";
import { DashboardHomeRedirect } from "./home-redirect";
import InviteTeamPage from "@/pages/onboarding/invite-team";
import WorkspaceReadyPage from "@/pages/onboarding/workspace-ready";

export const router = createBrowserRouter([
    { path: "/", element: <LandingPage /> },
    { path: "/invite/:token", element: <InvitePage /> },
    {
        element: <PublicRoute />,
        children: [
            { path: "/sign-in", element: <SignInPage /> },
            { path: "/sign-up", element: <SignUpPage /> },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            { path: "/onboarding/workspace", element: <CreateWorkspacePage /> },
            { path: "/onboarding/invite", element: <InviteTeamPage /> },
            { path: "/onboarding/ready", element: <WorkspaceReadyPage /> },
            { path: "/dashboard", element: <DashboardHomeRedirect /> },
        ],
    },
]);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./context/auth-context";
import { TooltipProvider } from "./components/ui/tooltip";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000,
        },
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <TooltipProvider>
                        <RouterProvider router={router} />
                        <Toaster richColors position="bottom-center" />
                    </TooltipProvider>
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    </StrictMode>,
);

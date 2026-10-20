import axios, { AxiosError } from "axios";

import type { ApiErrorResponse } from "@/types";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1";

export const API = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 20000,
    headers: {
        "Content-Type": "application/json",
    },
});

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth/status"];

API.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
        const { data, status, config } = error.response ?? {};

        if (status === 401 && !PUBLIC_PATHS.includes(config?.url ?? "")) {
            window.location.href = "/sign-in";
        }

        return Promise.reject({
            errorCode: data?.errorCode ?? "ERR_NETWORK",
            message: data?.message ?? error.message ?? "Something Went Wrong",
            errors: data?.errors,
            status,
        });
    },
);

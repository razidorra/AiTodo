function getApiBaseUrl() {
    if (window.location.port === "5500") {
        return "http://127.0.0.1:3000";
    }
    return "";
}
export async function requestJson(url, options = {}) {
    const response = await fetch(`${getApiBaseUrl()}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });
    if (response.status === 204) {
        return null;
    }
    const body = (await response.json());
    if (!response.ok) {
        throw new Error(body.error?.message || "Request failed");
    }
    return body.data;
}
export function getClientConfig() {
    return requestJson("/api/client-config");
}

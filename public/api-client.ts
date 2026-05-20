export type JsonRequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

type ApiResponse<T> = {
  data: T;
  error?: {
    message?: string;
  };
};

export type ClientConfig = {
  clerkPublishableKey?: string;
};

function getApiBaseUrl(): string {
  if (window.location.port === "5500") {
    return "http://127.0.0.1:3000";
  }

  return "";
}

export async function requestJson<T>(url: string, options: JsonRequestOptions = {}): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null as T;
  }

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(body.error?.message || "Request failed");
  }

  return body.data;
}

export function getClientConfig(): Promise<ClientConfig> {
  return requestJson<ClientConfig>("/api/client-config");
}

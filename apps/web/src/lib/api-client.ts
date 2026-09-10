const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3061";

if (!import.meta.env.VITE_API_URL) {
	console.warn(
		"VITE_API_URL is not set — falling back to http://localhost:3061. " +
			"Set VITE_API_URL in apps/web/.env.local to point at your API.",
	);
}

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
	) {
		super(message);
		this.name = "ApiError";
	}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${API_URL}${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...init?.headers,
		},
	});

	if (res.status === 204) {
		return undefined as T;
	}

	const body = await res.json().catch(() => undefined);

	if (!res.ok) {
		const message = Array.isArray(body?.message)
			? body.message.join(", ")
			: (body?.message ?? res.statusText);
		throw new ApiError(message, res.status);
	}

	return body as T;
}

export const api = {
	get: <T>(path: string) => request<T>(path),
	post: <T>(path: string, data?: unknown) =>
		request<T>(path, { method: "POST", body: JSON.stringify(data) }),
	patch: <T>(path: string, data?: unknown) =>
		request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
	delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

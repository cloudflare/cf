export const MAX_BUFFER_BYTES = 16 * 1024 * 1024;

interface DecodedEvents {
	events: Record<string, unknown>[];
	warning?: string;
}

function isEvent(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function decodeEvents(data: unknown): DecodedEvents {
	if (typeof data !== "string" || Buffer.byteLength(data) > MAX_BUFFER_BYTES) {
		return { events: [], warning: "Skipped an unsupported live tail message." };
	}
	let decoded: unknown;
	try {
		decoded = JSON.parse(data);
	} catch {
		return { events: [], warning: "Skipped malformed live tail JSON." };
	}
	const entries: unknown[] = Array.isArray(decoded) ? decoded : [decoded];
	const events = entries.filter(isEvent);
	return {
		events,
		...(events.length === entries.length
			? {}
			: {
					warning: "Skipped invalid live tail events. Expected JSON objects.",
				}),
	};
}

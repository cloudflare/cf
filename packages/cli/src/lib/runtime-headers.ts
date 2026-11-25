// Kept import-free so the Forge plugin can leave these headers to the runtime.
export const RUNTIME_HEADER_NAMES = [
	"User-Agent",
	"X-CF-CLI-Mode",
	"X-CF-CLI-Agent",
] as const;

export type RuntimeHeaderName = (typeof RUNTIME_HEADER_NAMES)[number];

const lowercased: ReadonlySet<string> = new Set(
	RUNTIME_HEADER_NAMES.map((name) => name.toLowerCase())
);

export function isRuntimeHeader(name: string): boolean {
	return lowercased.has(name.toLowerCase());
}

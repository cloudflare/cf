/** Semantic terminal styling designed for both light and dark backgrounds. */

import chalk from "chalk";
import figures from "figures";

type ColorRole =
	| "brand"
	| "success"
	| "error"
	| "warning"
	| "info"
	| "muted"
	| "code"
	| "jsonKey"
	| "jsonString"
	| "jsonNumber"
	| "jsonBoolean";

type ColorPalette = Record<ColorRole, `#${string}`>;

/**
 * A restrained, mid-luminance palette that remains legible on both common
 * light and dark terminal backgrounds without trying to infer the background.
 */
export const colorPalette = {
	brand: "#BF6600",
	success: "#3A8E52",
	error: "#D45350",
	warning: "#BF6600",
	info: "#3D82BB",
	muted: "#7F7F7F",
	code: "#3D82BB",
	jsonKey: "#3D82BB",
	jsonString: "#3A8E52",
	jsonNumber: "#BF6600",
	jsonBoolean: "#926CC1",
} as const satisfies ColorPalette;

/** Check whether styling should be emitted at all. */
export function supportsColor(
	env: NodeJS.ProcessEnv = process.env,
	isTTY = process.stdout.isTTY === true
): boolean {
	if (env.NO_COLOR !== undefined) {
		return false;
	}

	if (env.FORCE_COLOR !== undefined) {
		return env.FORCE_COLOR !== "0";
	}

	return isTTY;
}

// Chalk's documented `level` knob makes every style a no-op while retaining
// one shared instance for callers and dependencies that import it directly.
if (!supportsColor()) {
	chalk.level = 0;
}

function semanticColor(role: ColorRole, text: string): string {
	if (chalk.level >= 3) {
		return chalk.hex(colorPalette[role])(text);
	}

	return role === "muted" ? text : chalk.bold(text);
}

export const theme = {
	brand: (text: string) => semanticColor("brand", text),
	success: (text: string) => semanticColor("success", text),
	error: (text: string) => semanticColor("error", text),
	warning: (text: string) => semanticColor("warning", text),
	info: (text: string) => semanticColor("info", text),
	muted: (text: string) => semanticColor("muted", text),
	code: (text: string) => semanticColor("code", text),
	jsonKey: (text: string) => semanticColor("jsonKey", text),
	jsonString: (text: string) => semanticColor("jsonString", text),
	jsonNumber: (text: string) => semanticColor("jsonNumber", text),
	jsonBoolean: (text: string) => semanticColor("jsonBoolean", text),
	bold: (text: string) => chalk.bold(text),
	italic: (text: string) => chalk.italic(text),
} as const;

export const symbols = {
	success: figures.tick,
	error: figures.cross,
	warning: figures.warning,
	info: figures.info,
	arrow: figures.arrowRight,
} as const;

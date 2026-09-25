import chalk from "chalk";
import { describe, expect, it } from "vite-plus/test";
import { colorPalette, supportsColor, theme } from "../../lib/ui/theme.js";

describe("supportsColor", () => {
	it("gives NO_COLOR precedence over FORCE_COLOR", () => {
		expect(supportsColor({ NO_COLOR: "1", FORCE_COLOR: "1" }, true)).toBe(
			false
		);
	});

	it("honours FORCE_COLOR before TTY detection", () => {
		expect(supportsColor({ FORCE_COLOR: "1" }, false)).toBe(true);
		expect(supportsColor({ FORCE_COLOR: "0" }, true)).toBe(false);
	});

	it("falls back to whether stdout is a TTY", () => {
		expect(supportsColor({}, true)).toBe(true);
		expect(supportsColor({}, false)).toBe(false);
	});
});

describe("color palette", () => {
	it("remains legible on common light and dark terminal backgrounds", () => {
		for (const color of Object.values(colorPalette)) {
			expect(contrastRatio(color, "#FFFFFF")).toBeGreaterThanOrEqual(4);
			expect(contrastRatio(color, "#1E1E1E")).toBeGreaterThanOrEqual(4);
		}
	});

	it("uses the fixed palette only when the terminal supports truecolor", () => {
		const previousLevel = chalk.level;
		try {
			chalk.level = 3;
			expect(theme.info("info")).toBe("\u001b[38;2;61;130;187minfo\u001b[39m");

			chalk.level = 2;
			expect(theme.info("info")).toBe("\u001b[1minfo\u001b[22m");
			expect(theme.muted("muted")).toBe("muted");

			chalk.level = 1;
			expect(theme.info("info")).toBe("\u001b[1minfo\u001b[22m");
			expect(theme.muted("muted")).toBe("muted");
		} finally {
			chalk.level = previousLevel;
		}
	});
});

function contrastRatio(foreground: string, background: string): number {
	const lighter = Math.max(luminance(foreground), luminance(background));
	const darker = Math.min(luminance(foreground), luminance(background));
	return (lighter + 0.05) / (darker + 0.05);
}

function luminance(hex: string): number {
	const red = linearize(hex.slice(1, 3));
	const green = linearize(hex.slice(3, 5));
	const blue = linearize(hex.slice(5, 7));
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function linearize(component: string): number {
	const channel = Number.parseInt(component, 16) / 255;
	return channel <= 0.04045
		? channel / 12.92
		: ((channel + 0.055) / 1.055) ** 2.4;
}

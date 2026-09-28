/**
 * Banner module — the slim `🍊☁️  cf · v…` headline cf renders at the
 * top of every interactive invocation, plus the `cf <subcommand>`
 * command-line formatter shared by splash / help screens.
 *
 * Previously this module also shipped a full ASCII cloud logo plus
 * gradient dividers for `cf --version` / `cf` splash. Both surfaces
 * now use the slim headline (see `renderPromptIntro`) so the splash
 * art was removed along with its `gradient-string` dependency.
 */

import { stripVTControlCharacters } from "node:util";
import { DELEGATION_SENTINEL } from "../delegate.js";
import { warning } from "./format.js";
import { theme } from "./theme.js";
import type { UpdateNotice } from "../update-check.js";

/**
 * Slim wrangler-style intro banner with a plain horizontal underline:
 *
 *     🍊☁️  cf · v0.0.5
 *     ──────────────────
 *
 * When this process was reached by a *global* cf delegating to a
 * project-pinned copy (Wrangler-2 style), a dim `· delegated` tag is
 * appended to the headline so it's clear why the running version may
 * differ from the global cf the user invoked:
 *
 *     🍊☁️  cf · v1.2.3 · delegated
 *     ─────────────────────────────
 *
 * Underline length tracks the visible width of the headline (ANSI
 * stripped). Mirrors wrangler's `── ` rule below `⛅️ wrangler vX.Y.Z`
 * without trying to connect down into a prompt gutter — earlier
 * iterations bent a `┌` corner into the gutter via `clack.intro()`,
 * but the bare corner above an emoji headline read as a stray glyph,
 * not a frame.
 *
 * Color gracefully degrades to plain ASCII when NO_COLOR/non-TTY.
 */
export function renderPromptIntro(
	version: string,
	update?: UpdateNotice
): string {
	// 🍊☁️  — "orange cloud" is an old internal nickname for Cloudflare.
	// U+FE0F after ☁ forces emoji presentation rather than monochrome glyph.
	const mark = "🍊☁️ ";

	// A delegated child is spawned with DELEGATION_SENTINEL set (see
	// lib/delegate.ts). When present, append a dim "· delegated" tag to
	// the headline; absent in normal runs, so the banner is unchanged for
	// the common case.
	const delegatedTag = process.env[DELEGATION_SENTINEL]
		? ` ${theme.muted("·")} ${theme.muted("delegated")}`
		: "";
	const updateTag = update
		? ` ${theme.muted("·")} ${theme.warning(`update available: v${update.latestVersion}`)}`
		: "";
	const headline = `${mark} ${theme.brand(theme.bold("cf"))} ${theme.muted("·")} ${theme.muted(`v${version}`)}${delegatedTag}${updateTag}`;

	// Strip ANSI before measuring so the underline width matches the
	// headline's visible width, not the byte length with escape codes.
	const visibleWidth = stripVTControlCharacters(headline).length;
	const rule = "─".repeat(visibleWidth);
	const underline = theme.brand(rule);

	const majorWarning = update?.isMajor
		? `\n${warning("A new major version of cf is available. Updating is recommended.")}`
		: "";

	return `${headline}\n${underline}${majorWarning}`;
}

/**
 * Format a command for display in command lists.
 * Shows "cf" in brand color and subcommand(s) in cyan.
 *
 * @param subcommand - The subcommand path (e.g., "dns", "d1 list", "dns records create")
 * @returns Formatted command string
 */
export function formatCommand(subcommand: string): string {
	return `${theme.brand("cf")} ${theme.code(subcommand)}`;
}

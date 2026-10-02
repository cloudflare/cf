/**
 * Formats the slim `🍊☁️  cf · v…` headline used by interactive commands
 * and the bare `cf` splash, plus `cf <subcommand>` labels for command lists.
 */

import { stripVTControlCharacters } from "node:util";
import { DELEGATION_SENTINEL } from "../delegate.js";
import { warning } from "./format.js";
import { theme } from "./theme.js";
import type { UpdateNotice } from "../update-check.js";

/**
 * Slim cf banner with a horizontal underline:
 *
 *     🍊☁️  cf · v0.0.5
 *     ──────────────────
 *
 * A project-pinned cf reached through global cf delegation adds a dim
 * `· delegated` tag so the running version is clear:
 *
 *     🍊☁️  cf · v1.2.3 · delegated
 *     ─────────────────────────────
 *
 * Underline length tracks the visible width of the headline after ANSI
 * styling is stripped. Color styling follows the terminal settings.
 */
export function renderPromptIntro(
	version: string,
	update?: UpdateNotice
): string {
	// U+FE0F after ☁ keeps the mark in emoji presentation.
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

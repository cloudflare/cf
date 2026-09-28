import { isInteractive } from "@cloudflare/cli-shared-helpers/interactive";
import { USER_AGENT } from "../version.js";
import { detectAgentContext } from "./agent-context.js";
import { isCI } from "./interactive.js";

/**
 * CLI execution mode, sent as the `X-CF-CLI-Mode` header on every request.
 *
 *   interactive     — TTY attached (human at a terminal)
 *   non-interactive — piped / scripted / no TTY
 *   ci              — running inside a CI system (GitHub Actions, GitLab CI, etc.)
 */
export type CLIMode = "interactive" | "non-interactive" | "ci";

/**
 * Detect the current CLI execution mode.
 */
export function detectCLIMode(): CLIMode {
	if (isCI) {
		return "ci";
	}

	return isInteractive() ? "interactive" : "non-interactive";
}

/**
 * Build the default headers that every outbound Cloudflare request should carry.
 *
 * Returns:
 *   User-Agent:     cf-cli/{version}
 *   X-CF-CLI-Mode:  interactive | non-interactive | ci
 *   X-CF-CLI-Agent: detected agentic harness id (when present)
 */
export function getDefaultHeaders(): Record<string, string> {
	const agentInfo = detectAgentContext();
	const agentHeader: Record<string, string> =
		agentInfo.isAgentic && agentInfo.harness !== null
			? { "X-CF-CLI-Agent": agentInfo.harness.id }
			: {};

	return {
		"User-Agent": USER_AGENT,
		"X-CF-CLI-Mode": detectCLIMode(),
		...agentHeader,
	};
}

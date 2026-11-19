import os from "node:os";
import { isInteractive } from "@cloudflare/cli-shared-helpers/interactive";
import { detectAgentContext } from "../../lib/agent-context.js";
import { isCI } from "../../lib/interactive.js";
import { detectCLIMode } from "../../lib/request-headers.js";
import {
	getArch,
	getNodeVersion,
	getPackageManager,
	getPlatform,
	isDirectlyDelegated,
} from "../../lib/telemetry/environment.js";
import { VERSION } from "../../version.js";
import type { ClientContext } from "./payload.js";

/**
 * What the CLI knows about where it is running. The harness session and
 * invocation IDs are never included: they link to records the harness vendor holds.
 */
export function buildClientContext(
	environment: NodeJS.ProcessEnv = process.env
): ClientContext {
	const agent = detectAgentContext(environment);
	return {
		cli_version: VERSION,
		cli_mode: detectCLIMode(),
		cli_delegated: isDirectlyDelegated(environment, process.ppid),
		package_manager: getPackageManager(),
		os: getPlatform(),
		// os.release() ("25.5.0"), not os.version(), which carries a long kernel banner.
		os_release: os.release(),
		arch: getArch(),
		node_major: getNodeVersion(),
		is_ci: isCI,
		is_interactive: isInteractive(),
		...(agent.harness ? { agent_detected: agent.harness.id } : {}),
		...(agent.model ? { agent_model_detected: agent.model.id } : {}),
	};
}

import $auditlogs from "./audit-logs/index.js";
import $insights from "./insights/index.js";
import $scans from "./scans/index.js";
import $state from "./state/index.js";
import $zoneinsights from "./zone-insights/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * security-center command
 * @generated from apis/overlays/security-center.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "security-center",
	describe:
		"Security posture dashboard — view and manage security insights, misconfigurations, and vulnerabilities",

	builder: (yargs) => {
		return yargs
			.command($auditlogs)
			.command($insights)
			.command($scans)
			.command($state)
			.command($zoneinsights)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

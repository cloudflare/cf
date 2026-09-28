import $colos from "./colos/index.js";
import $commands from "./commands/index.js";
import $devices from "./devices/index.js";
import $isps from "./isps/index.js";
import $overview from "./overview/index.js";
import $rules from "./rules/index.js";
import $testresults from "./test-results/index.js";
import $tests from "./tests/index.js";
import $warpchangeevents from "./warp-change-events/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dex command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dex",
	describe:
		"Digital Experience Monitoring — synthetic tests, fleet-wide device metrics, and network path diagnostics",

	builder: (yargs) => {
		return yargs
			.command($colos)
			.command($commands)
			.command($devices)
			.command($isps)
			.command($overview)
			.command($rules)
			.command($testresults)
			.command($tests)
			.command($warpchangeevents)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

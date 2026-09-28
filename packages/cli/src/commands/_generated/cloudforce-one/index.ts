import $binarystorage from "./binary-storage/index.js";
import $credentialmonitor from "./credential-monitor/index.js";
import $events from "./events/index.js";
import $priorityintelligence from "./priority-intelligence/index.js";
import $requests from "./requests/index.js";
import $rules from "./rules/index.js";
import $scans from "./scans/index.js";
import $threatevents from "./threat-events/index.js";
import $threatsignals from "./threat-signals/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * cloudforce-one command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "cloudforce-one",
	describe: "Detection rule management APIs",

	builder: (yargs) => {
		return yargs
			.command($binarystorage)
			.command($credentialmonitor)
			.command($events)
			.command($priorityintelligence)
			.command($requests)
			.command($rules)
			.command($scans)
			.command($threatevents)
			.command($threatsignals)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

import $cors from "./cors/index.js";
import $createbyname from "./create-by-name.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $domains from "./domains/index.js";
import $edit from "./edit.js";
import $eventnotifications from "./event-notifications/index.js";
import $get from "./get.js";
import $jobs from "./jobs/index.js";
import $lifecycle from "./lifecycle/index.js";
import $list from "./list.js";
import $localuploads from "./local-uploads/index.js";
import $locks from "./locks/index.js";
import $metrics from "./metrics/index.js";
import $sippy from "./sippy/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * buckets command group
 * @generated from apis/overlays/r2.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "buckets",
	describe:
		"Create and configure R2 buckets including CORS, lifecycle, custom domains, event notifications, and object locks",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($createbyname)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($cors)
			.command($domains)
			.command($eventnotifications)
			.command($jobs)
			.command($lifecycle)
			.command($localuploads)
			.command($locks)
			.command($metrics)
			.command($sippy)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

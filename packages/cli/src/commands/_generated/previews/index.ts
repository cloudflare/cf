import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * previews command
 * @generated from apis/overlays/previews.ts
 */
import type { CommandModule } from "yargs";
import $deploy from "#commands/previews/deploy/index.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";

const command: CommandModule<CommonYargsOptions> = {
	command: "previews",
	describe: "Manage Worker Previews",

	builder: (yargs) => {
		return yargs
			.command(withHandWrittenDryRun($deploy, "preview"))
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

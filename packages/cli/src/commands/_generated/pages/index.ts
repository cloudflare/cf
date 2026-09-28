import $deploy from "#commands/pages/deploy/index.js";
import $projects from "./projects/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * pages command
 * @generated from apis/overlays/pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "pages",
	describe:
		"Full-stack application hosting with Git-integrated builds, preview deployments, and custom domains",

	builder: (yargs) => {
		return yargs
			.command($deploy)
			.command($projects)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

import $create from "./create.js";
import $deleterotatedsecret from "./delete-rotated-secret.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $rotatesecret from "./rotate-secret.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * oauth-clients command
 * @generated from apis/overlays/oauth-clients.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "oauth-clients",
	describe: "oauth-clients",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($deleterotatedsecret)
			.command($get)
			.command($list)
			.command($rotatesecret)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

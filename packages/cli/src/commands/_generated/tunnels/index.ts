import $diag from "#commands/tunnels/diag/index.js";
import $login from "#commands/tunnels/login/index.js";
import $quickstart from "#commands/tunnels/quick-start/index.js";
import $ready from "#commands/tunnels/ready/index.js";
import $run from "#commands/tunnels/run/index.js";
import $tail from "#commands/tunnels/tail/index.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";
import $config from "./config/index.js";
import $connections from "./connections/index.js";
import $connectors from "./connectors/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $managementtoken from "./management-token/index.js";
import $token from "./token/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tunnels command
 * @generated from apis/overlays/tunnels.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tunnels",
	describe: "tunnels",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command(withHandWrittenDryRun($diag, "preview"))
			.command($edit)
			.command($get)
			.command($list)
			.command(withHandWrittenDryRun($login, "preview"))
			.command(withHandWrittenDryRun($quickstart, "preview"))
			.command(withHandWrittenDryRun($ready, "preview"))
			.command(withHandWrittenDryRun($run, "preview"))
			.command(withHandWrittenDryRun($tail, "preview"))
			.command($config)
			.command($connections)
			.command($connectors)
			.command($managementtoken)
			.command($token)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

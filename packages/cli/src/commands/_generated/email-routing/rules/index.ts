import $catchall from "./catch-all/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $listaccount from "./list-account.js";
import $plan from "./plan.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * rules command group
 * @generated from apis/overlays/email-routing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "rules",
	describe:
		"Match incoming email addresses and forward messages to destination mailboxes or Workers",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($listaccount)
			.command($plan)
			.command($update)
			.command($catchall)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

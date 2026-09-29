import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $policies from "./policies/index.js";
import $policytests from "./policy-tests/index.js";
import $revoketokens from "./revoke-tokens.js";
import $settings from "./settings/index.js";
import $shortlivedcertificates from "./short-lived-certificates/index.js";
import $update from "./update.js";
import $userpolicychecks from "./user-policy-checks/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * applications command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "applications",
	describe: "Operations for access.applications",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($revoketokens)
			.command($update)
			.command($policies)
			.command($policytests)
			.command($settings)
			.command($shortlivedcertificates)
			.command($userpolicychecks)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

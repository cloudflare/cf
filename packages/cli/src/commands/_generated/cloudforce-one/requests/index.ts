import $assets from "./assets/index.js";
import $constants from "./constants/index.js";
import $create from "./create.js";
import $get from "./get.js";
import $legalresponse from "./legal-response/index.js";
import $list from "./list.js";
import $messages from "./messages/index.js";
import $metadata from "./metadata/index.js";
import $quota from "./quota/index.js";
import $types from "./types/index.js";
import $update from "./update.js";
import $user from "./user/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * requests command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "requests",
	describe:
		"Additional request operations — priority listing and asset creation",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($get)
			.command($list)
			.command($update)
			.command($assets)
			.command($constants)
			.command($legalresponse)
			.command($messages)
			.command($metadata)
			.command($quota)
			.command($types)
			.command($user)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

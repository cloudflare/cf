import $assets from "./assets/index.js";
import $constants from "./constants/index.js";
import $getrequestlist from "./get-request-list.js";
import $getrequestread from "./get-request-read.js";
import $legalresponse from "./legal-response/index.js";
import $messages from "./messages/index.js";
import $metadata from "./metadata/index.js";
import $postrequestcreate from "./post-request-create.js";
import $putrequestupdate from "./put-request-update.js";
import $quota from "./quota/index.js";
import $types from "./types/index.js";
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
			.command($getrequestlist)
			.command($getrequestread)
			.command($postrequestcreate)
			.command($putrequestupdate)
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

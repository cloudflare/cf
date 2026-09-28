import $assetnew from "./asset-new/index.js";
import $assets from "./assets/index.js";
import $cloudforceOneRequestGet from "./cloudforceOneRequestGet.js";
import $cloudforceOneRequestList from "./cloudforceOneRequestList.js";
import $cloudforceOneRequestNew from "./cloudforceOneRequestNew.js";
import $cloudforceOneRequestUpdate from "./cloudforceOneRequestUpdate.js";
import $constants from "./constants.js";
import $delete from "./delete.js";
import $getRequestList from "./getRequestList.js";
import $getRequestRead from "./getRequestRead.js";
import $legalresponse from "./legal-response/index.js";
import $message from "./message/index.js";
import $messages from "./messages/index.js";
import $metadata from "./metadata/index.js";
import $postRequestCreate from "./postRequestCreate.js";
import $priority from "./priority/index.js";
import $putRequestUpdate from "./putRequestUpdate.js";
import $quota from "./quota.js";
import $types from "./types.js";
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
			.command($cloudforceOneRequestGet)
			.command($cloudforceOneRequestList)
			.command($cloudforceOneRequestNew)
			.command($cloudforceOneRequestUpdate)
			.command($constants)
			.command($delete)
			.command($getRequestList)
			.command($getRequestRead)
			.command($postRequestCreate)
			.command($putRequestUpdate)
			.command($quota)
			.command($types)
			.command($assetnew)
			.command($assets)
			.command($legalresponse)
			.command($message)
			.command($messages)
			.command($metadata)
			.command($priority)
			.command($user)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

import $bulk from "./bulk/index.js";
import $keys from "./keys/index.js";
import $metadata from "./metadata/index.js";
import $namespaces from "./namespaces/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * kv command
 * @generated from apis/overlays/kv.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "kv",
	describe: "kv",

	builder: (yargs) => {
		return yargs
			.command($bulk)
			.command($keys)
			.command($metadata)
			.command($namespaces)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

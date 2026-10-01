import $run from "#commands/ai/run/index.js";
import $authors from "./authors/index.js";
import $finetunes from "./finetunes/index.js";
import $getmodelschema from "./get-model-schema.js";
import $listmarkdownsupportedformats from "./list-markdown-supported-formats.js";
import $models from "./models/index.js";
import $tasks from "./tasks/index.js";
import $tomarkdown from "./to-markdown.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ai command
 * @generated from apis/overlays/ai.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ai",
	describe: "ai",

	builder: (yargs) => {
		return yargs
			.command($getmodelschema)
			.command($listmarkdownsupportedformats)
			.command($run)
			.command($tomarkdown)
			.command($authors)
			.command($finetunes)
			.command($models)
			.command($tasks)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

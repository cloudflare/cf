import $authors from "./authors/index.js";
import $finetunes from "./finetunes/index.js";
import $getmodelschema from "./get-model-schema.js";
import $listmarkdownsupportedformats from "./list-markdown-supported-formats.js";
import $models from "./models/index.js";
import $tasks from "./tasks/index.js";
import $tomarkdown from "./to-markdown.js";
import $websearch from "./websearch.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ai command
 * @generated from apis/overlays/ai.ts
 */
import type { CommandModule } from "yargs";
import $claude from "#commands/ai/claude/index.js";
import $codex from "#commands/ai/codex/index.js";
import $opencode from "#commands/ai/opencode/index.js";
import $run from "#commands/ai/run/index.js";

const command: CommandModule<CommonYargsOptions> = {
	command: "ai",
	describe: "ai",

	builder: (yargs) => {
		return yargs
			.command($claude)
			.command($codex)
			.command($getmodelschema)
			.command($listmarkdownsupportedformats)
			.command($opencode)
			.command($run)
			.command($tomarkdown)
			.command($websearch)
			.command($authors)
			.command($finetunes)
			.command($models)
			.command($tasks)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;

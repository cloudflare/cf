import $authors from "./authors/index.js";
import $finetunes from "./finetunes/index.js";
import $getmodelschema from "./get-model-schema.js";
import $listmarkdownsupportedformats from "./list-markdown-supported-formats.js";
import $models from "./models/index.js";
import $tasks from "./tasks/index.js";
import $tomarkdown from "./to-markdown.js";
import $websearch from "./websearch.js";
import $run from "#commands/ai/run/index.js";
/**
 * ai command
 * @generated from apis/overlays/ai.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ai",
	describe: "ai",

	routes: {
		"get-model-schema": $getmodelschema,
		"list-markdown-supported-formats": $listmarkdownsupportedformats,
		run: $run,
		"to-markdown": $tomarkdown,
		websearch: $websearch,
		authors: $authors,
		finetunes: $finetunes,
		models: $models,
		tasks: $tasks,
	},
});

export default command;

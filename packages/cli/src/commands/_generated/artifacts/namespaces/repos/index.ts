import $blobs from "./blobs/index.js";
import $commits from "./commits/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $files from "./files/index.js";
import $fork from "./fork.js";
import $get from "./get.js";
import $import from "./import.js";
import $list from "./list.js";
import $logs from "./logs/index.js";
import $raw from "./raw/index.js";
import $tokens from "./tokens/index.js";
import $trees from "./trees/index.js";
/**
 * repos command group
 * @generated from apis/overlays/artifacts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "repos",
	describe: "Operations for namespaces.repos",

	routes: {
		create: $create,
		delete: $delete,
		fork: $fork,
		get: $get,
		import: $import,
		list: $list,
		blobs: $blobs,
		commits: $commits,
		files: $files,
		logs: $logs,
		raw: $raw,
		tokens: $tokens,
		trees: $trees,
	},
});

export default command;

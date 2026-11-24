import $cancel from "./cancel.js";
import $create from "./create.js";
import $deployhooks from "./deploy-hooks/index.js";
import $get from "./get.js";
import $limits from "./limits/index.js";
import $list from "./list.js";
import $logs from "./logs.js";
import $previews from "./previews/index.js";
import $repos from "./repos/index.js";
import $retry from "./retry.js";
import $tokens from "./tokens/index.js";
import $versions from "./versions/index.js";
import $workers from "./workers/index.js";
/**
 * builds command
 * @generated from apis/overlays/builds.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "builds",
	describe:
		"Build and deploy Workers from connected repositories, then inspect build status and logs.",

	routes: {
		cancel: $cancel,
		create: $create,
		get: $get,
		list: $list,
		logs: $logs,
		retry: $retry,
		"deploy-hooks": $deployhooks,
		limits: $limits,
		previews: $previews,
		repos: $repos,
		tokens: $tokens,
		versions: $versions,
		workers: $workers,
	},
});

export default command;

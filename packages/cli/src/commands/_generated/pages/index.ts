import $buildcache from "./build-cache/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $deployments from "./deployments/index.js";
import $domains from "./domains/index.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $source from "./source/index.js";
import $deploy from "#commands/pages/deploy/index.js";
/**
 * pages command
 * @generated from apis/overlays/pages.ts
 */
import { apiGroup } from "#lib/api-command.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";

const command = apiGroup({
	command: "pages",
	describe:
		"Full-stack application hosting with Git-integrated builds, preview deployments, and custom domains",

	routes: {
		create: $create,
		delete: $delete,
		deploy: withHandWrittenDryRun($deploy, "preview"),
		edit: $edit,
		get: $get,
		list: $list,
		"build-cache": $buildcache,
		deployments: $deployments,
		domains: $domains,
		source: $source,
	},
});

export default command;

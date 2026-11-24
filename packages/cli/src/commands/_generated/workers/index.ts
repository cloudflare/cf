import $deployments from "./deployments/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $previews from "./previews/index.js";
import $scripts from "./scripts/index.js";
import $secrets from "./secrets/index.js";
import $versions from "./versions/index.js";
import $check from "#commands/workers/check/index.js";
import $delete from "#commands/workers/delete/index.js";
import $triggers from "#commands/workers/triggers/index.js";
import $types from "#commands/workers/types/index.js";
/**
 * workers command
 * @generated from apis/overlays/workers.ts
 */
import { apiGroup } from "#lib/api-command.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";

const command = apiGroup({
	command: "workers",
	describe:
		"Deploy and manage serverless JavaScript/WASM applications on Cloudflare's global network",

	routes: {
		check: withHandWrittenDryRun($check, "preview"),
		delete: $delete,
		get: $get,
		list: $list,
		types: withHandWrittenDryRun($types, "preview"),
		deployments: $deployments,
		previews: $previews,
		scripts: $scripts,
		secrets: $secrets,
		triggers: withHandWrittenDryRun($triggers, "native"),
		versions: $versions,
	},
});

export default command;

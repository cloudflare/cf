import $config from "./config/index.js";
import $connections from "./connections/index.js";
import $connectors from "./connectors/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $hostnames from "./hostnames/index.js";
import $list from "./list.js";
import $managementtoken from "./management-token/index.js";
import $token from "./token/index.js";
import $diag from "#commands/tunnels/diag/index.js";
import $login from "#commands/tunnels/login/index.js";
import $quickstart from "#commands/tunnels/quick-start/index.js";
import $ready from "#commands/tunnels/ready/index.js";
import $run from "#commands/tunnels/run/index.js";
import $tail from "#commands/tunnels/tail/index.js";
/**
 * tunnels command
 * @generated from apis/overlays/tunnels.ts
 */
import { apiGroup } from "#lib/api-command.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";

const command = apiGroup({
	command: "tunnels",
	describe: "tunnels",

	routes: {
		create: $create,
		delete: $delete,
		diag: withHandWrittenDryRun($diag, "preview"),
		edit: $edit,
		get: $get,
		list: $list,
		login: withHandWrittenDryRun($login, "preview"),
		"quick-start": withHandWrittenDryRun($quickstart, "preview"),
		ready: withHandWrittenDryRun($ready, "preview"),
		run: withHandWrittenDryRun($run, "preview"),
		tail: withHandWrittenDryRun($tail, "preview"),
		config: $config,
		connections: $connections,
		connectors: $connectors,
		hostnames: $hostnames,
		"management-token": $managementtoken,
		token: $token,
	},
});

export default command;

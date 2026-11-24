import $acls from "./acls/index.js";
import $appconfiguration from "./app-configuration/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $lans from "./lans/index.js";
import $list from "./list.js";
import $netflowconfig from "./netflow-config/index.js";
import $update from "./update.js";
import $wans from "./wans/index.js";
/**
 * sites command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "sites",
	describe:
		"Magic WAN branch sites — base CRUD, LAN/WAN interface configuration, ACLs, connectors, app configuration, and NetFlow config",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		update: $update,
		acls: $acls,
		"app-configuration": $appconfiguration,
		lans: $lans,
		"netflow-config": $netflowconfig,
		wans: $wans,
	},
});

export default command;

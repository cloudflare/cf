import $delete from "./delete.js";
import $update from "./update.js";
/**
 * certificates command group
 * @generated from apis/overlays/custom-hostnames.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "certificates",
	describe: "Operations for certificate-pack.certificates",

	routes: {
		delete: $delete,
		update: $update,
	},
});

export default command;

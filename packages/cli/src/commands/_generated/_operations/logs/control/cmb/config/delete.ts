/** @generated from logs.control.cmb.config.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/logs/control/cmb/config`,
} as const;

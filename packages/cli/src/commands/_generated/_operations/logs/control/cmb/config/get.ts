/** @generated from logs.control.cmb.config.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/logs/control/cmb/config`,
} as const;

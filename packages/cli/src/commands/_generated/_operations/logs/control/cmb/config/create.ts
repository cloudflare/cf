/** @generated from logs.control.cmb.config.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/logs/control/cmb/config`,
	body: "json",
} as const;

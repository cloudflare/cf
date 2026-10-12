/** @generated from slurper-check-source-connectivity */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/slurper/source/connectivity-precheck`,
	body: "json",
} as const;

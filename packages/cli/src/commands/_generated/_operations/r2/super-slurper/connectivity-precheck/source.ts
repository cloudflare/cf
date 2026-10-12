/** @generated from r2.super-slurper.connectivity-precheck.source */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/slurper/source/connectivity-precheck`,
	body: "json",
} as const;

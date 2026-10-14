/** @generated from r2.super-slurper.connectivity-precheck.target */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/slurper/target/connectivity-precheck`,
	body: "json",
	constants: {
		vendor: "r2",
	},
} as const;

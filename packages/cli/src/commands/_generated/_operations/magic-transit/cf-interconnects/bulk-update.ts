/** @generated from magic-transit.cf-interconnects.bulk-update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cf_interconnects`,
	headers: ["x-magic-new-hc-target"],
	body: "json",
} as const;

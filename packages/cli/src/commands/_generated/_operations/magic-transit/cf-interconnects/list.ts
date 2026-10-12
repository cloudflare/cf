/** @generated from magic-interconnects-list-interconnects */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cf_interconnects`,
	headers: ["x-magic-new-hc-target"],
} as const;

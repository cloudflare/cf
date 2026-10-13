/** @generated from magic-transit.cf-interconnects.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cf_interconnects/${request.cf_interconnect_id}`,
	headers: ["x-magic-new-hc-target"],
} as const;

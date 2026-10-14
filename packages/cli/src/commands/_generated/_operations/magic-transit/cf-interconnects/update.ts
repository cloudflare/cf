/** @generated from magic-transit.cf-interconnects.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cf_interconnects/${request.cf_interconnect_id}`,
	headers: ["x-magic-new-hc-target"],
	body: "json",
} as const;

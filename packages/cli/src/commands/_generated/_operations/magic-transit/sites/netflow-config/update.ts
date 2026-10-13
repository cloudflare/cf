/** @generated from magic-transit.sites.netflow-config.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/netflow_config`,
	body: "json",
} as const;

/** @generated from magic-transit.sites.netflow-config.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/netflow_config`,
} as const;

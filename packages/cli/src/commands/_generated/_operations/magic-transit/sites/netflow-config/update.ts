/** @generated from magic-site-netflow-config-update-netflow-config */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/netflow_config`,
	body: "json",
} as const;

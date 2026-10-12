/** @generated from magic-site-netflow-config-create-netflow-config */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/netflow_config`,
	body: "json",
} as const;

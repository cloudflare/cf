/** @generated from magic-site-netflow-config-delete-netflow-config */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/netflow_config`,
} as const;

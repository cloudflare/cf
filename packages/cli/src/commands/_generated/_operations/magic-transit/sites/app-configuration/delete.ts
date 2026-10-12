/** @generated from magic-site-app-configs-delete-app-config */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/app_configs/${request.app_config_id}`,
} as const;

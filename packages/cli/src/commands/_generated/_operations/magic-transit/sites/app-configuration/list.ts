/** @generated from magic-site-app-configs-list-app-configs */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/app_configs`,
} as const;

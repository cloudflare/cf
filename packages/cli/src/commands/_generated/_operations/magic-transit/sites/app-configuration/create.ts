/** @generated from magic-transit.sites.app-configuration.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/app_configs`,
	body: "json",
} as const;

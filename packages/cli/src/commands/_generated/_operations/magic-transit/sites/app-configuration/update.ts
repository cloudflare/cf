/** @generated from magic-transit.sites.app-configuration.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/app_configs/${request.app_config_id}`,
	body: "json",
} as const;

/** @generated from zero-trust.access.applications.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/apps/${request.app_id}`,
	body: "json",
} as const;

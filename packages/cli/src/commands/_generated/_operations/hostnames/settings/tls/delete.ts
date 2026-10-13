/** @generated from hostnames.settings.tls.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/hostnames/settings/${request.setting_id}/${request.hostname}`,
} as const;

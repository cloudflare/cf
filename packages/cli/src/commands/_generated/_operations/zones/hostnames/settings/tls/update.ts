/** @generated from zones.hostnames.settings.tls.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/hostnames/settings/${request.setting_id}/${request.hostname}`,
	body: "json",
} as const;

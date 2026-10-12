/** @generated from ssl-detector-automatic-mode-patch-enrollment */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/ssl_automatic_mode`,
	body: "json",
} as const;

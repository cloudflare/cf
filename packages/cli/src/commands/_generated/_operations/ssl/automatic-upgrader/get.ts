/** @generated from ssl-detector-automatic-mode-get-enrollment */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/ssl_automatic_mode`,
} as const;

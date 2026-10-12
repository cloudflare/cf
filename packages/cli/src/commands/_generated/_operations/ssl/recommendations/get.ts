/** @generated from ssl/-tls-mode-recommendation-ssl/-tls-recommendation */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/recommendation`,
} as const;

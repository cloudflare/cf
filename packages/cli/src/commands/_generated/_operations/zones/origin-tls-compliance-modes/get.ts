/** @generated from zone-cache-settings-get-origin-tls-compliance-modes-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/origin_tls_compliance_modes`,
} as const;

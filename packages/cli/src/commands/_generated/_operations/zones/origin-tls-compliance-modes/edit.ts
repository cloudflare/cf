/** @generated from zone-cache-settings-change-origin-tls-compliance-modes-setting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/origin_tls_compliance_modes`,
	body: "json",
} as const;

/** @generated from zone-cache-settings-replace-origin-tls-compliance-modes-setting */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/origin_tls_compliance_modes`,
	body: "json",
} as const;

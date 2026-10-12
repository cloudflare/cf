/** @generated from zone-cache-settings-delete-origin-tls-compliance-modes-setting */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/origin_tls_compliance_modes`,
} as const;

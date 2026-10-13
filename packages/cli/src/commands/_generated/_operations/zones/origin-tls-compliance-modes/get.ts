/** @generated from zones.origin-tls-compliance-modes.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/origin_tls_compliance_modes`,
} as const;

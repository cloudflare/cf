/** @generated from certificate-packs-restart-validation-for-advanced-certificate-manager-certificate-pack */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/certificate_packs/${request.certificate_pack_id}`,
	body: "json",
} as const;

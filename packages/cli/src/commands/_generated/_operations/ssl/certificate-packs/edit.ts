/** @generated from ssl.certificate-packs.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/certificate_packs/${request.certificate_pack_id}`,
	body: "json",
} as const;

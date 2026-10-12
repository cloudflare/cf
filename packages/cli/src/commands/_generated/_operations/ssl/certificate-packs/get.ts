/** @generated from certificate-packs-get-certificate-pack */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/certificate_packs/${request.certificate_pack_id}`,
} as const;

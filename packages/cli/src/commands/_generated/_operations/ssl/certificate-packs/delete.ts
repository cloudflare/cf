/** @generated from ssl.certificate-packs.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/certificate_packs/${request.certificate_pack_id}`,
} as const;

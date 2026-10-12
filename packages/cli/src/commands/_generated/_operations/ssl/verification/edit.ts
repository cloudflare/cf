/** @generated from ssl-verification-edit-ssl-certificate-pack-validation-method */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/verification/${request.certificate_pack_id}`,
	body: "json",
} as const;

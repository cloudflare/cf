/** @generated from custom-hostnames.certificate-pack.certificates.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames/${request.custom_hostname_id}/certificate_pack/${request.certificate_pack_id}/certificates/${request.certificate_id}`,
} as const;

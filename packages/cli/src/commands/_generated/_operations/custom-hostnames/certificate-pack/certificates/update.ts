/** @generated from custom-hostname-for-a-zone-edit-custom-certificate-custom-hostname */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames/${request.custom_hostname_id}/certificate_pack/${request.certificate_pack_id}/certificates/${request.certificate_id}`,
	body: "json",
} as const;

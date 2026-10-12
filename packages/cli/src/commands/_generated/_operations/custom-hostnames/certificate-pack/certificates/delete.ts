/** @generated from custom-hostname-for-a-zone-delete_single_certificate_and_key_in_a_custom_hostname */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/custom_hostnames/${request.custom_hostname_id}/certificate_pack/${request.certificate_pack_id}/certificates/${request.certificate_id}`,
} as const;

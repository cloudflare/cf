/** @generated from zero-trust.access.mtls-certificates.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/certificates/${request.certificate_id}`,
} as const;

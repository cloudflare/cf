/** @generated from ssl.certificate-packs.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/ssl/certificate_packs/order`,
	body: "json",
	constants: {
		type: "advanced",
	},
} as const;

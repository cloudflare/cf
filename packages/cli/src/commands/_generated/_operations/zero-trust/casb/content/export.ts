/** @generated from CreateContentExport */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/content/export`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;

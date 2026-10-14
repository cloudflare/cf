/** @generated from logos.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/brand-protection/logos/${request.logo_id}`,
	response: false,
} as const;

/** @generated from zero-trust.dlp.sensitivity-groups.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/sensitivity_groups`,
	body: "json",
} as const;

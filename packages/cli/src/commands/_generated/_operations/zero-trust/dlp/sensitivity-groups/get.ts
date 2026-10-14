/** @generated from zero-trust.dlp.sensitivity-groups.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/sensitivity_groups/${request.sensitivity_group_id}`,
} as const;

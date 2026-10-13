/** @generated from zero-trust.dlp.sensitivity-groups.update-level-order */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/sensitivity_groups/${request.sensitivity_group_id}/level_order`,
	body: "json",
} as const;

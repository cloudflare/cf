/** @generated from zero-trust.dlp.sensitivity-levels.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/sensitivity_groups/${request.sensitivity_group_id}/levels/${request.sensitivity_level_id}`,
} as const;

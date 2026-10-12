/** @generated from dlp-sensitivity-levels-update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/sensitivity_groups/${request.sensitivity_group_id}/levels/${request.sensitivity_level_id}`,
	body: "json",
} as const;

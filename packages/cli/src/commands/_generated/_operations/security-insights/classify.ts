/** @generated from generated:patch:/{account_or_zone}/{account_or_zone_id}/security-center/insights/{issue_id}/classification */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/security-center/insights/${request.issue_id}/classification`,
	body: "json",
} as const;

/** @generated from generated:put:/{account_or_zone}/{account_or_zone_id}/security-center/insights/{issue_id}/dismiss */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/security-center/insights/${request.issue_id}/dismiss`,
	body: "json",
} as const;

/** @generated from zero-trust.access.rule-groups.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/groups/${request.group_id}`,
	body: "json",
} as const;

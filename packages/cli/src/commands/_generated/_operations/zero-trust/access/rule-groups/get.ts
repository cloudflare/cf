/** @generated from zero-trust.access.rule-groups.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/groups/${request.group_id}`,
} as const;

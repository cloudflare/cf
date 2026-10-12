/** @generated from cloudforce-one.threat-signals.curated-feeds.opt-out */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/curated-feeds/opt-out`,
	body: "json",
} as const;

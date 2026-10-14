/** @generated from zero-trust.dlp.sensitivity-group-templates.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/sensitivity_groups/templates`,
} as const;

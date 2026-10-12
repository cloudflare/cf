/** @generated from dlp-sensitivity-group-template-read */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/sensitivity_groups/templates/${request.template_id}`,
} as const;

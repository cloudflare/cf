/** @generated from images.config.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v1/config`,
	body: "json",
} as const;

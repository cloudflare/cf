/** @generated from tags.account-resources.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/tags`,
	headers: ["If-Match"],
	body: "json",
	errors: {
		412: "PreconditionFailedError",
	},
} as const;

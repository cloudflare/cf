/** @generated from generated:delete:/{account_or_zone}/{account_or_zone_id}/tags */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/tags`,
	headers: ["If-Match"],
	body: "json",
	response: false,
	errors: {
		412: "PreconditionFailedError",
	},
} as const;

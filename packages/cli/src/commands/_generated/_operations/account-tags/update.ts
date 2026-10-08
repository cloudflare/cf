/** @generated from account-tags.update */
export default {
	method: "PUT",
	path: "/{account_or_zone}/{account_or_zone_id}/tags",
	headers: ["If-Match"],
	body: "json",
	errors: {
		412: "PreconditionFailedError",
	},
} as const;

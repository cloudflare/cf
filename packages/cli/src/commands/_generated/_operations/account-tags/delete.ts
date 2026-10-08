/** @generated from account-tags.delete */
export default {
	method: "DELETE",
	path: "/{account_or_zone}/{account_or_zone_id}/tags",
	headers: ["If-Match"],
	body: "json",
	response: false,
	errors: {
		412: "PreconditionFailedError",
	},
} as const;

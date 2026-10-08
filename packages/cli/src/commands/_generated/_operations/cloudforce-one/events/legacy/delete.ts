/** @generated from cloudforce-one.events.legacy.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/cloudforce-one/events/{dataset_id}/delete",
	query: ["eventIds"],
	errors: {
		400: "BadRequestError",
	},
} as const;

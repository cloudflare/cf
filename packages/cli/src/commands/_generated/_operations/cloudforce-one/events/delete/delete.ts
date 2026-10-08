/** @generated from cloudforce-one.events.delete.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/cloudforce-one/events/datasets/{dataset_id}/events",
	query: ["eventIds"],
	errors: {
		400: "BadRequestError",
	},
} as const;

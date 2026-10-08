/** @generated from zero-trust.casb.webhooks.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/data-security/posture/webhooks/{webhook_id}",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
	},
} as const;

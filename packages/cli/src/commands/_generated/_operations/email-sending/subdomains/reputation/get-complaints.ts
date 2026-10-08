/** @generated from email-sending.subdomains.reputation.get-complaints */
export default {
	method: "GET",
	path: "/zones/{zone_id}/email/sending/subdomains/{subdomain_id}/reputation/complaints",
	query: ["start_at", "end_at"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		422: "UnprocessableEntityError",
		502: "BadGatewayError",
	},
} as const;

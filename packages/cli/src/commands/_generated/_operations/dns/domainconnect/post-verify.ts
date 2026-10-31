/** @generated from dns.domainconnect.post-verify */
export default {
	method: "POST",
	path: () => "/v1/verify",
	body: "json",
	response: false,
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		502: "BadGatewayError",
	},
} as const;

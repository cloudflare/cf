/** @generated from email-sending.subdomains.dns.fix */
export default {
	method: "POST",
	path: "/zones/{zone_id}/email/sending/subdomains/{subdomain_id}/dns",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;

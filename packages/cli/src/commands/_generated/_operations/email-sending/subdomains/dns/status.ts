/** @generated from email-sending.subdomains.dns.status */
export default {
	method: "GET",
	path: "/zones/{zone_id}/email/sending/subdomains/{subdomain_id}/dns/status",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;

/** @generated from email-routing.dns.get */
export default {
	method: "GET",
	path: "/zones/{zone_id}/email/routing/dns",
	query: ["subdomain"],
	errors: {
		403: "ForbiddenError",
	},
} as const;

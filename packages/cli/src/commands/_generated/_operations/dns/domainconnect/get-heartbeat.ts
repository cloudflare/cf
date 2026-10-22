/** @generated from dns.domainconnect.get-heartbeat */
export default {
	method: "GET",
	path: () => "/_heartbeat",
	response: "text",
	errors: {
		503: "ServiceUnavailableError",
	},
} as const;

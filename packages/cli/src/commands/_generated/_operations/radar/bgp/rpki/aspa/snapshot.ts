/** @generated from radar-get-bgp-rpki-aspa-snapshot */
export default {
	method: "GET",
	path: () => "/radar/bgp/rpki/aspa/snapshot",
	query: ["customerAsn", "providerAsn", "date", "includeAsnInfo", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;

/** @generated from radar.bgp.rpki.aspa.changes */
export default {
	method: "GET",
	path: () => "/radar/bgp/rpki/aspa/changes",
	query: ["dateStart", "dateEnd", "asn", "includeAsnInfo", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;

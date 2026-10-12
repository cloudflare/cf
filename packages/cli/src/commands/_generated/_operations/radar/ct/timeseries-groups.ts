/** @generated from radar-get-ct-timeseries-group */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/ct/timeseries_groups/${request.dimension}`,
	query: [
		"aggInterval",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"limitPerGroup",
		"ca",
		"caOwner",
		"duration",
		"entryType",
		"expirationStatus",
		"hasIps",
		"hasWildcards",
		"log",
		"logApi",
		"logOperator",
		"publicKeyAlgorithm",
		"signatureAlgorithm",
		"validationLevel",
		"tld",
		"normalization",
		"uniqueEntries",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;

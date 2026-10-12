/** @generated from radar-get-ct-summary */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/ct/summary/${request.dimension}`,
	query: [
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
		"tld",
		"validationLevel",
		"uniqueEntries",
		"normalization",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;

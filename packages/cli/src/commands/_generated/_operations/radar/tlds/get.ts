/** @generated from radar.tlds.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) => path`/radar/tlds/${request.tld}`,
	query: ["format"],
	errors: {
		404: "NotFoundError",
	},
} as const;

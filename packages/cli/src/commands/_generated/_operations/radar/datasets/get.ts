/** @generated from radar-get-reports-dataset-download */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/datasets/${request.alias}`,
	response: "text",
	errors: {
		400: "BadRequestError",
	},
} as const;

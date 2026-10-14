/** @generated from cloudforce-one.threat-events.datasets.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/create`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;

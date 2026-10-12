/** @generated from cloudforce-one.events.datasets.populate.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/datasets/populate`,
	errors: {
		400: "BadRequestError",
	},
} as const;

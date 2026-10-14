/** @generated from cloudforce-one.events.dataset.permissions.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/${request.dataset_id}/permissions`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;

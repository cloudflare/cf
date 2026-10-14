/** @generated from workflows.instances.events.send */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/${request.workflow_name}/instances/${request.instance_id}/events/${request.event_type}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;

/** @generated from user.load-balancers.monitors.preview.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/monitors/${request.monitor_id}/preview`,
	body: "json",
} as const;

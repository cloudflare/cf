/** @generated from waiting-room-create-waiting-room */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/waiting_rooms`,
	body: "json",
} as const;

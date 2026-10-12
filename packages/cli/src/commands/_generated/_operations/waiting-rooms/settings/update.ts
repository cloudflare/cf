/** @generated from waiting-room-update-zone-settings */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/waiting_rooms/settings`,
	body: "json",
} as const;

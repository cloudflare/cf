/** @generated from waiting-room-patch-zone-settings */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/waiting_rooms/settings`,
	body: "json",
} as const;

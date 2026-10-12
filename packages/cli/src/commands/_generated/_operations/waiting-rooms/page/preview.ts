/** @generated from waiting-room-create-a-custom-waiting-room-page-preview */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/waiting_rooms/preview`,
	body: "json",
} as const;

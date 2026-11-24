import $analytics from "./analytics/index.js";
import $apps from "./apps/index.js";
import $livestreams from "./livestreams/index.js";
import $meetings from "./meetings/index.js";
import $presets from "./presets/index.js";
import $recordings from "./recordings/index.js";
import $sessions from "./sessions/index.js";
import $webhooks from "./webhooks/index.js";
/**
 * kit command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "kit",
	describe:
		"SDK-backed meetings, participants, recordings, livestreams, and webhooks",

	routes: {
		analytics: $analytics,
		apps: $apps,
		livestreams: $livestreams,
		meetings: $meetings,
		presets: $presets,
		recordings: $recordings,
		sessions: $sessions,
		webhooks: $webhooks,
	},
});

export default command;

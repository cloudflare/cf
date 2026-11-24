import $export from "./export.js";
/**
 * transcripts command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "transcripts",
	describe: "Transcripts from historical RealtimeKit sessions",

	routes: {
		export: $export,
	},
});

export default command;

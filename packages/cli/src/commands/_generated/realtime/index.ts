import $kit from "./kit/index.js";
import $moq from "./moq/index.js";
import $sfu from "./sfu/index.js";
import $turn from "./turn/index.js";
/**
 * realtime command
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "realtime",
	describe:
		"Real-time audio, video, and data services on Cloudflare's global network",

	routes: {
		kit: $kit,
		moq: $moq,
		sfu: $sfu,
		turn: $turn,
	},
});

export default command;

import $actionlog from "./action-log/index.js";
import $detections from "./detections/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $move from "./move.js";
import $preview from "./preview/index.js";
import $raw from "./raw/index.js";
import $release from "./release.js";
import $trace from "./trace/index.js";
/**
 * investigate command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "investigate",
	describe:
		"Search and investigate email messages — view detections, traces, raw content, and take remediation actions",

	routes: {
		get: $get,
		list: $list,
		move: $move,
		release: $release,
		"action-log": $actionlog,
		detections: $detections,
		preview: $preview,
		raw: $raw,
		trace: $trace,
	},
});

export default command;

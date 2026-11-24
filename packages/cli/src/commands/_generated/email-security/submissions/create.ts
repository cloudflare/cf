/**
 * create command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		messages: {
			kind: "parsed",
			brief:
				'The messages field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"alert_id": string, "expected_disposition": "MALICIOUS" | "SUSPICIOUS" | "SPOOF" | ...more, "escalated_submission_id"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The type field",
			optional: true,
			choices: ["reclassification", "missed_detection"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create new submissions",
	usage:
		"$0 email-security submissions create\n\nSubmits messages for reclassification or to report missed detections.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

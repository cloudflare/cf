/**
 * control command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		action: {
			kind: "parsed",
			brief: "The action field",
			optional: true,
			choices: ["stop", "pause", "resume"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
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
	operands: [
		{
			placeholder: "recording-id",
			brief: "ID of the recording",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "control <recording-id>",
	describe: "Pause/Resume/Stop recording",
	usage:
		"$0 realtime kit recordings control <recording-id>\n\nPause/Resume/Stop a given recording ID. **Note:** A recording can stay paused for a maximum of 12 hours. After that, it automatically resumes and finishes.",
	...parameters,
	loader: () => import("./control.handler.js"),
});

export default command;

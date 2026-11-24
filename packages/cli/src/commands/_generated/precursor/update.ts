/**
 * update command
 * @generated from apis/overlays/precursor.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"cloudflare-version": {
			kind: "parsed",
			brief: "Selects the split Precursor API schema.",
			parse: String,
		},
		"detection-mode": {
			kind: "parsed",
			brief:
				"Controls Precursor detection for the zone. `off` disables detection,\n`monitor` records detections without affecting bot scores, and `arm`\nallows detections to affect bot scores.",
			optional: true,
			choices: ["off", "monitor", "arm"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "detection-mode", "text"),
		},
		rules: {
			kind: "parsed",
			brief:
				'The ordered list of Precursor rules for the zone. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"expression": string, "show_interstitial": boolean, "description"?: string, "enabled"?: boolean}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"show-interstitial": {
			kind: "boolean",
			brief:
				"Whether Precursor shows an interstitial when it takes action on a\nrequest.\n",
			optional: true,
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
	command: "update",
	describe: "Update Zone Precursor Config",
	usage:
		"$0 precursor update\n\nUpdates the Precursor configuration for a zone. `mode` controls whether Precursor detection is off, monitoring, or armed. `show_interstitial` controls the zone-level response when armed. `rules` is the ordered list of overrides for matching requests. This is a partial update: only the fields present in the request body are changed. - Sending an empty array (`[]`) clears all rules. - At least one of `mode`, `show_interstitial`, or `rules` must be present; an empty body (`{}`) is rejected with `400`. - Rule `id` is read-only (assigned by Cloudflare) and ignored on input. - Rule `show_interstitial` is required and controls the response for requests that match that rule. - Rule `expression` is limited to 4000 characters. The limit applies to each rule individually, not to the combined size of all rules.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

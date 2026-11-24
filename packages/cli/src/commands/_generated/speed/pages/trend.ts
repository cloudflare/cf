/**
 * trend command
 * @generated from apis/overlays/speed.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		region: {
			kind: "enum",
			brief: "A test region.",
			values: [
				"asia-east1",
				"asia-northeast1",
				"asia-northeast2",
				"asia-south1",
				"asia-southeast1",
				"australia-southeast1",
				"europe-north1",
				"europe-southwest1",
				"europe-west1",
				"europe-west2",
				"europe-west3",
				"europe-west4",
				"europe-west8",
				"europe-west9",
				"me-west1",
				"southamerica-east1",
				"us-central1",
				"us-east1",
				"us-east4",
				"us-south1",
				"us-west1",
			],
		},
		"device-type": {
			kind: "enum",
			brief: "The type of device.",
			values: ["DESKTOP", "MOBILE"],
		},
		start: { kind: "parsed", brief: "Start", parse: String },
		end: { kind: "parsed", brief: "End", optional: true, parse: String },
		tz: {
			kind: "parsed",
			brief: "The timezone of the start and end timestamps.",
			parse: String,
		},
		metrics: {
			kind: "parsed",
			brief: "A comma-separated list of metrics to include in the results.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "url", brief: "A URL.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "trend <url>",
	describe: "List core web vital metrics trend",
	usage:
		"$0 speed pages trend <url>\n\nLists the core web vital metrics trend over time for a specific page.",
	...parameters,
	loader: () => import("./trend.handler.js"),
});

export default command;

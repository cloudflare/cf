/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"account-id-body": {
			kind: "parsed",
			brief: "The accountId field",
			optional: true,
			parse: Number,
		},
		attacker: {
			kind: "parsed",
			brief: "The attacker field",
			optional: true,
			parse: String,
		},
		"attacker-country": {
			kind: "parsed",
			brief: "The attackerCountry field",
			optional: true,
			parse: String,
		},
		category: {
			kind: "parsed",
			brief: "The category field",
			optional: true,
			parse: String,
		},
		"dataset-id": {
			kind: "parsed",
			brief: "The datasetId field",
			optional: true,
			parse: String,
		},
		date: {
			kind: "parsed",
			brief: "The date field",
			optional: true,
			parse: String,
		},
		event: {
			kind: "parsed",
			brief: "The event field",
			optional: true,
			parse: String,
		},
		indicator: {
			kind: "parsed",
			brief: "The indicator field",
			optional: true,
			parse: String,
		},
		"indicator-type": {
			kind: "parsed",
			brief: "The indicatorType field",
			optional: true,
			parse: String,
		},
		indicators: {
			kind: "parsed",
			brief:
				'Array of indicators for this event. Supports multiple indicators per event for complex scenarios. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"indicatorType": string, "value": string}].',
			optional: true,
			parse: String,
		},
		insight: {
			kind: "parsed",
			brief: "The insight field",
			optional: true,
			parse: String,
		},
		"raw-data": {
			kind: "parsed",
			brief:
				'The raw.data field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"raw-source": {
			kind: "parsed",
			brief: "The raw.source field",
			optional: true,
			parse: String,
		},
		"raw-tlp": {
			kind: "parsed",
			brief: "The raw.tlp field",
			optional: true,
			parse: String,
		},
		"source-resource-id": {
			kind: "parsed",
			brief: "The source.resourceId field",
			optional: true,
			parse: String,
		},
		"source-resource-type": {
			kind: "parsed",
			brief: "The source.resourceType field",
			optional: true,
			choices: ["article"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "source-resource-type", "text"),
		},
		"source-system": {
			kind: "parsed",
			brief: "The source.system field",
			optional: true,
			choices: ["threat-signals"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "source-system", "text"),
		},
		"source-title": {
			kind: "parsed",
			brief:
				"Threat Signals article title; null for historical provenance without a stored title.",
			optional: true,
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief: "The tags field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"target-country": {
			kind: "parsed",
			brief: "The targetCountry field",
			optional: true,
			parse: String,
		},
		"target-industry": {
			kind: "parsed",
			brief: "The targetIndustry field",
			optional: true,
			parse: String,
		},
		tlp: {
			kind: "parsed",
			brief: "The tlp field",
			optional: true,
			parse: String,
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
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"source-resource-id",
				"source-resource-type",
				"source-system",
				"source-title",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"source-resource-id",
					"source-resource-type",
					"source-system",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --source-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create an event",
	usage:
		"$0 cloudforce-one threat-intel events create\n\nCreates an event in the dataset given by `datasetId`. Omitting `datasetId` is deprecated: the event is created in the default Cloudforce One Threat Events dataset, and a future release will reject the request. To create a dataset, use `threat-intel datasets create`.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

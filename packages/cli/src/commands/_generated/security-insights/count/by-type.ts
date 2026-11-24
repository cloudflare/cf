/**
 * by-type command
 * @generated from apis/overlays/security-insights.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		dismissed: { kind: "boolean", brief: "Dismissed", optional: true },
		"issue-class": {
			kind: "parsed",
			brief: "Issue class",
			variadic: true,
			optional: true,
			parse: String,
		},
		"issue-type": {
			kind: "parsed",
			brief: "Issue type",
			variadic: true,
			optional: true,
			choices: [
				"compliance_violation",
				"email_security",
				"exposed_infrastructure",
				"insecure_configuration",
				"weak_authentication",
				"configuration_suggestion",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		product: {
			kind: "parsed",
			brief: "Product",
			variadic: true,
			optional: true,
			parse: String,
		},
		source: {
			kind: "parsed",
			brief: "Source",
			variadic: true,
			optional: true,
			choices: ["cloudflare", "riskrecon"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		severity: {
			kind: "parsed",
			brief: "Severity",
			variadic: true,
			optional: true,
			choices: ["low", "moderate", "critical"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		subject: {
			kind: "parsed",
			brief: "Subject",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "by-type",
	describe: "Retrieves Security Center Insight Counts by Type",
	usage:
		"$0 security-insights count by-type\n\nRetrieves Security Center insight counts aggregated by insight type.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./by-type.handler.js"),
});

export default command;

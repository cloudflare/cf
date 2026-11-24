/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief: "The name of the app.",
			optional: true,
			parse: String,
		},
		domain: {
			kind: "parsed",
			brief: "The domain of the app.",
			optional: true,
			parse: String,
		},
		aud: {
			kind: "parsed",
			brief: "The aud of the app.",
			optional: true,
			parse: String,
		},
		"target-attributes": {
			kind: "parsed",
			brief: "Target Criteria attributes in key=value format.",
			optional: true,
			parse: String,
		},
		exact: {
			kind: "boolean",
			brief:
				"True for only exact string matches against passed name/domain query parameters.",
			optional: true,
		},
		search: {
			kind: "parsed",
			brief: "Search for apps by other listed query parameters.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
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
	command: "list",
	describe: "List Access applications",
	usage:
		"$0 zero-trust access applications list\n\nLists all Access applications in an account or zone.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

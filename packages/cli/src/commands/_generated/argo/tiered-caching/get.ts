/**
 * get command
 * @generated from apis/overlays/argo.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
	command: "get",
	describe: "Get Tiered Cache",
	usage:
		"$0 argo tiered-caching get\n\nRetrieves whether Tiered Cache is enabled for a zone. Tiered Cache reduces origin traffic by serving lower-tier cache misses from upper-tier data centers before requesting content from your origin.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

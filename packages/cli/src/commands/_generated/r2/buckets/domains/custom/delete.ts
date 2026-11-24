/**
 * delete command
 * @generated from apis/overlays/r2.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"bucket-name": {
			kind: "parsed",
			brief: "Name of the bucket.",
			parse: String,
		},
		"cf-r2-jurisdiction": {
			kind: "parsed",
			brief:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "domain",
			brief: "Name of the custom domain.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <domain>",
	describe: "Remove Custom Domain From Bucket",
	usage:
		"$0 r2 buckets domains custom delete <domain>\n\nDisconnects a custom domain from an R2 bucket and removes its configuration. Access through other enabled custom domains or the bucket's r2.dev domain is unaffected.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;

/**
 * enable command
 * @generated from apis/overlays/basin-catalog.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"credential-token": {
			kind: "parsed",
			brief: "Provides the Cloudflare API token for accessing R2.",
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
			brief:
				"Contains the optional request to enable a catalog. Send an empty body to keep the defaults. If you include `credential`, the service checks that the token can access the bucket, then stores it as the catalog's maintenance credential, like the store credentials operation. ",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "bucket-name",
			brief: "Specifies the R2 bucket name to enable as catalog.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "enable <bucket-name>",
	describe: "Enable R2 bucket as a catalog",
	usage:
		"$0 basin-catalog enable <bucket-name>\n\nEnable an R2 bucket as an Apache Iceberg catalog. This operation creates the necessary catalog infrastructure and activates the bucket for storing Iceberg metadata and data files.",
	...parameters,
	loader: () => import("./enable.handler.js"),
});

export default command;

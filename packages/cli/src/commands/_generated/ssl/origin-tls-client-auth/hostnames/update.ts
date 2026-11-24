/**
 * update command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"hostname-config": {
			kind: "parsed",
			brief:
				'The config field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"cert_id"?: string, "enabled"?: (boolean | null), "hostname"?: string}]. ? marks optional keys.',
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Enable or Disable a Hostname for Client Authentication",
	usage:
		"$0 ssl origin-tls-client-auth hostnames update\n\nAssociate a hostname to a certificate and enable, disable or invalidate the association. If disabled, client certificate will not be sent to the hostname even if activated at the zone level. 100 maximum associations on a single certificate are allowed. Note: Use a null value for parameter *enabled* to invalidate the association.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

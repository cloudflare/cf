/**
 * edit command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		enabled: {
			kind: "boolean",
			brief: "Whether or not the Keyless SSL is on or off.",
			optional: true,
		},
		host: {
			kind: "parsed",
			brief: "The keyless SSL name.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The keyless SSL name.",
			optional: true,
			parse: String,
		},
		port: {
			kind: "parsed",
			brief:
				"The keyless SSL port used to communicate between Cloudflare and the client's Keyless SSL server.",
			optional: true,
			parse: Number,
		},
		"tunnel-private-ip": {
			kind: "parsed",
			brief: "Private IP of the Key Server Host.",
			optional: true,
			parse: String,
		},
		"tunnel-vnet-id": {
			kind: "parsed",
			brief: "Cloudflare Tunnel Virtual Network ID.",
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
	operands: [
		{
			placeholder: "keyless-certificate-id",
			brief: "Keyless certificate identifier tag.",
			parse: String,
		},
	],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = ["tunnel-private-ip", "tunnel-vnet-id"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
				const missing = ["tunnel-private-ip", "tunnel-vnet-id"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --tunnel-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <keyless-certificate-id>",
	describe: "Edit Keyless SSL Configuration",
	usage:
		"$0 ssl keyless-certificates edit <keyless-certificate-id>\n\nThis will update attributes of a Keyless SSL. Consists of one or more of the following: host,name,port.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;

/**
 * create command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"bundle-method": {
			kind: "parsed",
			brief:
				"A ubiquitous bundle has the highest probability of being verified everywhere, even by clients using outdated or unusual trust stores. An optimal bundle uses the shortest chain and newest intermediates. And the force bundle verifies the chain, but does not otherwise modify it.",
			default: "ubiquitous",
			choices: ["ubiquitous", "optimal", "force"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "bundle-method", "text"),
		},
		certificate: {
			kind: "parsed",
			brief:
				"The zone's SSL certificate or SSL certificate and intermediate(s).",
			optional: true,
			parse: String,
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
			default: "24008",
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
	operands: [],
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
	command: "create",
	describe: "Create Keyless SSL Configuration",
	usage:
		"$0 ssl keyless-certificates create\n\nCreates a Keyless SSL configuration that allows SSL/TLS termination without exposing private keys to Cloudflare. Keys remain on your infrastructure.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

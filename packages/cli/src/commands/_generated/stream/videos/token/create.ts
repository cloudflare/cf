/**
 * create command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"access-rules": {
			kind: "parsed",
			brief:
				'The optional list of access rule constraints on the token. Access can be blocked or allowed based on an IP, IP range, or by country. Access rules are evaluated from first to last. If a rule matches, the associated action is applied and no further rules are evaluated. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"action"?: "allow" | "block", "country"?: [string], "ip"?: [string], "type"?: "any" | "ip.src" | "ip.geoip.country"}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		downloadable: {
			kind: "boolean",
			brief:
				"The optional boolean value that enables using signed tokens to access MP4 download links for a video.",
			default: false,
		},
		exp: {
			kind: "parsed",
			brief:
				"The optional unix epoch timestamp that specficies the time after a token is not accepted. The maximum time specification is 24 hours from issuing time. If this field is not set, the default is one hour after issuing.",
			optional: true,
			parse: Number,
		},
		"flags-original": {
			kind: "boolean",
			brief: "Whether to return the original video without transformations.",
			optional: true,
		},
		id: {
			kind: "parsed",
			brief:
				"The optional ID of a Stream signing key. If present, the `pem` field is also required.",
			optional: true,
			parse: String,
		},
		nbf: {
			kind: "parsed",
			brief:
				"The optional unix epoch timestamp that specifies the time before a the token is not accepted. If this field is not set, the default is one hour before issuing.",
			optional: true,
			parse: Number,
		},
		pem: {
			kind: "parsed",
			brief:
				"The optional base64 encoded private key in PEM format associated with a Stream signing key. If present, the `id` field is also required.",
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
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "identifier",
			brief: "A Cloudflare-generated unique identifier for a media item.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <identifier>",
	describe: "Create signed URL tokens for videos",
	usage:
		"$0 stream videos token create <identifier>\n\nCreates a signed URL token for a video. If a body is not provided in the request, a token is created with default values.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

/**
 * update command
 * @generated from apis/overlays/security-txt.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		acknowledgments: {
			kind: "parsed",
			brief:
				"Link(s) to a page where security researchers are recognised for their reports.",
			variadic: true,
			optional: true,
			parse: String,
		},
		canonical: {
			kind: "parsed",
			brief: "Canonical URI where the security.txt file is located.",
			variadic: true,
			optional: true,
			parse: String,
		},
		contact: {
			kind: "parsed",
			brief:
				"Methods that researchers should use for reporting vulnerabilities. Can be a URI for an email address, phone number, or URL.",
			variadic: true,
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief:
				"Whether or not to serve the security.txt file in this zone. If false, security.txt requests will pass through to the origin server.",
			optional: true,
		},
		encryption: {
			kind: "parsed",
			brief:
				"URI(s) pointing to a location where an encryption key that researchers should use for encrypted communications can be retrieved. The key itself must not appear in this field.",
			variadic: true,
			optional: true,
			parse: String,
		},
		expires: {
			kind: "parsed",
			brief:
				"RFC3339-formatted date and time string indicating the time that, after which, the contents of the security.txt file should be considered stale. It is recommended that this value is less than a year into the future.",
			optional: true,
			parse: String,
		},
		hiring: {
			kind: "parsed",
			brief: "Link(s) to any security-related job positions.",
			variadic: true,
			optional: true,
			parse: String,
		},
		policy: {
			kind: "parsed",
			brief: "Link(s) to where a vulnerability disclosure policy is located.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"preferred-languages": {
			kind: "parsed",
			brief:
				"Comma-separated list of natural languages that are preferred when submitting security reports. Language codes should be as defined in RFC5646.",
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
			brief: "Configuration of the zone security.txt file",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Updates security.txt",
	usage:
		"$0 security-txt update\n\nUpdates the security.txt file configuration for a zone, which provides security researchers with vulnerability reporting information.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

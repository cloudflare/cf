/**
 * source command
 * @generated from apis/overlays/r2.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		bucket: {
			kind: "parsed",
			brief: "The bucket field",
			optional: true,
			parse: String,
		},
		endpoint: {
			kind: "parsed",
			brief: "Custom S3-compatible endpoint that must use https://.",
			optional: true,
			parse: String,
		},
		keys: {
			kind: "parsed",
			brief: "The keys field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"path-prefix": {
			kind: "parsed",
			brief: "The pathPrefix field",
			optional: true,
			parse: String,
		},
		region: {
			kind: "parsed",
			brief: "The region field",
			optional: true,
			parse: String,
		},
		"secret-access-key-id": {
			kind: "parsed",
			brief: "The secret.accessKeyId field",
			optional: true,
			parse: String,
		},
		"secret-secret-access-key": {
			kind: "parsed",
			brief: "The secret.secretAccessKey field",
			optional: true,
			parse: String,
		},
		"secret-client-email": {
			kind: "parsed",
			brief: "The secret.clientEmail field",
			optional: true,
			parse: String,
		},
		"secret-private-key": {
			kind: "parsed",
			brief: "The secret.privateKey field",
			optional: true,
			parse: String,
		},
		vendor: {
			kind: "parsed",
			brief: "The vendor field",
			optional: true,
			choices: ["s3", "gcs", "r2"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "vendor", "text"),
		},
		jurisdiction: {
			kind: "parsed",
			brief: "The jurisdiction field",
			optional: true,
			choices: ["default", "eu", "us", "fedramp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "jurisdiction", "text"),
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
		rules.conflicts("endpoint", [
			"secret-client-email",
			"secret-private-key",
			"jurisdiction",
		]);
		rules.implies("endpoint", [
			"secret-access-key-id",
			"secret-secret-access-key",
		]);
		rules.conflicts("region", [
			"secret-client-email",
			"secret-private-key",
			"jurisdiction",
		]);
		rules.implies("region", [
			"secret-access-key-id",
			"secret-secret-access-key",
		]);
		rules.conflicts("secret-access-key-id", [
			"secret-client-email",
			"secret-private-key",
		]);
		rules.implies("secret-access-key-id", ["secret-secret-access-key"]);
		rules.conflicts("secret-secret-access-key", [
			"secret-client-email",
			"secret-private-key",
		]);
		rules.implies("secret-secret-access-key", ["secret-access-key-id"]);
		rules.conflicts("secret-client-email", [
			"endpoint",
			"region",
			"secret-access-key-id",
			"secret-secret-access-key",
			"jurisdiction",
		]);
		rules.implies("secret-client-email", ["secret-private-key"]);
		rules.conflicts("secret-private-key", [
			"endpoint",
			"region",
			"secret-access-key-id",
			"secret-secret-access-key",
			"jurisdiction",
		]);
		rules.implies("secret-private-key", ["secret-client-email"]);
		rules.conflicts("jurisdiction", [
			"endpoint",
			"region",
			"secret-client-email",
			"secret-private-key",
		]);
		rules.implies("jurisdiction", [
			"secret-access-key-id",
			"secret-secret-access-key",
		]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "source",
	describe: "Check source connectivity",
	usage:
		"$0 r2 super-slurper connectivity-precheck source\n\nCheck whether tokens are valid against the source bucket",
	...parameters,
	loader: () => import("./source.handler.js"),
});

export default command;

/**
 * create command
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
		overwrite: { kind: "boolean", brief: "The overwrite field", default: true },
		"source-bucket": {
			kind: "parsed",
			brief: "The source.bucket field",
			optional: true,
			parse: String,
		},
		"source-endpoint": {
			kind: "parsed",
			brief: "Custom S3-compatible endpoint that must use https://.",
			optional: true,
			parse: String,
		},
		"source-keys": {
			kind: "parsed",
			brief: "The source.keys field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"source-path-prefix": {
			kind: "parsed",
			brief: "The source.pathPrefix field",
			optional: true,
			parse: String,
		},
		"source-region": {
			kind: "parsed",
			brief: "The source.region field",
			optional: true,
			parse: String,
		},
		"source-secret-access-key-id": {
			kind: "parsed",
			brief: "The source.secret.accessKeyId field",
			optional: true,
			parse: String,
		},
		"source-secret-secret-access-key": {
			kind: "parsed",
			brief: "The source.secret.secretAccessKey field",
			optional: true,
			parse: String,
		},
		"source-secret-client-email": {
			kind: "parsed",
			brief: "The source.secret.clientEmail field",
			optional: true,
			parse: String,
		},
		"source-secret-private-key": {
			kind: "parsed",
			brief: "The source.secret.privateKey field",
			optional: true,
			parse: String,
		},
		"source-vendor": {
			kind: "parsed",
			brief: "The source.vendor field",
			optional: true,
			choices: ["s3", "gcs", "r2"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "source-vendor", "text"),
		},
		"source-jurisdiction": {
			kind: "parsed",
			brief: "The source.jurisdiction field",
			optional: true,
			choices: ["default", "eu", "us", "fedramp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "source-jurisdiction", "text"),
		},
		"target-bucket": {
			kind: "parsed",
			brief: "The target.bucket field",
			optional: true,
			parse: String,
		},
		"target-jurisdiction": {
			kind: "parsed",
			brief: "The target.jurisdiction field",
			optional: true,
			choices: ["default", "eu", "us", "fedramp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "target-jurisdiction", "text"),
		},
		"target-secret-access-key-id": {
			kind: "parsed",
			brief: "The target.secret.accessKeyId field",
			optional: true,
			parse: String,
		},
		"target-secret-secret-access-key": {
			kind: "parsed",
			brief: "The target.secret.secretAccessKey field",
			optional: true,
			parse: String,
		},
		"target-vendor": {
			kind: "parsed",
			brief: "The target.vendor field",
			optional: true,
			choices: ["r2"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "target-vendor", "text"),
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
		rules.conflicts("source-endpoint", [
			"source-secret-client-email",
			"source-secret-private-key",
			"source-jurisdiction",
		]);
		rules.implies("source-endpoint", [
			"source-secret-access-key-id",
			"source-secret-secret-access-key",
		]);
		rules.conflicts("source-region", [
			"source-secret-client-email",
			"source-secret-private-key",
			"source-jurisdiction",
		]);
		rules.implies("source-region", [
			"source-secret-access-key-id",
			"source-secret-secret-access-key",
		]);
		rules.conflicts("source-secret-access-key-id", [
			"source-secret-client-email",
			"source-secret-private-key",
		]);
		rules.implies("source-secret-access-key-id", [
			"source-secret-secret-access-key",
		]);
		rules.conflicts("source-secret-secret-access-key", [
			"source-secret-client-email",
			"source-secret-private-key",
		]);
		rules.implies("source-secret-secret-access-key", [
			"source-secret-access-key-id",
		]);
		rules.conflicts("source-secret-client-email", [
			"source-endpoint",
			"source-region",
			"source-secret-access-key-id",
			"source-secret-secret-access-key",
			"source-jurisdiction",
		]);
		rules.implies("source-secret-client-email", ["source-secret-private-key"]);
		rules.conflicts("source-secret-private-key", [
			"source-endpoint",
			"source-region",
			"source-secret-access-key-id",
			"source-secret-secret-access-key",
			"source-jurisdiction",
		]);
		rules.implies("source-secret-private-key", ["source-secret-client-email"]);
		rules.conflicts("source-jurisdiction", [
			"source-endpoint",
			"source-region",
			"source-secret-client-email",
			"source-secret-private-key",
		]);
		rules.implies("source-jurisdiction", [
			"source-secret-access-key-id",
			"source-secret-secret-access-key",
		]);
		rules.check((argv) => {
			const groupSet = [
				"source-bucket",
				"source-endpoint",
				"source-keys",
				"source-path-prefix",
				"source-region",
				"source-secret-access-key-id",
				"source-secret-secret-access-key",
				"source-secret-client-email",
				"source-secret-private-key",
				"source-vendor",
				"source-jurisdiction",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["source-bucket", "source-vendor"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --source-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"target-bucket",
				"target-jurisdiction",
				"target-secret-access-key-id",
				"target-secret-secret-access-key",
				"target-vendor",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"target-bucket",
					"target-secret-access-key-id",
					"target-secret-secret-access-key",
					"target-vendor",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --target-* flag is set`
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
	describe: "Create a job",
	usage:
		"$0 r2 super-slurper jobs create\n\nCreates a new R2 Super Slurper migration job to transfer objects from a source bucket (e.g. S3, GCS, R2) to R2.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

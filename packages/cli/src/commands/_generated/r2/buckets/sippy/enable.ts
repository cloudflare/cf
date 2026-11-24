/**
 * enable command
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
		"cf-r2-jurisdiction": {
			kind: "parsed",
			brief:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
			optional: true,
			parse: String,
		},
		"destination-access-key-id": {
			kind: "parsed",
			brief:
				'ID of a Cloudflare API token.\nThis is the value labelled "Access Key ID" when creating an API.\ntoken from the [R2 dashboard](https://dash.cloudflare.com/?to=/:account/r2/api-tokens).\n\nSippy will use this token when writing objects to R2, so it is\nbest to scope this token to the bucket you\'re enabling Sippy for.',
			optional: true,
			parse: String,
		},
		"destination-provider": {
			kind: "parsed",
			brief: "The destination.provider field",
			optional: true,
			choices: ["r2"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "destination-provider", "text"),
		},
		"destination-secret-access-key": {
			kind: "parsed",
			brief:
				'Value of a Cloudflare API token.\nThis is the value labelled "Secret Access Key" when creating an API.\ntoken from the [R2 dashboard](https://dash.cloudflare.com/?to=/:account/r2/api-tokens).\n\nSippy will use this token when writing objects to R2, so it is\nbest to scope this token to the bucket you\'re enabling Sippy for.',
			optional: true,
			parse: String,
		},
		"source-access-key-id": {
			kind: "parsed",
			brief:
				"Access Key ID of an IAM credential (ideally scoped to a single S3 bucket).",
			optional: true,
			parse: String,
		},
		"source-bucket": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- Name of the AWS S3 bucket.\n- Name of the GCS bucket.",
			optional: true,
			parse: String,
		},
		"source-provider": {
			kind: "parsed",
			brief: "The source.provider field",
			optional: true,
			choices: ["aws", "gcs", "s3", "azure"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "source-provider", "text"),
		},
		"source-region": {
			kind: "parsed",
			brief: "AWS region containing the source S3 bucket.",
			optional: true,
			parse: String,
		},
		"source-secret-access-key": {
			kind: "parsed",
			brief:
				"Secret Access Key of an IAM credential (ideally scoped to a single S3 bucket).",
			optional: true,
			parse: String,
		},
		"source-client-email": {
			kind: "parsed",
			brief:
				"Client email of an IAM credential (ideally scoped to a single GCS bucket).",
			optional: true,
			parse: String,
		},
		"source-private-key": {
			kind: "parsed",
			brief:
				"Private Key of an IAM credential (ideally scoped to a single GCS bucket).",
			optional: true,
			parse: String,
		},
		"source-bucket-url": {
			kind: "parsed",
			brief: "URL to the S3-compatible API of the bucket.",
			optional: true,
			parse: String,
		},
		"source-account-key": {
			kind: "parsed",
			brief:
				"Access key for the Azure Storage account. Mutually exclusive with sasToken.",
			optional: true,
			parse: String,
		},
		"source-account-name": {
			kind: "parsed",
			brief: "Name of the Azure Storage account.",
			optional: true,
			parse: String,
		},
		"source-container": {
			kind: "parsed",
			brief: "Name of the Azure Blob Storage container.",
			optional: true,
			parse: String,
		},
		"source-sas-token": {
			kind: "parsed",
			brief:
				"Shared Access Signature token for the Azure Storage account. Mutually exclusive with accountKey.",
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
		{ placeholder: "bucket-name", brief: "Name of the bucket.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "enable <bucket-name>",
	describe: "Enable Sippy",
	usage:
		"$0 r2 buckets sippy enable <bucket-name>\n\nConfigures and enables Sippy on-demand migration for an R2 bucket. When a requested object is missing from R2, Sippy serves it from the configured source storage provider and copies it to R2.",
	...parameters,
	loader: () => import("./enable.handler.js"),
});

export default command;

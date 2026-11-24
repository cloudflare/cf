/**
 * replace command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"user-population-id": { kind: "parsed", brief: "UUID.", parse: String },
		active: { kind: "boolean", brief: "The active field", optional: true },
		"display-name": {
			kind: "parsed",
			brief: "The displayName field",
			optional: true,
			parse: String,
		},
		emails: {
			kind: "parsed",
			brief:
				'The emails field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"primary"?: boolean, "type"?: string, "value"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"external-id": {
			kind: "parsed",
			brief: "The externalId field",
			optional: true,
			parse: String,
		},
		"meta-created": {
			kind: "parsed",
			brief: "The meta.created field",
			optional: true,
			parse: String,
		},
		"meta-last-modified": {
			kind: "parsed",
			brief: "The meta.lastModified field",
			optional: true,
			parse: String,
		},
		"meta-location": {
			kind: "parsed",
			brief: "The meta.location field",
			optional: true,
			parse: String,
		},
		"meta-resource-type": {
			kind: "parsed",
			brief: "The meta.resourceType field",
			optional: true,
			parse: String,
		},
		"meta-version": {
			kind: "parsed",
			brief: "The meta.version field",
			optional: true,
			parse: String,
		},
		"name-family-name": {
			kind: "parsed",
			brief: "The name.familyName field",
			optional: true,
			parse: String,
		},
		"name-formatted": {
			kind: "parsed",
			brief: "The name.formatted field",
			optional: true,
			parse: String,
		},
		"name-given-name": {
			kind: "parsed",
			brief: "The name.givenName field",
			optional: true,
			parse: String,
		},
		"name-honorific-prefix": {
			kind: "parsed",
			brief: "The name.honorificPrefix field",
			optional: true,
			parse: String,
		},
		"name-honorific-suffix": {
			kind: "parsed",
			brief: "The name.honorificSuffix field",
			optional: true,
			parse: String,
		},
		"name-middle-name": {
			kind: "parsed",
			brief: "The name.middleName field",
			optional: true,
			parse: String,
		},
		schemas: {
			kind: "parsed",
			brief: "The SCIM schemas that apply to this resource.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"user-name": {
			kind: "parsed",
			brief: "The userName field",
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
				"A SCIM User resource. Additional SCIM extension attributes are supported.",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "user-id",
			brief: "The SCIM user identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "replace <user-id>",
	describe: "Replace a user population user",
	usage:
		"$0 zero-trust access user-populations users replace <user-id>\n\nReplaces a SCIM user in a user population.",
	...parameters,
	loader: () => import("./replace.handler.js"),
});

export default command;

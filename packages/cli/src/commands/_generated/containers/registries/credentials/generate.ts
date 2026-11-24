/**
 * generate command
 * @generated from apis/overlays/containers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"expiration-minutes": {
			kind: "parsed",
			brief:
				"The number of minutes Cloudflare managed registry credentials stay valid. Required for managed registries and must remain positive. Cloudflare ignores this value for external registries.",
			optional: true,
			parse: Number,
		},
		permissions: {
			kind: "parsed",
			brief:
				"The permissions for Cloudflare managed registry credentials. Required for managed registries. Cloudflare ignores this value for external registries.",
			variadic: true,
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
				"Specifies the configuration for the image registry credential to create. Cloudflare requires both fields for managed registries. For external registries, Cloudflare ignores both fields, and the registry provider determines the returned credentials' permissions and lifetime.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "domain",
			brief: "The domain to get credentials for.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "generate <domain>",
	describe: "Generate a JWT to interact with the specified image registry.",
	usage:
		"$0 containers registries credentials generate <domain>\n\nGenerates credentials for accessing a configured container image registry.",
	...parameters,
	loader: () => import("./generate.handler.js"),
});

export default command;

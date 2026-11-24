/**
 * create command
 * @generated from apis/overlays/addressing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		cidr: {
			kind: "parsed",
			brief: "IP Prefix in Classless Inter-Domain Routing format.",
			optional: true,
			parse: String,
		},
		"service-id": {
			kind: "parsed",
			brief:
				"Identifier of a Service on the Cloudflare network. Available services and their IDs may be found in the\n**List Services** endpoint.\n",
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
			placeholder: "prefix-id",
			brief: "Identifier of an IP Prefix.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <prefix-id>",
	describe: "Create Service Binding",
	usage:
		"$0 addressing prefixes service-bindings create <prefix-id>\n\nCreates a new Service Binding, routing traffic to IPs within the given CIDR to a service running on Cloudflare's network. **NOTE:** The first Service Binding created for an IP Prefix must exactly match the IP Prefix's CIDR. Subsequent Service Bindings may be created with a more-specific CIDR. Refer to the [Service Bindings Documentation](https://developers.cloudflare.com/byoip/service-bindings/) for compatibility details.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		elements: {
			kind: "parsed",
			brief:
				'The elements field. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"id": string, "outputs": {...}, "type": "start"} | {"id": string, "outputs": {...}, "properties": {...}, "type": "conditional"} | {"id": string, "outputs": {...}, "type": "percentage"} | ...more)].',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
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
	operands: [{ placeholder: "gateway-id", brief: "Gateway ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <gateway-id>",
	describe: "Create a dynamic route",
	usage:
		"$0 ai-gateway dynamic-routing create <gateway-id>\n\nCreates a dynamic route on an AI Gateway from the specified routing elements. Clients call the route by using `dynamic/{name}` as the model name.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

/**
 * list command
 * @generated from apis/overlays/user.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List user tenants",
	usage:
		"$0 user tenants list\n\nLists the Cloudflare tenants in which the authenticated user has direct membership using the legacy Tenant response shape. Use `GET /organizations` to list Organizations the user can access, including through hierarchy, using the modern Organization response shape.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

/**
 * list command
 * @generated from apis/overlays/mesh.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief: "A user-friendly name for the tunnel.",
			optional: true,
			parse: String,
		},
		"is-deleted": {
			kind: "boolean",
			brief:
				"If `true`, only include deleted tunnels. If `false`, exclude deleted tunnels. If empty, all tunnels will be included.",
			optional: true,
		},
		"existed-at": {
			kind: "parsed",
			brief:
				"If provided, include only resources that were created (and not deleted) before this time. URL encoded.",
			optional: true,
			parse: String,
		},
		uuid: {
			kind: "parsed",
			brief: "UUID of the tunnel.",
			optional: true,
			parse: String,
		},
		"was-active-at": {
			kind: "parsed",
			brief: "Was active at",
			optional: true,
			parse: String,
		},
		"was-inactive-at": {
			kind: "parsed",
			brief: "Was inactive at",
			optional: true,
			parse: String,
		},
		"include-prefix": {
			kind: "parsed",
			brief: "Include prefix",
			optional: true,
			parse: String,
		},
		"exclude-prefix": {
			kind: "parsed",
			brief: "Exclude prefix",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief:
				"The status of the tunnel. Valid values are `inactive` (tunnel has never been run), `degraded` (tunnel is active and able to serve traffic but in an unhealthy state), `healthy` (tunnel is active and able to serve traffic), or `down` (tunnel can not serve traffic as it has no connections to the Cloudflare Edge).",
			values: ["inactive", "degraded", "healthy", "down"],
			optional: true,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results to display.",
			optional: true,
			parse: Number,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
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
	describe: "List Mesh nodes",
	usage: "$0 mesh nodes list\n\nLists and filters Mesh nodes in an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;

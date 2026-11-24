/**
 * update command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"relay-config-upstreams-enabled": {
			kind: "boolean",
			brief: "The config.upstreams.enabled field",
			optional: true,
		},
		"relay-config-upstreams-upstreams": {
			kind: "parsed",
			brief:
				'Ordered list of upstream MOQT server publishers. Each entry is an\nobject (not a bare string) so per-upstream configuration can be\nadded in the future without another breaking change. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"url": string}].',
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
	operands: [
		{
			placeholder: "relay-id",
			brief: "Relay unique identifier (32 hex characters).",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <relay-id>",
	describe: "Update a relay",
	usage:
		"$0 realtime moq relays update <relay-id>\n\nUpdates a relay's name and/or configuration. The relay ID goes in the URL path — `PUT /accounts/{account_id}/moq/relays/{relay_id}` — not the request body; there is no collection-level update endpoint. This is also the only way to set a relay's config (config cannot be set at create time). Partial updates: omitted fields are preserved; config sub-objects replace as whole objects when present.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

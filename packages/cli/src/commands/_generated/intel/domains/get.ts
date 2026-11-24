/**
 * get command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		domain: { kind: "parsed", brief: "Domain", optional: true, parse: String },
		"skip-dns": {
			kind: "boolean",
			brief: "Skip DNS resolution lookups for faster response.",
			optional: true,
		},
		"skip-ranking": {
			kind: "boolean",
			brief:
				"Skip the domain ranking lookup for faster responses. Defaults to\n`false` (ranking is included). Set to `true` to opt out — primarily\nused by callers like Cloudflare Radar that need to avoid a\ncircular dependency when building the domain details page.\nNote: the bulk endpoint (`/intel/domain/bulk`) uses opposite\ndefaults — see `include_ranking` there.",
			optional: true,
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
	command: "get",
	describe: "Get Domain Details",
	usage:
		"$0 intel domains get\n\nGets security details and statistics about a domain.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;

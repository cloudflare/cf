/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		region: {
			kind: "parsed",
			brief:
				"Pin the generated certificate authority's key material to one of the account's selected Data Localization Suite regions. **Important**: This field is only settable during certificate creation. Certificates become immutable after creation - use the `/activate` and `/deactivate` endpoints to manage certificate lifecycle.",
			optional: true,
			parse: String,
		},
		"validity-period-days": {
			kind: "parsed",
			brief:
				"Sets the certificate validity period in days (range: 1-10,950 days / ~30 years). Defaults to 1,825 days (5 years). **Important**: This field is only settable during the certificate creation. Certificates becomes immutable after creation - use the `/activate` and `/deactivate` endpoints to manage certificate lifecycle.",
			optional: true,
			parse: Number,
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Zero Trust certificate",
	usage:
		"$0 zero-trust gateway certificates create\n\nCreate a new Zero Trust certificate.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

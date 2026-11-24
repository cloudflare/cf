/**
 * access-check command
 * @generated from apis/overlays/cloudforce-one.ts
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
	command: "access-check",
	describe: "Check if current user is allowlisted for Legal Response",
	usage:
		"$0 cloudforce-one requests legal-response access-check\n\nReturns whether the JWT-authenticated user's email is on the legal-response allowlist. This endpoint is purely informational for UI gating; actual access enforcement is performed by `legalResponseMiddleware` on real legal-response endpoints. Read-only — no Durable Object writes are performed.",
	...parameters,
	loader: () => import("./access-check.handler.js"),
});

export default command;

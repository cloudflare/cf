/**
 * update command
 * @generated from apis/overlays/fraud.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"authentication-settings-failure-criteria-kind": {
			kind: "parsed",
			brief:
				"The type of criterion. Currently only `status_code` is supported.",
			optional: true,
			choices: ["status_code"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"authentication-settings-failure-criteria-kind",
					"text"
				),
		},
		"authentication-settings-failure-criteria-status-codes": {
			kind: "parsed",
			brief:
				"HTTP status codes to match against the origin response.\n- Maximum of 10 codes per criterion.\n- Each code must be a valid HTTP status code (100-599).\n- Codes are deduplicated and sorted on save.\n- Omit to leave unchanged on update.\n- Provide an empty array `[]` to clear codes on update.\n",
			variadic: true,
			optional: true,
			parse: String,
		},
		"authentication-settings-success-criteria-kind": {
			kind: "parsed",
			brief:
				"The type of criterion. Currently only `status_code` is supported.",
			optional: true,
			choices: ["status_code"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"authentication-settings-success-criteria-kind",
					"text"
				),
		},
		"authentication-settings-success-criteria-status-codes": {
			kind: "parsed",
			brief:
				"HTTP status codes to match against the origin response.\n- Maximum of 10 codes per criterion.\n- Each code must be a valid HTTP status code (100-599).\n- Codes are deduplicated and sorted on save.\n- Omit to leave unchanged on update.\n- Provide an empty array `[]` to clear codes on update.\n",
			variadic: true,
			optional: true,
			parse: String,
		},
		"user-profiles": {
			kind: "parsed",
			brief: "Whether Fraud User Profiles is enabled for the zone.",
			optional: true,
			choices: ["enabled", "disabled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "user-profiles", "text"),
		},
		"username-expressions": {
			kind: "parsed",
			brief:
				"List of expressions to detect usernames in write HTTP requests.\n\n- Maximum of 10 expressions.\n- Omit or set to null to leave unchanged on update.\n- Provide an empty array `[]` to clear all expressions on update.\n- Invalid expressions will result in a 10400 Bad Request with details in the `messages` array.\n",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"authentication-settings-failure-criteria-kind",
				"authentication-settings-failure-criteria-status-codes",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"authentication-settings-failure-criteria-kind",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --authentication-settings-failure-criteria-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"authentication-settings-success-criteria-kind",
				"authentication-settings-success-criteria-status-codes",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"authentication-settings-success-criteria-kind",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --authentication-settings-success-criteria-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update Fraud Detection Settings",
	usage:
		"$0 fraud update\n\nUpdate Fraud Detection settings for a zone. Notes on `username_expressions` behavior: - If omitted or set to null, expressions are not modified. - If provided as an empty array `[]`, all expressions will be cleared.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;

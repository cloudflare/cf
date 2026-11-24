import operation from "../_operations/fraud/update.js";
/**
 * update command
 * @generated from apis/overlays/fraud.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update",
	describe: "Update Fraud Detection Settings",
	usage:
		"$0 fraud update\n\nUpdate Fraud Detection settings for a zone. Notes on `username_expressions` behavior: - If omitted or set to null, expressions are not modified. - If provided as an empty array `[]`, all expressions will be cleared.",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "fraud update",
				classification: {
					safeFlags: [
						"authentication-settings-failure-criteria-kind",
						"authentication-settings-success-criteria-kind",
						"user-profiles",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf fraud update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/fraud_detection/settings`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										authentication_settings: {
											failure_criteria: {
												kind: argv[
													"authentication-settings-failure-criteria-kind"
												],
												status_codes:
													argv[
														"authentication-settings-failure-criteria-status-codes"
													],
											},
											success_criteria: {
												kind: argv[
													"authentication-settings-success-criteria-kind"
												],
												status_codes:
													argv[
														"authentication-settings-success-criteria-status-codes"
													],
											},
										},
										user_profiles: argv["user-profiles"],
										username_expressions: argv["username-expressions"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					authentication_settings: {
						failure_criteria: {
							kind: argv["authentication-settings-failure-criteria-kind"],
							status_codes:
								argv["authentication-settings-failure-criteria-status-codes"],
						},
						success_criteria: {
							kind: argv["authentication-settings-success-criteria-kind"],
							status_codes:
								argv["authentication-settings-success-criteria-status-codes"],
						},
					},
					user_profiles: argv["user-profiles"],
					username_expressions: argv["username-expressions"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;

/**
 * create command
 * @generated from apis/overlays/hyperdrive.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"mtls-ca-certificate-id": {
			kind: "parsed",
			brief: "Define CA certificate ID obtained after uploading CA cert.",
			optional: true,
			parse: String,
		},
		"mtls-certificate-id": {
			kind: "parsed",
			brief: "Define mTLS certificate ID obtained after uploading client cert.",
			optional: true,
			parse: String,
		},
		"mtls-sslmode": {
			kind: "parsed",
			brief:
				"PostgreSQL accepts `require`, `verify-ca`, and `verify-full`. MySQL accepts `REQUIRED`, `VERIFY_CA`, and `VERIFY_IDENTITY`. The verify modes require a CA certificate; the require modes cannot be used with a CA certificate.",
			optional: true,
			choices: [
				"require",
				"verify-ca",
				"verify-full",
				"REQUIRED",
				"VERIFY_CA",
				"VERIFY_IDENTITY",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "mtls-sslmode", "text"),
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the Hyperdrive configuration. Used to identify the configuration in the Cloudflare dashboard and API.",
			optional: true,
			parse: String,
		},
		"origin-connection-limit": {
			kind: "parsed",
			brief:
				"The (soft) maximum number of connections the Hyperdrive is allowed to make to the origin database.\n\nMaximum allowed: 20 for free tier accounts, 100 for paid tier accounts.\nIf not specified, defaults to 20 for free tier and 60 for paid tier.\nCertain Cloudflare-managed origins may be permitted a higher limit.\nContact Cloudflare if you need a higher limit.",
			optional: true,
			parse: Number,
		},
		"integration-custom-database-name": {
			kind: "parsed",
			brief:
				"The database name to use when connecting. Defaults to `postgres` for PostgreSQL and `mysql` for MySQL.",
			optional: true,
			parse: String,
		},
		"integration-database-branch-name": {
			kind: "parsed",
			brief: "The name of the PlanetScale database branch.",
			optional: true,
			parse: String,
		},
		"integration-database-name": {
			kind: "parsed",
			brief: "The name of the PlanetScale database.",
			optional: true,
			parse: String,
		},
		"integration-organization-name": {
			kind: "parsed",
			brief: "The name of the PlanetScale organization.",
			optional: true,
			parse: String,
		},
		"integration-provider": {
			kind: "parsed",
			brief: "The database integration provider used by this operation.",
			optional: true,
			choices: ["planetscale"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "integration-provider", "text"),
		},
		"integration-scheme": {
			kind: "parsed",
			brief:
				"Specifies the URL scheme used to connect to your origin database.",
			optional: true,
			choices: ["postgres", "postgresql", "mysql"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "integration-scheme", "text"),
		},
		"origin-database": {
			kind: "parsed",
			brief: "Set the name of your origin database.",
			optional: true,
			parse: String,
		},
		"origin-password": {
			kind: "parsed",
			brief:
				"Set the password needed to access your origin database. The API never returns this write-only value.",
			optional: true,
			parse: String,
		},
		"origin-scheme": {
			kind: "parsed",
			brief:
				"Specifies the URL scheme used to connect to your origin database.",
			optional: true,
			choices: ["postgres", "postgresql", "mysql"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "origin-scheme", "text"),
		},
		"origin-user": {
			kind: "parsed",
			brief: "Set the user of your origin database.",
			optional: true,
			parse: String,
		},
		"origin-host": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- Defines the publicly reachable hostname or IP of your origin database. Private, loopback, and link-local IP addresses are not allowed.\n- Defines the host (hostname or IP) of your origin database.",
			optional: true,
			parse: String,
		},
		"origin-port": {
			kind: "parsed",
			brief:
				"Defines the port of your origin database. Defaults to 5432 for PostgreSQL or 3306 for MySQL if not specified.",
			optional: true,
			parse: Number,
		},
		"origin-access-client-id": {
			kind: "parsed",
			brief:
				"Defines the Client ID of the Access token to use when connecting to the origin database.",
			optional: true,
			parse: String,
		},
		"origin-access-client-secret": {
			kind: "parsed",
			brief:
				"Defines the Client Secret of the Access Token to use when connecting to the origin database. The API never returns this write-only value.",
			optional: true,
			parse: String,
		},
		"origin-service-id": {
			kind: "parsed",
			brief:
				"The identifier of the Workers VPC Service to connect through. Hyperdrive will egress through the specified VPC Service to reach the origin database.",
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
			brief:
				"A request to create a Hyperdrive configuration using exactly one of caller-supplied origin credentials or a managed integration.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	rules(rules) {
		rules.conflicts("integration-custom-database-name", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("integration-custom-database-name", [
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.conflicts("integration-database-branch-name", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("integration-database-branch-name", [
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.conflicts("integration-database-name", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("integration-database-name", [
			"integration-database-branch-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.conflicts("integration-organization-name", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("integration-organization-name", [
			"integration-database-branch-name",
			"integration-database-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.conflicts("integration-provider", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("integration-provider", [
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-scheme",
		]);
		rules.conflicts("integration-scheme", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("integration-scheme", [
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
		]);
		rules.conflicts("origin-database", [
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-database", [
			"origin-password",
			"origin-scheme",
			"origin-user",
		]);
		rules.conflicts("origin-password", [
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-password", [
			"origin-database",
			"origin-scheme",
			"origin-user",
		]);
		rules.conflicts("origin-scheme", [
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-scheme", [
			"origin-database",
			"origin-password",
			"origin-user",
		]);
		rules.conflicts("origin-user", [
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-user", [
			"origin-database",
			"origin-password",
			"origin-scheme",
		]);
		rules.conflicts("origin-host", [
			"origin-service-id",
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-host", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
		]);
		rules.conflicts("origin-port", [
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-port", [
			"origin-host",
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
		]);
		rules.conflicts("origin-access-client-id", [
			"origin-port",
			"origin-service-id",
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-access-client-id", [
			"origin-host",
			"origin-access-client-secret",
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
		]);
		rules.conflicts("origin-access-client-secret", [
			"origin-port",
			"origin-service-id",
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-access-client-secret", [
			"origin-host",
			"origin-access-client-id",
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
		]);
		rules.conflicts("origin-service-id", [
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-service-id", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
		]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Hyperdrive",
	usage:
		"$0 hyperdrive create\n\nCreates and returns a new Hyperdrive configuration. For a PlanetScale integration, the Cloudflare account must already be linked to PlanetScale in the Hyperdrive dashboard.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;

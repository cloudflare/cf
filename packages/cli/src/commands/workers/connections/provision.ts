import path from "node:path";
import {
	IdentityConnectorProvisioning,
	withIdentityConnectorState,
	type IdentityConnectorClient,
	type IdentityConnectorResource,
	type IdentityConnectorStateStore,
} from "@cloudflare/workers-utils/identity-connectors";
import {
	isConnectionBinding,
	type ConnectionBindingConfig,
	type ConnectionPermissions,
} from "@cloudflare/workers-utils/oidc";
import type { ContainerlessConfig } from "@cloudflare/deploy-helpers";

export interface AppSetupStatus {
	operationId: string;
	state:
		| "created"
		| "starting"
		| "consent"
		| "complete"
		| "denied"
		| "expired"
		| "unknown";
	connectorId: string;
	connectionId: string | null;
	expiresAt: number;
}
interface PrivateIdentityClient extends IdentityConnectorClient {
	startAppSetup(
		operationId: string,
		setup: {
			connectorId: string;
			revision: number;
			permissions: ConnectionPermissions;
			execution?: "deployed" | "preview";
			previewId?: string;
		}
	): Promise<{ operationId: string; url: string; expiresAt: number }>;
	appSetupStatus(operationId: string): Promise<AppSetupStatus>;
}

/** Private draft ingress, deliberately separate from account API authentication. */
export function privateConnectorClient(
	accountId: string
): PrivateIdentityClient {
	const endpoint = process.env.CLOUDFLARE_IDENTITY_PRIVATE_ENDPOINT;
	const token = process.env.CLOUDFLARE_IDENTITY_PRIVATE_TOKEN;
	if (!endpoint || !token || token.length < 32) {
		throw new Error(
			"Saved-account provisioning requires the private identity pilot endpoint and token. Set CLOUDFLARE_IDENTITY_PRIVATE_ENDPOINT and CLOUDFLARE_IDENTITY_PRIVATE_TOKEN. Public account API provisioning is not enabled."
		);
	}
	const origin = new URL(endpoint);
	const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
	if (
		(origin.protocol !== "https:" &&
			!(
				origin.protocol === "http:" &&
				["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)
			)) ||
		origin.username ||
		origin.password ||
		origin.pathname !== "/" ||
		origin.search ||
		origin.hash ||
		!/^[A-Za-z0-9_-]{1,128}$/.test(accountId)
	) {
		throw new Error("Invalid private identity pilot endpoint or account.");
	}
	const base = new URL(
		`/internal/connectors/${encodeURIComponent(accountId)}`,
		origin
	);
	async function request(
		suffix: string,
		method = "GET",
		body?: unknown,
		missing = false
	): Promise<unknown> {
		const signal = AbortSignal.timeout(15_000);
		const response = await fetch(`${base}${suffix}`, {
			method,
			redirect: "error",
			signal,
			headers: {
				authorization: `Bearer ${token}`,
				"content-type": "application/json",
			},
			...(body === undefined ? {} : { body: JSON.stringify(body) }),
		});
		if (missing && response.status === 404) {
			await response.body?.cancel();
			return undefined;
		}
		if (!response.ok) {
			await response.body?.cancel();
			throw new Error(
				`Private identity provisioning failed (HTTP ${response.status}). Retain cloudflare.identity.json and retry the same operation; registration may require operator recovery.`
			);
		}
		if (
			!/^application\/json(?:\s*;|$)/i.test(
				response.headers.get("content-type") ?? ""
			)
		) {
			await response.body?.cancel();
			throw new Error("Invalid private identity provisioning response.");
		}
		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("Empty private identity provisioning response.");
		}
		const chunks: Uint8Array[] = [];
		let length = 0;
		try {
			while (true) {
				const { value, done } = await reader.read();
				if (done) {
					break;
				}
				length += value.byteLength;
				if (length > 32768) {
					throw new Error(
						"Private identity provisioning response exceeds its size limit."
					);
				}
				chunks.push(value);
			}
		} catch (error) {
			await reader.cancel().catch(() => {});
			throw error;
		} finally {
			reader.releaseLock();
		}
		return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
	}
	function resource(value: unknown): IdentityConnectorResource {
		if (
			!value ||
			typeof value !== "object" ||
			!("id" in value) ||
			!("revision" in value) ||
			!("definition" in value) ||
			("deleted" in value && value.deleted === true)
		) {
			throw new Error("Invalid or deleted identity connector.");
		}
		const definition = value.definition;
		if (!definition || typeof definition !== "object") {
			throw new Error("Invalid identity connector definition.");
		}
		const permissions = {
			scope: "scopes" in definition ? definition.scopes : undefined,
			resources: "resources" in definition ? definition.resources : undefined,
			inspection_resources:
				"inspectionResources" in definition
					? definition.inspectionResources
					: undefined,
			return_urls:
				"returnUrls" in definition ? definition.returnUrls : undefined,
		};
		const binding = {
			binding: "CHECK",
			connector_id: value.id,
			connector_revision: value.revision,
			...permissions,
		};
		if (
			!isConnectionBinding(binding) ||
			typeof binding.connector_id !== "string" ||
			typeof binding.connector_revision !== "number"
		) {
			throw new Error("Invalid identity connector response.");
		}
		const {
			connector_id,
			connector_revision,
			binding: _binding,
			oauth: _oauth,
			...validatedPermissions
		} = binding;
		return {
			id: connector_id,
			revision: connector_revision,
			permissions: validatedPermissions,
		};
	}
	return {
		startAppSetup: async (operationId, setup) => {
			const result = await request("/app-setup", "POST", {
				operationId,
				setup: {
					...setup,
					permissions: {
						scopes: setup.permissions.scope,
						resources: setup.permissions.resources,
						inspectionResources: setup.permissions.inspection_resources ?? [],
						returnUrls: setup.permissions.return_urls ?? [],
					},
				},
			});
			if (
				!result ||
				typeof result !== "object" ||
				!("operationId" in result) ||
				result.operationId !== operationId ||
				!("url" in result) ||
				typeof result.url !== "string" ||
				!("expiresAt" in result) ||
				typeof result.expiresAt !== "number" ||
				!Number.isSafeInteger(result.expiresAt) ||
				result.expiresAt <= 0
			) {
				throw new Error("Invalid account setup response.");
			}
			const hosted = new URL(result.url),
				expected = new URL(
					process.env.CLOUDFLARE_IDENTITY_SETUP_ORIGIN ?? origin.origin
				);
			if (
				hosted.origin !== expected.origin ||
				hosted.username ||
				hosted.password ||
				hosted.search ||
				hosted.hash ||
				!/^\/cdn-cgi\/local\/identity\/setup\/[a-f0-9]{64}$/.test(
					hosted.pathname
				)
			) {
				throw new Error(
					"Unexpected account setup URL. Check the private pilot's configured hosted origin."
				);
			}
			return { operationId, url: hosted.href, expiresAt: result.expiresAt };
		},
		appSetupStatus: async (operationId) => {
			if (!uuid.test(operationId)) {
				throw new Error("Invalid setup operation ID.");
			}
			const value = await request(`/app-setup/${operationId}`);
			if (
				!value ||
				typeof value !== "object" ||
				!("operationId" in value) ||
				value.operationId !== operationId ||
				!("state" in value) ||
				typeof value.state !== "string" ||
				![
					"created",
					"starting",
					"consent",
					"complete",
					"denied",
					"expired",
					"unknown",
				].includes(value.state) ||
				!("connectorId" in value) ||
				typeof value.connectorId !== "string" ||
				!uuid.test(value.connectorId) ||
				!("connectionId" in value) ||
				!(
					value.connectionId === null ||
					(typeof value.connectionId === "string" &&
						uuid.test(value.connectionId))
				) ||
				!("expiresAt" in value) ||
				typeof value.expiresAt !== "number" ||
				!Number.isSafeInteger(value.expiresAt) ||
				value.expiresAt <= 0
			) {
				throw new Error("Invalid account setup status.");
			}
			return {
				operationId,
				state: value.state as AppSetupStatus["state"],
				connectorId: value.connectorId,
				connectionId: value.connectionId,
				expiresAt: value.expiresAt,
			};
		},
		get: async (id, revision) =>
			resource(
				await request(`/${encodeURIComponent(id)}?revision=${revision}`)
			),
		operation: async (id) => {
			const result = await request(
				`/operations/${encodeURIComponent(id)}`,
				"GET",
				undefined,
				true
			);
			return result === undefined ? undefined : resource(result);
		},
		create: async (operationId, oauth) =>
			resource(await request("", "POST", { operationId, oauth })),
		reconcile: async (id, revision, oauth) =>
			resource(
				await request(`/${encodeURIComponent(id)}`, "PUT", { revision, oauth })
			),
	};
}

/** Apply before upload; a later deployment failure must retain the account resource. */
export async function provisionIdentityConnectors(
	config: ContainerlessConfig,
	options: {
		accountId?: string;
		realm: string;
		dryRun?: boolean;
		provision?: boolean;
		stateFile?: string;
		client?: IdentityConnectorClient;
	}
): Promise<ContainerlessConfig> {
	const connections = (config.identities ?? []).filter(isConnectionBinding);
	if (!connections.length) {
		return config;
	}
	if (!options.dryRun && !options.accountId) {
		throw new Error(
			"Identity connector apply requires an authenticated account."
		);
	}
	const work = async (store: IdentityConnectorStateStore) => {
		const client = options.dryRun
			? {
					get: async () => {
						throw new Error("Dry-run cannot contact identity services.");
					},
					operation: async () => {
						throw new Error("Dry-run cannot contact identity services.");
					},
					create: async () => {
						throw new Error("Dry-run cannot register a connector.");
					},
					reconcile: async () => {
						throw new Error("Dry-run cannot reconcile a connector.");
					},
				}
			: (options.client ?? privateConnectorClient(options.accountId ?? ""));
		const realm =
			options.client || options.dryRun
				? options.realm
				: `${options.realm}:${new URL(process.env.CLOUDFLARE_IDENTITY_PRIVATE_ENDPOINT ?? "").origin}`;
		const apply = new IdentityConnectorProvisioning({
			accountId: options.accountId ?? "dry-run",
			realm,
			store,
			client,
		});
		const resolved = new Map<string, ConnectionBindingConfig>();
		for (const binding of connections) {
			if (options.provision === false && binding.oauth) {
				throw new Error(
					"Inline identity setup requires provisioning. Apply it first and use the retained connector ID/revision with --no-provision."
				);
			}
			const result = await apply.apply(
				binding,
				binding.binding,
				options.dryRun
			);
			// Setup input is retained in project configuration; upload only the resolved attachment.
			const { oauth: _oauth, ...attachment } = result.binding;
			if (options.dryRun) {
				resolved.set(binding.binding, binding);
			} else {
				if (!attachment.connector_id || !attachment.connector_revision) {
					throw new Error(
						"Identity provisioning returned no attachment identity."
					);
				}
				resolved.set(binding.binding, {
					...attachment,
					connector_id: attachment.connector_id,
					connector_revision: attachment.connector_revision,
				});
			}
		}
		return {
			...config,
			identities: (config.identities ?? []).map(
				(binding) => resolved.get(binding.binding) ?? binding
			),
		};
	};
	if (options.dryRun) {
		return work({
			read: async () => undefined,
			write: async () => {
				throw new Error("Dry-run cannot write identity state.");
			},
		});
	}
	return withIdentityConnectorState(
		path.resolve(options.stateFile ?? "cloudflare.identity.json"),
		work
	);
}

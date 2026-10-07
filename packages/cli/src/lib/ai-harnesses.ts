import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";
import { API_TIMEOUT_MS } from "./api-constants.js";

export type AiHarness = "opencode";

interface HarnessSettings {
	model?: string;
}

interface AgentsConfig {
	version?: number;
	gateway?: string;
	/** Access-protected AI Gateway custom domain, used for per-user identity. */
	endpoint?: string;
	harnesses?: Partial<Record<AiHarness, HarnessSettings>>;
}

export interface ResolvedHarnessSettings {
	gateway?: string;
	endpoint?: string;
	model: string;
}

const DEFAULTS: Record<AiHarness, Required<HarnessSettings>> = {
	opencode: { model: "openai/gpt-5.5" },
};

const SECRET_KEY = /token|key|secret|password|credential/i;

function configPath(): string {
	return (
		process.env.CF_AGENTS_CONFIG_PATH ?? join(getCfConfigPath(), "agents.json")
	);
}

function validateConfig(value: unknown): AgentsConfig {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		throw new Error(`${configPath()} must contain a JSON object.`);
	}

	for (const key of Object.keys(value)) {
		if (SECRET_KEY.test(key)) {
			throw new Error(
				`${configPath()} must not contain credentials. Use cf auth login instead.`
			);
		}
	}

	const config = value as AgentsConfig;
	if (config.version !== undefined && config.version !== 1) {
		throw new Error(
			`${configPath()} has unsupported version ${config.version}.`
		);
	}
	if (config.gateway !== undefined && typeof config.gateway !== "string") {
		throw new Error(`${configPath()} gateway must be a string.`);
	}
	if (config.endpoint !== undefined && typeof config.endpoint !== "string") {
		throw new Error(`${configPath()} endpoint must be a string.`);
	}
	if (config.harnesses !== undefined) {
		if (
			config.harnesses === null ||
			typeof config.harnesses !== "object" ||
			Array.isArray(config.harnesses)
		) {
			throw new Error(`${configPath()} harnesses must be an object.`);
		}
		for (const [harness, settings] of Object.entries(config.harnesses)) {
			if (harness !== "opencode") {
				throw new Error(`${configPath()} has unknown harness ${harness}.`);
			}
			if (
				settings === null ||
				typeof settings !== "object" ||
				Array.isArray(settings) ||
				("model" in settings &&
					typeof (settings as HarnessSettings).model !== "string")
			) {
				throw new Error(
					`${configPath()} harnesses.${harness} must contain a string model.`
				);
			}
			for (const key of Object.keys(settings)) {
				if (SECRET_KEY.test(key)) {
					throw new Error(
						`${configPath()} must not contain credentials. Use cf auth login instead.`
					);
				}
				if (key !== "model") {
					throw new Error(
						`${configPath()} has unknown setting ${harness}.${key}.`
					);
				}
			}
		}
	}
	return config;
}

function readConfig(): AgentsConfig {
	try {
		return validateConfig(JSON.parse(readFileSync(configPath(), "utf8")));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return {};
		}
		if (error instanceof SyntaxError) {
			throw new Error(`${configPath()} contains invalid JSON.`);
		}
		throw error;
	}
}

export function resolveHarnessSettings(
	harness: AiHarness,
	overrides: { gateway?: string; model?: string; endpoint?: string } = {}
): ResolvedHarnessSettings {
	const config = readConfig();
	return {
		gateway: overrides.gateway ?? config.gateway,
		endpoint: overrides.endpoint ?? config.endpoint,
		model:
			overrides.model ??
			config.harnesses?.[harness]?.model ??
			DEFAULTS[harness].model,
	};
}

interface TokenResponse {
	result?: { id?: string; value?: string };
	success?: boolean;
	errors?: Array<{ message?: string }>;
}

export interface HarnessToken {
	id: string;
	value: string;
}

const AI_GATEWAY_RUN_PERMISSION = "644535f4ed854494a59cb289d634b257";
const WORKERS_AI_READ_PERMISSION = "a92d2450e05d4e7bb7d0a64968f83d11";

async function tokenResponse(response: Response): Promise<TokenResponse> {
	try {
		return (await response.json()) as TokenResponse;
	} catch {
		return {};
	}
}

export async function createHarnessToken(
	parentToken: string,
	accountId: string,
	apiBaseUrl: string
): Promise<HarnessToken> {
	// The API rejects fractional seconds, so emit "2005-12-30T01:02:03Z".
	const expiresOn = new Date(Date.now() + 60 * 60 * 1000)
		.toISOString()
		.replace(/\.\d{3}Z$/, "Z");
	const signal = AbortSignal.timeout(API_TIMEOUT_MS);
	const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/user/tokens`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${parentToken}`,
			"Content-Type": "application/json",
		},
		signal,
		body: JSON.stringify({
			name: "cf AI harness session",
			expires_on: expiresOn,
			policies: [
				{
					effect: "allow",
					resources: { [`com.cloudflare.api.account.${accountId}`]: "*" },
					permission_groups: [
						{ id: AI_GATEWAY_RUN_PERMISSION, name: "AI Gateway Run" },
						{ id: WORKERS_AI_READ_PERMISSION, name: "Workers AI Read" },
					],
				},
			],
		}),
	});
	const payload = await tokenResponse(response);
	if (
		!response.ok ||
		!payload.success ||
		typeof payload.result?.id !== "string" ||
		typeof payload.result.value !== "string"
	) {
		const message = payload.errors?.[0]?.message ?? response.statusText;
		throw new Error(`Unable to create a scoped AI harness token: ${message}`);
	}
	return { id: payload.result.id, value: payload.result.value };
}

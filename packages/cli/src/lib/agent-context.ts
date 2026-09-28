export interface AgentHarness {
	id: string;
	name: string;
	version?: string;
	surface?: string;
}

export interface AgentModel {
	id: string;
	provider?: string;
}

export interface AgentMatch {
	harness: AgentHarness;
	model?: AgentModel;
	sessionId?: string;
	invocationId?: string;
	signals: readonly string[];
}

export interface AgentContext {
	isAgentic: boolean;
	harness: AgentHarness | null;
	model: AgentModel | null;
	sessionId: string | null;
	invocationId: string | null;
	matches: readonly AgentMatch[];
}

export type AgentEnvironment = Readonly<Record<string, string | undefined>>;
export type AgentDetector = (
	environment: AgentEnvironment
) => AgentMatch | null;

const FALSE_LIKE_VALUES = new Set(["", "0", "false", "no", "off"]);

function value(
	environment: AgentEnvironment,
	name: string
): string | undefined {
	const raw = environment[name];
	if (typeof raw !== "string") {
		return undefined;
	}
	const normalized = raw.trim();
	return FALSE_LIKE_VALUES.has(normalized.toLowerCase())
		? undefined
		: normalized;
}

function isExact(
	environment: AgentEnvironment,
	name: string,
	expected: string
): boolean {
	return environment[name] === expected;
}

function signalIf(
	signals: string[],
	condition: boolean,
	name: string
): boolean {
	if (condition) {
		signals.push(name);
	}
	return condition;
}

function contractMatch(
	harness: AgentHarness,
	signals: string[],
	metadata: Omit<AgentMatch, "harness" | "signals"> = {}
): AgentMatch {
	return {
		harness,
		...metadata,
		signals,
	};
}

// Evidence: https://github.com/QwenLM/qwen-code/blob/c2902ae70f7/packages/core/src/services/shellContextEnv.ts#L120
const detectQwenCode: AgentDetector = (environment) => {
	const sessionId = value(environment, "QWEN_CODE_SESSION_ID");
	if (!sessionId) {
		return null;
	}

	const signals = ["QWEN_CODE_SESSION_ID"];
	const modelId = value(environment, "QWEN_CODE_MODEL");
	const agentId = value(environment, "QWEN_CODE_AGENT_ID");
	const promptId = value(environment, "QWEN_CODE_PROMPT_ID");
	if (modelId) {
		signals.push("QWEN_CODE_MODEL");
	}
	if (agentId) {
		signals.push("QWEN_CODE_AGENT_ID");
	}
	if (promptId) {
		signals.push("QWEN_CODE_PROMPT_ID");
	}

	return contractMatch({ id: "qwen-code", name: "Qwen Code" }, signals, {
		model: modelId ? { id: modelId } : undefined,
		sessionId,
		invocationId: agentId ?? promptId,
	});
};

// Evidence: https://github.com/badlogic/pi-mono/blob/a328aa89ad6e6dc5c5628ff896769532ed3d29df/packages/coding-agent/docs/environment-variables.md#L15
const detectPi: AgentDetector = (environment) => {
	const signals: string[] = [];
	const piMarker = signalIf(
		signals,
		isExact(environment, "PI_CODING_AGENT", "true"),
		"PI_CODING_AGENT"
	);
	const genericMarker = signalIf(
		signals,
		isExact(environment, "AI_AGENT", "pi"),
		"AI_AGENT"
	);
	if (!piMarker && !genericMarker) {
		return null;
	}

	const sessionId = value(environment, "PI_SESSION_ID");
	const provider = value(environment, "PI_PROVIDER");
	const modelId = value(environment, "PI_MODEL");
	if (sessionId) {
		signals.push("PI_SESSION_ID");
	}
	if (provider) {
		signals.push("PI_PROVIDER");
	}
	if (modelId) {
		signals.push("PI_MODEL");
	}

	return contractMatch({ id: "pi", name: "Pi" }, signals, {
		model: modelId ? { id: modelId, provider } : undefined,
		sessionId,
	});
};

// Evidence: Cursor Agent child-process environment contract. Verified 2026-09-02.
const detectCursorAgent: AgentDetector = (environment) => {
	if (!isExact(environment, "CURSOR_AGENT", "1")) {
		return null;
	}
	const signals = ["CURSOR_AGENT"];
	const sessionId = value(environment, "CURSOR_CONVERSATION_ID");
	const requestId = value(environment, "CURSOR_TRACE_ID");
	if (sessionId) {
		signals.push("CURSOR_CONVERSATION_ID");
	}
	if (requestId) {
		signals.push("CURSOR_TRACE_ID");
	}

	return contractMatch({ id: "cursor-agent", name: "Cursor Agent" }, signals, {
		sessionId,
		invocationId: requestId,
	});
};

// Evidence: Anthropic Claude Code child-process environment. Verified 2026-09-02.
const detectClaudeCode: AgentDetector = (environment) => {
	if (!isExact(environment, "CLAUDECODE", "1")) {
		return null;
	}
	const signals = ["CLAUDECODE"];
	const sessionId = value(environment, "CLAUDE_CODE_SESSION_ID");
	if (sessionId) {
		signals.push("CLAUDE_CODE_SESSION_ID");
	}
	return contractMatch({ id: "claude-code", name: "Claude Code" }, signals, {
		sessionId,
	});
};

// Evidence: https://github.com/openai/codex/blob/cb1eea3e98ebc433ab5f9c12ce043e979d1902df/codex-rs/protocol/src/shell_environment.rs#L150
const detectCodex: AgentDetector = (environment) => {
	const threadId = value(environment, "CODEX_THREAD_ID");
	return threadId
		? contractMatch(
				{ id: "codex", name: "OpenAI Codex" },
				["CODEX_THREAD_ID"],
				{ sessionId: threadId }
			)
		: null;
};

// Evidence: Amp child-process environment contract. Verified 2026-09-02.
const detectAmp: AgentDetector = (environment) => {
	const threadId = value(environment, "AMP_CURRENT_THREAD_ID");
	return threadId
		? contractMatch({ id: "amp", name: "Amp" }, ["AMP_CURRENT_THREAD_ID"], {
				sessionId: threadId,
			})
		: null;
};

// Evidence: https://github.com/google-gemini/gemini-cli/blob/62364cb2000795537a6895261b37ec668e4cf527/packages/core/src/services/shellExecutionService.ts#L569
const detectGeminiCli: AgentDetector = (environment) =>
	isExact(environment, "GEMINI_CLI", "1")
		? contractMatch({ id: "gemini-agent", name: "Gemini CLI" }, ["GEMINI_CLI"])
		: null;

// Evidence: @augmentcode/auggie local tool host environment. Verified 2026-09-02.
const detectAuggie: AgentDetector = (environment) =>
	isExact(environment, "AUGMENT_AGENT", "1")
		? contractMatch({ id: "auggie", name: "Auggie" }, ["AUGMENT_AGENT"])
		: null;

// Evidence: charmbracelet/crush shell and hooks environment. Verified 2026-09-02.
const detectCrush: AgentDetector = (environment) => {
	const signals: string[] = [];
	const crushMarker = signalIf(
		signals,
		isExact(environment, "CRUSH", "1"),
		"CRUSH"
	);
	const genericMarker = signalIf(
		signals,
		isExact(environment, "AI_AGENT", "crush"),
		"AI_AGENT"
	);
	return crushMarker || genericMarker
		? contractMatch({ id: "crush", name: "Crush" }, signals)
		: null;
};

// Evidence: VS Code Copilot agent child-process environment. Verified 2026-09-02.
const detectVsCodeCopilot: AgentDetector = (environment) => {
	const signals: string[] = [];
	const genericMarker = signalIf(
		signals,
		isExact(environment, "AI_AGENT", "github_copilot_vscode_agent"),
		"AI_AGENT"
	);
	const copilotMarker = signalIf(
		signals,
		isExact(environment, "COPILOT_AGENT", "1"),
		"COPILOT_AGENT"
	);
	return genericMarker || copilotMarker
		? contractMatch(
				{
					id: "vscode-copilot-agent",
					name: "GitHub Copilot in VS Code",
					surface: "vscode",
				},
				signals
			)
		: null;
};

// Evidence: Warp/Oz child-process environment contract. Verified 2026-09-02.
const detectWarp: AgentDetector = (environment) => {
	const runId = value(environment, "OZ_RUN_ID");
	return runId
		? contractMatch({ id: "warp", name: "Warp" }, ["OZ_RUN_ID"], {
				sessionId: runId,
			})
		: null;
};

/**
 * Primary-field precedence follows this order. Direct agents precede host
 * surfaces so a Claude Code process launched by Warp remains Claude Code while
 * the Warp run is retained in `matches`.
 */
const detectOpenCode: AgentDetector = (environment) =>
	isExact(environment, "OPENCODE", "1")
		? contractMatch({ id: "opencode", name: "OpenCode" }, ["OPENCODE"])
		: null;

export const agentDetectors: readonly AgentDetector[] = [
	detectOpenCode,
	detectQwenCode,
	detectPi,
	detectCursorAgent,
	detectClaudeCode,
	detectCodex,
	detectAmp,
	detectGeminiCli,
	detectAuggie,
	detectCrush,
	detectVsCodeCopilot,
	detectWarp,
];

export function detectAgentContext(
	environment: AgentEnvironment = process.env,
	detectors: readonly AgentDetector[] = agentDetectors
): AgentContext {
	const matches: AgentMatch[] = [];
	for (const detector of detectors) {
		try {
			const match = detector(environment);
			if (match) {
				matches.push(match);
			}
		} catch {
			// Detection is advisory and must never prevent a CLI request.
		}
	}

	return {
		isAgentic: matches.length > 0,
		harness: matches[0]?.harness ?? null,
		model: matches.find((match) => match.model)?.model ?? null,
		sessionId: matches.find((match) => match.sessionId)?.sessionId ?? null,
		invocationId:
			matches.find((match) => match.invocationId)?.invocationId ?? null,
		matches,
	};
}

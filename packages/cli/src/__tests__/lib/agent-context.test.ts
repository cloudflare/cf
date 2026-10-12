import { describe, expect, it } from "vite-plus/test";
import {
	detectAgentContext,
	type AgentDetector,
	type AgentEnvironment,
} from "../../lib/agent-context.js";

describe("detectAgentContext", () => {
	it.each([
		["OpenCode", { OPENCODE: "1" }, "opencode"],
		["Qwen Code", { QWEN_CODE_SESSION_ID: "qwen-session" }, "qwen-code"],
		["Pi", { PI_CODING_AGENT: "true" }, "pi"],
		["Pi via AI_AGENT", { AI_AGENT: "pi" }, "pi"],
		["Cursor Agent", { CURSOR_AGENT: "1" }, "cursor-agent"],
		["Claude Code", { CLAUDECODE: "1" }, "claude-code"],
		["Codex", { CODEX_THREAD_ID: "codex-thread" }, "codex"],
		["Amp", { AMP_CURRENT_THREAD_ID: "amp-thread" }, "amp"],
		["Gemini CLI", { GEMINI_CLI: "1" }, "gemini-agent"],
		["Auggie", { AUGMENT_AGENT: "1" }, "auggie"],
		["Crush", { CRUSH: "1" }, "crush"],
		["Crush via AI_AGENT", { AI_AGENT: "crush" }, "crush"],
		[
			"VS Code Copilot",
			{ AI_AGENT: "github_copilot_vscode_agent" },
			"vscode-copilot-agent",
		],
		["VS Code Copilot marker", { COPILOT_AGENT: "1" }, "vscode-copilot-agent"],
		["Warp", { OZ_RUN_ID: "warp-run" }, "warp"],
	])("detects %s from its contract", (_name, environment, harnessId) => {
		const context = detectAgentContext(environment);
		expect(context.isAgentic).toBe(true);
		expect(context.harness?.id).toBe(harnessId);
		expect(context.matches).toHaveLength(1);
	});

	it("normalizes Qwen model, session, and invocation metadata", () => {
		const context = detectAgentContext({
			QWEN_CODE_SESSION_ID: "conversation-private",
			QWEN_CODE_MODEL: "qwen3-coder",
			QWEN_CODE_AGENT_ID: "subagent-private",
			QWEN_CODE_PROMPT_ID: "prompt-private",
		});

		expect(context.model).toEqual({ id: "qwen3-coder" });
		expect(context.sessionId).toBe("conversation-private");
		expect(context.invocationId).toBe("subagent-private");
		expect(context.matches[0]?.signals).toEqual([
			"QWEN_CODE_SESSION_ID",
			"QWEN_CODE_MODEL",
			"QWEN_CODE_AGENT_ID",
			"QWEN_CODE_PROMPT_ID",
		]);
		expect(context.matches[0]?.signals).not.toContain("conversation-private");
	});

	it("normalizes Pi provider and model metadata", () => {
		const context = detectAgentContext({
			PI_CODING_AGENT: "true",
			AI_AGENT: "pi",
			PI_SESSION_ID: "pi-session",
			PI_PROVIDER: "anthropic",
			PI_MODEL: "claude-sonnet",
		});

		expect(context.model).toEqual({
			id: "claude-sonnet",
			provider: "anthropic",
		});
		expect(context.sessionId).toBe("pi-session");
		expect(context.matches[0]?.signals).toEqual([
			"PI_CODING_AGENT",
			"AI_AGENT",
			"PI_SESSION_ID",
			"PI_PROVIDER",
			"PI_MODEL",
		]);
	});

	it("normalizes Cursor conversation and request IDs", () => {
		const context = detectAgentContext({
			CURSOR_AGENT: "1",
			CURSOR_CONVERSATION_ID: "cursor-conversation",
			CURSOR_TRACE_ID: "cursor-request",
		});

		expect(context.sessionId).toBe("cursor-conversation");
		expect(context.invocationId).toBe("cursor-request");
	});

	it("retains nested matches while preferring a direct agent over Warp", () => {
		const context = detectAgentContext({
			CLAUDECODE: "1",
			CLAUDE_CODE_SESSION_ID: "claude-session",
			OZ_RUN_ID: "warp-run",
		});

		expect(context.harness?.id).toBe("claude-code");
		expect(context.sessionId).toBe("claude-session");
		expect(context.matches.map((match) => match.harness.id)).toEqual([
			"claude-code",
			"warp",
		]);
		expect(context.matches[1]?.sessionId).toBe("warp-run");
	});

	it("resolves each primary field from the first match that provides it", () => {
		const context = detectAgentContext({
			CLAUDECODE: "1",
			OZ_RUN_ID: "warp-run",
		});

		expect(context.harness?.id).toBe("claude-code");
		expect(context.sessionId).toBe("warp-run");
	});

	it("does not mistake CODEX_SESSION_ID for the Codex thread contract", () => {
		expect(
			detectAgentContext({ CODEX_SESSION_ID: "not-a-thread" })
		).toMatchObject({ isAgentic: false, harness: null, sessionId: null });
	});

	it("ignores false-like, inexact, and unknown markers", () => {
		const context = detectAgentContext({
			QWEN_CODE_SESSION_ID: "false",
			PI_CODING_AGENT: "1",
			CURSOR_AGENT: "true",
			CLAUDECODE: "0",
			CODEX_THREAD_ID: "off",
			AMP_CURRENT_THREAD_ID: "no",
			GEMINI_CLI: "true",
			AUGMENT_AGENT: "false",
			CRUSH: "true",
			COPILOT_AGENT: "true",
			OZ_RUN_ID: "0",
			AI_AGENT: "unknown-agent",
		});

		expect(context).toEqual({
			isAgentic: false,
			harness: null,
			model: null,
			sessionId: null,
			invocationId: null,
			matches: [],
		});
	});

	it("does not detect editor and credential heuristics", () => {
		const context = detectAgentContext({
			AIDER_API_KEY: "private-token",
			CODEIUM_EDITOR_APP_ROOT: "/private/editor",
			REPL_ID: "private-repl",
			TERM_PROGRAM: "WarpTerminal",
			PAGER: "cat",
		});
		expect(context.isAgentic).toBe(false);
	});

	it("contains detector failures and malformed injected environments", () => {
		const throwingDetector: AgentDetector = () => {
			throw new Error("detector failed");
		};
		const malformed = {
			CODEX_THREAD_ID: 42,
		} as unknown as AgentEnvironment;

		expect(() =>
			detectAgentContext(malformed, [throwingDetector])
		).not.toThrow();
		expect(detectAgentContext(malformed).isAgentic).toBe(false);
	});
});

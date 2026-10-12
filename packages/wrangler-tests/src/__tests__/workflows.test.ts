import {
	mockCreateDate,
	mockEndDate,
	mockModifiedDate,
	mockQueuedDate,
	mockStartDate,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it, vi } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs, mockConfirm } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";
import { useWorkflowPeer } from "./helpers/workflow-peer";
import type { ExpectStatic } from "vite-plus/test";

// Inlined from the (non-existent in cf) `../workflows/types` module.
interface Workflow {
	class_name: string;
	created_on: string;
	id: string;
	modified_on: string;
	name: string;
	script_name: string;
}

interface Instance {
	id: string;
	created_on: string;
	modified_on: string;
	workflow_id: string;
	version_id: string;
	status: string;
}

describe("wrangler workflows", () => {
	const std = mockConsoleMethods();
	runInTempDir();
	mockAccountId();
	mockApiToken();
	const { setIsTTY } = useMockIsTTY();
	beforeEach(() => {
		setIsTTY(true);
	});
	afterEach(() => {
		clearDialogs();
	});

	const mockGetInstances = async (instances: Instance[]) => {
		msw.use(
			http.get(
				`*/accounts/:accountId/workflows/some-workflow/instances`,
				async () => {
					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result: instances,
					});
				},
				{ once: true }
			)
		);
	};

	const mockSendEventRequest = async (
		expect: ExpectStatic,
		expectedInstance: string,
		event: string
	) => {
		msw.use(
			http.post(
				`*/accounts/:accountId/workflows/some-workflow/instances/:instanceId/events/:event`,
				async ({ params }) => {
					expect(params.instanceId).toEqual(expectedInstance);
					expect(params.event).toEqual(event);
					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result: {},
					});
				},
				{ once: true }
			)
		);
	};

	const mockDeleteWorkflowRequest = async (
		expect: ExpectStatic,
		workflowName: string
	) => {
		msw.use(
			http.delete(
				`*/accounts/:accountId/workflows/:workflowName`,
				async ({ params }) => {
					expect(params.workflowName).toEqual(workflowName);
					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result: {},
					});
				},
				{ once: true }
			)
		);
	};

	/**
	 * Run a mutating command and assert that cf's spinner / success labels
	 * contain the correct "Updating status" / "Updated status" strings.
	 */
	// eslint-disable-next-line no-unused-vars -- mock helper retained as scaffolding for skipped/todo or not-yet-ported tests
	async function assertStatusEditLabels(run: () => Promise<void>) {
		const origStderrIsTTY = process.stderr.isTTY;
		Object.defineProperty(process.stderr, "isTTY", {
			value: true,
			configurable: true,
		});

		const stdoutWrites: string[] = [];
		const stderrWrites: string[] = [];
		const origStdoutWrite = process.stdout.write.bind(process.stdout);
		const origStderrWrite = process.stderr.write.bind(process.stderr);
		const stdoutSpy = vi
			.spyOn(process.stdout, "write")
			.mockImplementation((chunk: unknown, ...args: unknown[]) => {
				stdoutWrites.push(String(chunk));
				return origStdoutWrite(chunk as string, ...args);
			});
		const stderrSpy = vi
			.spyOn(process.stderr, "write")
			.mockImplementation((chunk: unknown, ...args: unknown[]) => {
				stderrWrites.push(String(chunk));
				return origStderrWrite(chunk as string, ...args);
			});

		try {
			await run();
			return { stdoutWrites, stderrWrites };
		} finally {
			stdoutSpy.mockRestore();
			stderrSpy.mockRestore();
			Object.defineProperty(process.stderr, "isTTY", {
				value: origStderrIsTTY,
				configurable: true,
			});
		}
	}

	describe("help", () => {
		// wrangler-only: cf's help output shape is generated and differs.
		it.skip("should show help when no argument is passed", async () => {});
	});

	describe("instances help", () => {
		// wrangler-only: cf's help output shape is generated and differs.
		it.skip("should show instance help when no argument is passed", async () => {});
	});

	describe("list", () => {
		const mockWorkflows: Workflow[] = [
			{
				class_name: "wf_class_1",
				created_on: mockCreateDate.toISOString(),
				id: "wf_id_1",
				modified_on: mockModifiedDate.toISOString(),
				name: "wf_1",
				script_name: "wf_script_1",
			},
			{
				class_name: "wf_class_2",
				created_on: mockCreateDate.toISOString(),
				id: "wf_id_2",
				modified_on: mockModifiedDate.toISOString(),
				name: "wf_2",
				script_name: "wf_script_2",
			},
		];

		const mockGetWorkflows = async (workflows: Workflow[]) => {
			msw.use(
				http.get(
					`*/accounts/:accountId/workflows`,
					async () => {
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: workflows,
						});
					},
					{ once: true }
				)
			);
		};

		it("should get the list of workflows", async ({ expect }) => {
			await mockGetWorkflows(mockWorkflows);

			await runWrangler(`workflows list`);
			expect(JSON.parse(std.out)).toEqual(mockWorkflows);
		});
	});

	describe("instances list", () => {
		const mockInstances: Instance[] = [
			{
				id: "a",
				created_on: mockCreateDate.toISOString(),
				modified_on: mockModifiedDate.toISOString(),
				workflow_id: "b",
				version_id: "c",
				status: "complete",
			},
			{
				id: "b",
				created_on: mockCreateDate.toISOString(),
				modified_on: mockModifiedDate.toISOString(),
				workflow_id: "b",
				version_id: "c",
				status: "errored",
			},
			{
				id: "c",
				created_on: mockCreateDate.toISOString(),
				modified_on: mockModifiedDate.toISOString(),
				workflow_id: "b",
				version_id: "c",
				status: "paused",
			},
			{
				id: "d",
				created_on: mockCreateDate.toISOString(),
				modified_on: mockModifiedDate.toISOString(),
				workflow_id: "b",
				version_id: "c",
				status: "queued",
			},
			{
				id: "d",
				created_on: mockCreateDate.toISOString(),
				modified_on: mockModifiedDate.toISOString(),
				workflow_id: "b",
				version_id: "c",
				status: "running",
			},
			{
				id: "e",
				created_on: mockCreateDate.toISOString(),
				modified_on: mockModifiedDate.toISOString(),
				workflow_id: "b",
				version_id: "c",
				status: "terminated",
			},
			{
				id: "f",
				created_on: mockCreateDate.toISOString(),
				modified_on: mockModifiedDate.toISOString(),
				workflow_id: "b",
				version_id: "c",
				status: "waiting",
			},
			{
				id: "g",
				created_on: mockCreateDate.toISOString(),
				modified_on: mockModifiedDate.toISOString(),
				workflow_id: "b",
				version_id: "c",
				status: "waitingForPause",
			},
		];

		it("should get the list of instances given a name", async ({ expect }) => {
			await mockGetInstances(mockInstances);

			// cf's `workflows instances list` takes the workflow name as a
			// `--workflow-name` flag rather than a positional.
			await runWrangler(
				`workflows instances list --workflow-name some-workflow`
			);
			expect(JSON.parse(std.out)).toEqual(mockInstances);
		});
	});

	describe("instances describe", () => {
		const mockDescribeInstances = async () => {
			const mockResponse = {
				end: mockEndDate.toISOString(),
				output: "string",
				params: {},
				queued: mockQueuedDate.toISOString(),
				start: mockStartDate.toISOString(),
				status: "queued",
				success: true,
				trigger: {
					source: "unknown",
				},
				versionId: "14707576-2549-4848-82ed-f68f8a1b47c7",
				steps: [
					{
						type: "waitForEvent",
						end: mockEndDate.toISOString(),
						name: "event",
						finished: true,
						output: {},
						start: mockStartDate.toISOString(),
					},
					{
						attempts: [
							{
								end: mockEndDate.toISOString(),
								error: {
									message: "string",
									name: "string",
								},
								start: mockStartDate.toISOString(),
								success: true,
							},
						],
						config: {
							retries: {
								backoff: "constant",
								delay: "string",
								limit: 0,
							},
							timeout: "string",
						},
						end: mockEndDate.toISOString(),
						name: "string",
						output: {},
						start: mockStartDate.toISOString(),
						success: true,
						type: "step",
					},
				],
			};

			msw.use(
				http.get(
					`*/accounts/:accountId/workflows/some-workflow/instances/:instanceId`,
					async () => {
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: mockResponse,
						});
					},
					{ once: true }
				),
				http.get(
					`*/accounts/:accountId/workflows/some-workflow/instances`,
					async () => {
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: [mockResponse],
						});
					},
					{ once: true }
				)
			);
		};

		it("should describe the bar instance given a name", async ({ expect }) => {
			await mockDescribeInstances();

			// wrangler: `workflows instances describe <name> [id]` (positional id)
			// cf:       `workflows instances get <id> --workflow-name <name>`
			await runWrangler(
				`workflows instances get bar --workflow-name some-workflow`
			);
			const result = JSON.parse(std.out);
			expect(result.steps).toHaveLength(2);
			expect(result.steps[0].name).toEqual("event");
			expect(result.steps[1].name).toEqual("string");
		});

		// wrangler-only: cf has no "describe latest" affordance — the
		// instance id is always required as a positional.
		it.skip("should describe the latest instance if none is given", async () => {});
	});

	describe("instances send-event", () => {
		const mockInstances: Instance[] = [
			{
				id: "foo",
				created_on: mockCreateDate.toISOString(),
				modified_on: mockModifiedDate.toISOString(),
				workflow_id: "b",
				version_id: "c",
				status: "running",
			},
		];

		it("should send an event without payload to the bar instance given a name", async ({
			expect,
		}) => {
			await mockGetInstances(mockInstances);
			await mockSendEventRequest(expect, "bar", "my-event");

			await runWrangler(
				`workflows instances events send my-event --workflow-name some-workflow --instance-id bar`
			);
		});

		// The current generated send-event command has no request-body
		// surface, so the Wrangler payload situation cannot yet be exercised.
		it.todo(
			"should send an event with payload to the bar instance given a name"
		);
	});

	// wrangler exposed dedicated `instances pause|resume|terminate|restart`
	// verbs; cf folds them into `workflows instances status edit <id>
	// --status <verb>` (PATCH .../instances/:id/status with `{ status }`).
	//
	// These were previously `it.todo` because cf prompted for `--from-name`
	// unconditionally — `from.name` is variant-required under the optional
	// `from` oneOf discriminator, and the generator surfaced it as a
	// top-level required flag. That's fixed: the generator now downgrades
	// leaves under an optional parent and emits a group-implies `.check()`
	// instead, so `--status pause` alone needs no `--from-*` flag.
	// See test_bugs/body-params-required-within-optional-parent.md.
	const mockStatusEdit = (expect: ExpectStatic, expectedStatus: string) => {
		msw.use(
			http.patch(
				`*/accounts/:accountId/workflows/some-workflow/instances/bar/status`,
				async ({ request }) => {
					const body = (await request.json()) as { status?: string };
					expect(body.status).toEqual(expectedStatus);
					return HttpResponse.json({
						success: true,
						errors: [],
						messages: [],
						result: { status: expectedStatus },
					});
				},
				{ once: true }
			)
		);
	};

	describe("instances pause", () => {
		it("should pause the bar instance without prompting for --from-name", async ({
			expect,
		}) => {
			mockStatusEdit(expect, "pause");
			await runWrangler(
				`workflows instances pause bar --workflow-name some-workflow --status pause`
			);
			expect(JSON.parse(std.out)).toEqual({ status: "pause" });
		});
	});

	describe("instances resume", () => {
		it("should resume the bar instance without prompting for --from-name", async ({
			expect,
		}) => {
			mockStatusEdit(expect, "resume");
			await runWrangler(
				`workflows instances resume bar --workflow-name some-workflow --status resume`
			);
			expect(JSON.parse(std.out)).toEqual({ status: "resume" });
		});
	});

	describe("instances terminate", () => {
		it("should terminate the bar instance without prompting for --from-name", async ({
			expect,
		}) => {
			mockStatusEdit(expect, "terminate");
			mockConfirm({
				text: "This operation terminates the running Workflow instance. Continue?",
				result: true,
			});
			await runWrangler(
				`workflows instances terminate bar --workflow-name some-workflow --status terminate`
			);
			expect(JSON.parse(std.out)).toEqual({ status: "terminate" });
		});
	});

	describe("instances restart", () => {
		it("should restart the bar instance without prompting for --from-name", async ({
			expect,
		}) => {
			mockStatusEdit(expect, "restart");
			await runWrangler(
				`workflows instances restart bar --workflow-name some-workflow --status restart`
			);
			expect(JSON.parse(std.out)).toEqual({ status: "restart" });
		});
	});

	describe("instances terminate-all", () => {
		// wrangler's `workflows instances terminate-all` PUT to
		// /accounts/:id/workflows/:name/instances/terminate doesn't have a
		// cf equivalent. cf has `workflows instances batch-terminate`
		// (POST to /instances/batch/terminate, body-required) and
		// `workflows instances status-terminate` (GET — checks job status,
		// not start one). Different endpoints, different shapes.
		it.skip("should be able to terminate - job created", async () => {});
		it.skip("should be able to terminate - job exists", async () => {});
		it.skip("should be able to terminate - specific status, job created", async () => {});
		it.skip("should be able to terminate - specific status, job exists", async () => {});
		it.skip("invalid status", async () => {});
	});

	describe("trigger", () => {
		const mockTriggerWorkflow = async () => {
			msw.use(
				http.post(
					`*/accounts/:accountId/workflows/some-workflow/instances`,
					async () => {
						return HttpResponse.json({
							success: true,
							errors: [],
							messages: [],
							result: {
								id: "3c70754a-8435-4498-92ad-22e2e2c90853",
								status: "queued",
								version_id: "9e94c502-ca41-4342-a7f7-af96b444512c",
								workflow_id: "03e70e31-d7a4-4401-a629-6a4b6096cdfe",
							},
						});
					},
					{ once: true }
				)
			);
		};

		it("should trigger a workflow given a name", async ({ expect }) => {
			await mockTriggerWorkflow();

			// wrangler:  `workflows trigger <name> [params]`
			// cf:        `workflows instances create <workflowName>`
			await runWrangler(`workflows instances create some-workflow`);
			expect(JSON.parse(std.out)).toMatchObject({
				id: "3c70754a-8435-4498-92ad-22e2e2c90853",
				status: "queued",
			});
		});
	});

	describe("delete", () => {
		it("should delete a workflow - green path", async ({ expect }) => {
			await mockDeleteWorkflowRequest(expect, "some-workflow");

			// cf prompts to confirm a destructive delete in TTY mode.
			mockConfirm({
				text: "This operation permanently deletes the Workflow. Continue?",
				result: true,
			});

			await runWrangler(`workflows delete some-workflow`);
		});
	});

	describe("workflow binding validation", () => {
		// cf doesn't read project worker config (no `cf deploy` yet, no
		// wrangler.toml ingestion). All these tests exercise wrangler's
		// `wrangler deploy --dry-run` + worker-config validation flow.
		it.skip("should validate workflow binding with valid name", async () => {});
		it.skip("should reject workflow binding with name exceeding 64 characters", async () => {});
		it.skip("should reject workflow binding with name with invalid characters", async () => {});
		it.skip("should accept workflow binding with name exactly 64 characters", async () => {});
		it.skip("should validate required fields for workflow binding", async () => {});
		it.skip("should validate optional fields for workflow binding", async () => {});
		it.skip("should reject workflow binding with invalid field types", async () => {});
		it.skip("should reject workflow binding that is not an object", async () => {});
		it.skip("should accept workflow binding with valid limits", async () => {});
		it.skip("should accept workflow binding with empty limits object", async () => {});
		it.skip("should accept workflow binding with limits.steps at boundary value 1", async () => {});
		it.skip("should reject workflow binding with limits.steps of 0", async () => {});
		it.skip("should reject workflow binding with non-integer limits.steps", async () => {});
		it.skip("should reject workflow binding with negative limits.steps", async () => {});
		it.skip("should reject workflow binding with non-object limits", async () => {});
		it.skip("should reject workflow binding with array limits", async () => {});
		it.skip("should warn on unexpected fields in workflow binding limits", async () => {});
		it.skip("should warn when step limit exceeds production maximum", async () => {});
		it.skip("should not warn when step limit is within production maximum", async () => {});
		it.skip("should reject workflows binding with same name", async () => {});
	});

	// =========================================================================
	// Local commands target a running dev session. The fixture below starts a
	// real Workflow-capable Miniflare peer in cf's dev registry.
	// =========================================================================

	describe("local", () => {
		const workflowPeer = useWorkflowPeer();
		const local = () => workflowPeer.localArgs();
		beforeEach(() => {
			setIsTTY(false);
			vi.stubEnv("NO_COLOR", "1");
		});

		async function trigger(params?: string): Promise<string> {
			await runWrangler(
				`workflows instances create ${workflowPeer.name}${params === undefined ? "" : ` --params '${params}'`} ${local()}`
			);
			const result = JSON.parse(std.getAndClearOut()) as { id: string };
			return result.id;
		}

		function readJsonOutput(): unknown {
			const log = vi.mocked(console.log);
			const output = log.mock.calls.map(([value]) => String(value)).join("\n");
			log.mockClear();
			try {
				return JSON.parse(output);
			} catch (error) {
				throw new Error(`Invalid JSON output: ${JSON.stringify(output)}`, {
					cause: error,
				});
			}
		}

		describe("workflows list --local", () => {
			it("should list workflows from local dev session", async ({ expect }) => {
				await runWrangler(`workflows list ${local()}`);
				expect(JSON.parse(std.getAndClearOut())).toEqual([
					expect.objectContaining({
						name: workflowPeer.name,
						class_name: "TestWorkflow",
						script_name: "cf-workflow-test-peer",
					}),
				]);
			});
			it.todo("should warn when no local workflows exist");
		});

		describe("workflows describe --local", () => {
			it("should describe a workflow from local dev session", async ({
				expect,
			}) => {
				await runWrangler(`workflows get ${workflowPeer.name} ${local()}`);
				expect(readJsonOutput()).toEqual(
					expect.objectContaining({
						name: workflowPeer.name,
						class_name: "TestWorkflow",
						script_name: "cf-workflow-test-peer",
					})
				);
			});
		});

		describe("workflows trigger --local", () => {
			it("should trigger a workflow in local dev session", async ({
				expect,
			}) => {
				const instanceId = await trigger('{"foo":"bar"}');
				await runWrangler(
					`workflows instances get ${instanceId} --workflow-name ${workflowPeer.name} ${local()}`
				);
				const details = readJsonOutput() as { params: string };
				expect(JSON.parse(details.params)).toEqual({ foo: "bar" });
			});
			it("should trigger without params in local dev session", async ({
				expect,
			}) => {
				expect(await trigger()).toEqual(expect.any(String));
			});
		});

		describe("workflows delete --local", () => {
			it.todo("should delete a workflow in local dev session");
		});

		describe("workflows instances list --local", () => {
			it("should list instances from local dev session", async ({ expect }) => {
				const instanceId = await trigger();
				await runWrangler(
					`workflows instances list --workflow-name ${workflowPeer.name} ${local()}`
				);
				expect(readJsonOutput()).toEqual(
					expect.arrayContaining([expect.objectContaining({ id: instanceId })])
				);
			});
			it.todo("should warn when no local instances exist");
		});

		describe("workflows instances describe --local", () => {
			it("should describe an instance from local dev session", async ({
				expect,
			}) => {
				const instanceId = await trigger('{"input":"data"}');
				await runWrangler(
					`workflows instances get ${instanceId} --workflow-name ${workflowPeer.name} ${local()}`
				);
				const details = readJsonOutput() as {
					params: string;
					status: string;
				};
				expect(JSON.parse(details.params)).toEqual({ input: "data" });
				expect(details.status).toEqual(expect.any(String));
			});
		});

		describe("workflows instances pause --local", () => {
			it.todo("should pause an instance in local dev session");
		});

		describe("workflows instances resume --local", () => {
			it.todo("should resume an instance in local dev session");
		});

		describe("workflows instances terminate --local", () => {
			it.todo("should terminate an instance in local dev session");
		});

		describe("workflows instances restart --local", () => {
			it.todo("should restart an instance in local dev session");
		});

		describe("workflows instances send-event --local", () => {
			it.todo("should send an event to an instance in local dev session");
			it("should send an event without payload in local dev session", async ({
				expect,
			}) => {
				const instanceId = await trigger();
				await runWrangler(
					`workflows instances events send my-event --workflow-name ${workflowPeer.name} --instance-id ${instanceId} ${local()}`
				);
				expect(JSON.parse(std.getAndClearOut())).toEqual({ success: true });
			});
		});

		describe("latest instance resolution --local", () => {
			it.todo("should resolve 'latest' to the most recent instance");
		});
	});
});

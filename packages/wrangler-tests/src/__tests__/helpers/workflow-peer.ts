import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Miniflare } from "miniflare";
import { afterEach, beforeEach, vi } from "vitest";

const COMPATIBILITY_DATE = "2026-08-15";
const WORKFLOW_NAME = "my-workflow";
const WORKER_SOURCE = `
import { WorkflowEntrypoint } from "cloudflare:workers";

export class TestWorkflow extends WorkflowEntrypoint {
  async run(_event, step) {
    const event = await step.waitForEvent("wait for test event", {
      type: "my-event",
      timeout: "1 hour",
    });
    return event.payload;
  }
}

export default {
  fetch() {
    return new Response(null, { status: 404 });
  },
};
`;

export interface WorkflowPeer {
	name: string;
	localArgs(): string;
}

/**
 * Start the equivalent of the running `wrangler dev` session required by
 * `wrangler workflows --local`. The peer and cf's command-scoped Miniflare
 * join the same dev registry and share the same resource persistence root.
 */
export function useWorkflowPeer(): WorkflowPeer {
	let peer: Miniflare | undefined;
	let root = "";

	beforeEach(async () => {
		root = mkdtempSync(join(tmpdir(), "cf-workflow-peer-"));
		const registryPath = join(root, "registry");
		const persistTo = join(root, "state");
		vi.stubEnv("CLOUDFLARE_REGISTRY_PATH", registryPath);

		peer = new Miniflare({
			unsafeLocalExplorer: true,
			unsafeEnableSharedStorage: true,
			unsafeDevRegistryPath: registryPath,
			resourcePersistencePath: join(persistTo, "v3"),
			isolatedResourcePersistencePath: join(root, "isolated"),
			workers: [
				{
					config: {
						name: "cf-workflow-test-peer",
						compatibilityDate: COMPATIBILITY_DATE,
						manifest: {
							mainModule: "workflow-peer.mjs",
							modules: {
								"workflow-peer.mjs": {
									type: "esm",
									contents: WORKER_SOURCE,
								},
							},
						},
						env: {
							TEST_WORKFLOW: {
								type: "workflow",
								name: WORKFLOW_NAME,
								worker: "cf-workflow-test-peer",
								exportName: "TestWorkflow",
							},
						},
					},
				},
			],
		});
		await peer.ready;
	});

	afterEach(async () => {
		await peer?.dispose();
		peer = undefined;
		if (root !== "") {
			rmSync(root, { recursive: true, force: true });
		}
	});

	return {
		name: WORKFLOW_NAME,
		localArgs: () => `--local --persist-to ${join(root, "state")}`,
	};
}

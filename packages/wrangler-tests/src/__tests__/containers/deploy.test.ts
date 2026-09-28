import { describe, it } from "vitest";

describe.skip("containers deploy", () => {
	// These are Wrangler deploy orchestration tests: Docker, Worker config,
	// image pushing, Durable Object wiring, and rollout synthesis. cf exposes
	// the underlying APIs but does not own Wrangler's deploy pipeline.
	it("should fail early if no docker is detected when deploying a container from a dockerfile", () => {});
	it("should fail early if the account id doesn't match the account id in the image uri", () => {});
	it("should be able to deploy a new container from a dockerfile", () => {});
	it("should be able to deploy a snapshot-enabled container from a dockerfile", () => {});
	it("should retry when the uploaded Worker version is not immediately available", () => {});
	it("should be able to deploy a new container from an image uri", () => {});
	it("should be able to deploy a new container with custom instance limits", () => {});
	it("should be able to deploy a new container with custom instance limits (instance_type)", () => {});
	it("should resolve the docker build context path based on the dockerfile location, if image_build_context is not provided", () => {});
	it("should resolve dockerfile path relative to wrangler config path", () => {});
	it("should be able to redeploy an existing application ", () => {});
	it("should be able to redeploy an existing application and create another", () => {});
	it("skips an existing application if there are no changes", () => {});
	it("should error when no scope for containers", () => {});
	it("should create rollout with *step_percentage* when rollout_step_percentage is a number", () => {});
	it("should create rollout with *steps* when rollout_step_percentage is an array of numbers", () => {});
	it("should override rollout to 100 if deploying with --containers-rollout=immediate ", () => {});
	it("deploying with --containers-rollout=rolling should pass through the config value of rollout_step_percentage", () => {});
	it("should skip Docker check and container deploy when --containers-rollout=none", () => {});
	it("should be able to enable observability logs (top level)", () => {});
	it("should be able to enable observability logs (logs field)", () => {});
	it("should be able to disable observability logs (top level)", () => {});
	it("should be able to disable observability logs (logs field)", () => {});
	it("should be able to disable observability logs (absent field)", () => {});
	it("should keep observability logs enabled", () => {});
	it("should keep obserability logs disabled if api returns false and undefined in config", () => {});
	it("should expand image names from managed registry", () => {});
	it("may be specified on creation", () => {});
	it("may be specified on modification", () => {});
	it("should not repush image if it already exists remotely", () => {});
	it("should use digest when an existing tagged image already exists remotely", () => {});
	it("should enable ssh when provided for new container", () => {});
	it("should enable ssh when provided for an existing container", () => {});
	it("enables ssh when provided in wrangler.jsonc", () => {});
	it("accepts wrangler_ssh as a backward-compatible alias", () => {});
	it("should validate containers.ssh fields", () => {});
	it("should be able to deploy a new container", () => {});
	it("should be able to deploy a container referenced from a declarative durable object export", () => {});
	it("should error if a container name has been used before but attached to a different DO", () => {});
	it("should be able to redeploy an existing application", () => {});
	it("builds the image without pushing when given a dockerfile", () => {});
	it("does not build when --containers-rollout=none", () => {});
	it("does not push when given a registry link", () => {});
	it("should deploy containers when using --dispatch-namespace", () => {});
	it("should merge containers.unsafe config into create request", () => {});
	it("should merge containers.unsafe config into modify request", () => {});
});

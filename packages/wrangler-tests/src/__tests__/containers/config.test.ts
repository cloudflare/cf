import { describe, it } from "vite-plus/test";

describe.skip("containers config", () => {
	// cf deliberately does not read or normalize project Worker/container config.
	it("should return empty array when no containers are configured", () => {});
	it("should return empty array when containers is undefined", () => {});
	it("should throw error when container class_name doesn't match any durable object", () => {});
	it("should resolve class_name from a durable object export that references the container by name", () => {});
	it("should throw error when a container is not linked to any durable object", () => {});
	it("should throw error when durable object has script_name defined", () => {});
	it("should normalize and set defaults for container with dockerfile", () => {});
	it("should normalize and set defaults for container with registry image", () => {});
	it("should use the FedRAMP High registry from Wrangler config", () => {});
	it("should default max_instances and rollout_step_percentage accordingly", () => {});
	it("should handle custom limit configuration", () => {});
	it("should handle custom limit configuration through instance_type", () => {});
	it("should normalize and set defaults for custom limits to dev instance type", () => {});
	it("should handle instance type configuration", () => {});
	it("should handle all custom configuration options", () => {});
	it("should handle dockerfile with default build context", () => {});
	it("should handle multiple containers", () => {});
	it("should handle config with no configPath", () => {});
	it("should be able to specify all tiers", () => {});
	it("should convert deprecated tier to tiers array", () => {});
	it("should default rollout_step_percentage to 100 when max_instances is 1", () => {});
	it("should set rollout_kind to none when containersRollout is none", () => {});
	it("should allow any image registry", () => {});
	it("should not try and add an account id to non containers registry uris", () => {});
	it("should not try and add an account id during a dry run", () => {});
	it("should handle valid ssh and authorized_keys config", () => {});
});

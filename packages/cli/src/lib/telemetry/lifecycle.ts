const pendingRequests = new Set<Promise<void>>();
let commandReported = false;

export function trackTelemetryDispatch(request: Promise<void> | void): void {
	if (!request) {
		return;
	}
	const tracked = request.finally(() => pendingRequests.delete(tracked));
	pendingRequests.add(tracked);
}

export function allTelemetryDispatchesSettled(): Promise<void> {
	return Promise.allSettled(pendingRequests).then(() => undefined);
}

export function beginTelemetryRun(): void {
	commandReported = false;
}

export function markCommandReported(): void {
	commandReported = true;
}

export function wasCommandReported(): boolean {
	return commandReported;
}

export function __resetTelemetryLifecycleForTests(): void {
	commandReported = false;
	pendingRequests.clear();
}

---
"cf": minor
---

Offer to delete a Worker's Container applications with `cf workers delete`

The command finds applications owned by the Worker before deleting it. It offers to delete them interactively and warns when it leaves them behind. To opt in without a prompt, run `cf workers delete <worker> --delete-containers --force`. `--force` alone still only skips confirmation. Application deletion is asynchronous, so instances may take a while to shut down.

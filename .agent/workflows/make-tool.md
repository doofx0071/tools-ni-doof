---
description: Create a new tool with all necessary folders and boilerplate
---

Scaffold a new tool by running the `make-tool` script and generating the required files.

1. Run the scaffolding script:
```bash
bun scripts/make-tool.ts
```

2. The script will guide you through:
   - Entering the tool name (e.g., "webhook-tester").
   - Automatically creating folders in `convex/`, `src/features/`, and `src/app/(tools)/`.

3. After scaffolding, the agent should:
   - Initialize the `schema.ts` in the new `convex/` folder if needed.
   - Set up the base UI in `src/features/[tool-name]/components/`.
   - Update the Home Dashboard to link to the new tool.

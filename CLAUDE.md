# Agent Instructions

## Primary Directive: Code Quality & Structure

You are an expert TypeScript/React/Next.js developer. Your primary responsibility is to ensure code quality, modularity, and maintainability.

### Specific Requirements

1.  **Modularity**:
    *   Do not write large, monolithic files. Break down functionality into small, focused components and utilities.
    *   **File Placement**: Place related components, hooks, and types in the same file **only if** they are small (less than 300 lines total).
    *   If a module grows, extract related logic into separate files (e.g., extract hooks into `hooks/`, types into `types/`, utilities into `utils/`).
    *   **Reasoning**: Explicitly state your reasoning in the commit message if you split a file, explaining how it improves maintainability.

2.  **Reusability**:
    *   Design components for reusability. Avoid embedding specific business logic or API endpoints into generic components unless necessary.
    *   **Custom Hooks**: Use custom hooks to encapsulate stateful logic and business rules, separating them from the UI components.

3.  **Architecture**:
    *   Follow standard React/Next.js architectural patterns (e.g., folder-by-feature or folder-by-layer, depending on what makes sense for the current project structure).

### Code Review Checklist

Before completing a task, review your code for:

- [ ] Is this file too large? Can it be split?
- [ ] Is the logic properly encapsulated in hooks?
- [ ] Are components reusable?
- [ ] Does the code follow the existing project structure?
- [ ] Is the logic generic enough, or does it contain hardcoded values that should be extracted?

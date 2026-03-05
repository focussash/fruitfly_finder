# Project Rules

## Environment
- OS: Windows 11 (PowerShell)
- Platform: Web Application
- Language: TypeScript
- Framework: React 18+ with Vite
- Styling: Tailwind CSS
- Multiplayer: Socket.io (WebSocket)
- Image Generation: Gemini Pro API

## Architecture Principles
- **Favor modular code over monolithic**: Separate concerns into distinct modules/packages. Use interfaces, dependency injection, and clean architecture patterns where appropriate.
- **Single Responsibility**: Each class/file should have one clear purpose.
- **Testability**: Design components to be independently testable.

## Permissions
- **Bash commands**: Full permission to run any bash/terminal commands within the project folder (`E:\Random\Pet_projects\Fruitfly_finder`) without asking. This includes npm scripts, file operations, git commands, etc.

## Workflow Rules
1. **Always refer to `memory-claude/app-design.md`** before writing any code to ensure alignment with planned features.
2. **Document ALL changes in `memory-claude/architecture.md`**:
   - Planned implementation steps
   - Bug fixes (even ad-hoc ones discussed in chat)
   - Any code modifications, refactors, or feature tweaks
   - This ensures session continuity and full project history
3. **Follow `memory-claude/implementation-plan.md`** for step-by-step implementation guidance.
4. **Validation required for each step**:
   - Every implementation step must include validation tests before requesting approval
   - Provide maximum proof of validation appropriate to the task:
     - **UI/Visual changes**: Screenshots or screen recordings
     - **Functionality**: Console logs, test outputs, or demo of behavior
     - **API/Services**: Request/response logs, connection confirmations
     - **Build/Setup**: Command output showing success
   - For trivial tasks or pass/fail validations, a simple confirmation is sufficient
   - Document validation results in `architecture.md` alongside progress updates
5. **Step-by-step approval required**:
   - Inform user after completing each step
   - Wait for user permission before proceeding to next step
   - During a single step, proceed freely with all necessary edits without asking permission
6. **Session handoff**:
   - When user says they're stopping for the day, write `memory-claude/RESUME.md`
   - Include: commands to run, current step, any context needed to continue
   - Read this file at the start of each new session

## Key Files
- `memory-claude/app-design.md` - Feature specifications and requirements
- `memory-claude/implementation-plan.md` - Detailed implementation steps with tests
- `memory-claude/architecture.md` - Progress documentation and completed work
- `memory-claude/RESUME.md` - Session handoff notes (read this first when resuming)

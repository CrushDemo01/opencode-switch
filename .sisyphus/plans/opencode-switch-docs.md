# Documentation Update Plan: opencode-switch v2.0.0

## TL;DR

> **Quick Summary**: Update 4 documentation files to reflect the major v2.0.0 refactoring. The current README is severely outdated (references deleted server.js, missing all new features). This plan creates comprehensive, accurate documentation for the new modular architecture.
> 
> **Deliverables**: 
> - Updated README.md with new structure and all v2.0.0 features
> - New CHANGELOG.md documenting the release
> - New ARCHITECTURE.md explaining modular design
> - New API.md documenting HTTP endpoints and frontend modules
> 
> **Estimated Effort**: Medium (4-6 hours across 4 files)
> **Parallel Execution**: YES - 4 parallel tasks (each file is independent)
> **Critical Path**: None - all files can be written simultaneously

---

## Context

### Original Request
User needs to update documentation for opencode-switch v2.0.0 major refactoring. Current README.md is outdated and references the old file structure (server.js, index.html in root). Four documentation files need creation/updating:
1. README.md - comprehensive update
2. CHANGELOG.md - document v2.0.0 changes
3. ARCHITECTURE.md - explain new modular structure
4. API.md - document API endpoints

### Codebase Analysis

**Current State (v2.0.0)**:
- Package.json: version 2.0.0, main: src/server/index.js
- Project structure is modular with src/server/ and src/public/
- Has Jest testing with coverage, ESLint, Prettier
- 10 predefined provider templates
- History/rollback using localStorage
- Import/export via client-side file operations
- API key encryption via encryptionService
- XSS protection via escape utility

**Backend API Endpoints** (5 total):
- `GET /` - Serve web UI (src/public/index.html)
- `GET /api/config` - Read full configuration
- `POST /api/config` - Add/update provider
- `DELETE /api/config/:id` - Delete provider by ID
- `POST /api/discover-models` - Auto-discover available models
- `POST /api/test-model` - Test API connection

**Frontend Modules**:
- `src/public/js/components/templates.js` - 10 provider presets
- `src/public/js/components/history.js` - localStorage history
- `src/public/js/components/ui.js` - UI helpers
- `src/public/js/utils/api.js` - HTTP client + import/export
- `src/public/js/utils/escape.js` - XSS protection
- `src/public/js/app.js` - Main application

**Current README Issues**:
1. References server.js (deleted/deprecated, now server.js probably just re-exports)
2. References index.html in root (moved to src/public/)
3. No mention of src/ directory structure
4. No mention of testing, linting, CI/CD
5. "Future Plans" section lists features already implemented (import/export, templates, testing)
6. Log file location may be outdated (logger.js has rotation)
7. No security documentation (XSS, encryption, validation)

### Metis-Inspired Gap Analysis

**Questions I should have asked** (addressed with defaults):
- **Documentation tone?** → Technical but accessible, mixed English/Chinese like current README
- **Future plans section?** → Remove entirely (all planned features now implemented) or replace with v3.0 ideas
- **API docs scope?** → HTTP endpoints + key frontend patterns (import/export flow, template usage)
- **Changelog detail?** → User-focused but include major architectural changes for transparency

**Guardrails Applied**:
- Do NOT document internal implementation details (encryption algorithms, validation regex patterns)
- Do NOT include code examples for every function (high-level usage only)
- Do NOT add getting-started tutorials (keep README concise)
- Do NOT document testing commands extensively (brief mention only)

**Scope Lock-down**:
- Only v2.0.0 changes in CHANGELOG (don't backfill v1.0 history)
- Only current architecture in ARCHITECTURE (not evolution history)
- Only existing API endpoints in API.md (don't speculate on future endpoints)

---

## Work Objectives

### Core Objective
Create 4 comprehensive, accurate documentation files that reflect the v2.0.0 modular architecture and all new features, replacing the outdated README and establishing proper documentation standards for the project.

### Concrete Deliverables
1. **README.md** (UPDATED) - Project overview, installation, usage, features list
2. **CHANGELOG.md** (NEW) - v2.0.0 release notes following Keep a Changelog format
3. **ARCHITECTURE.md** (NEW) - Modular structure explanation with diagrams
4. **API.md** (NEW) - HTTP API reference + frontend module documentation

### Definition of Done
- [ ] README.md no longer references deleted files (server.js, root index.html)
- [ ] README.md lists all 8 new v2.0.0 features with brief descriptions
- [ ] CHANGELOG.md follows semver with Added/Changed/Security sections
- [ ] ARCHITECTURE.md explains src/server/ and src/public/ organization
- [ ] API.md documents all 6 HTTP endpoints with request/response examples
- [ ] All files have consistent formatting and cross-references where appropriate
- [ ] Old "Future Plans" section removed or converted to "Completed Features"

### Must Have
- Accurate file structure reflecting src/ directory
- All 6 API endpoints documented with examples
- 10 provider templates listed
- Security features prominently mentioned (encryption, XSS, validation)
- Testing/linting commands documented
- Import/export and history features explained as client-side

### Must NOT Have (Guardrails)
- Internal implementation details (don't expose encryption keys, validation internals)
- Excessive code examples (keep it high-level)
- v1.0 detailed changelog (brief mention only, focus on v2.0.0)
- Speculative future API endpoints
- Step-by-step tutorials (link to examples if needed, don't embed)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES - Jest configured in package.json
- **User wants tests**: NO - This is documentation work, not code
- **QA approach**: Manual verification (reading output files)

### Verification by File

**README.md Verification**:
```bash
# Check no old file references
grep -n "server.js" README.md | grep -v "src/server" && echo "FAIL: Old reference found" || echo "PASS"
grep -n "index.html" README.md | grep -v "src/public" && echo "FAIL: Old reference found" || echo "PASS"

# Check v2.0.0 features mentioned
grep -c "XSS\|加密\|模板\|历史\|导入\|导出" README.md
# Expected: >= 6 (at least security, templates, history, import/export mentioned)

# Check new structure mentioned
grep "src/server" README.md && echo "PASS: New structure documented" || echo "FAIL"
```

**CHANGELOG.md Verification**:
```bash
# Check format
grep -E "^##\s+\[2\.0\.0\]" CHANGELOG.md && echo "PASS: Version header exists" || echo "FAIL"
grep -E "^###\s+(Added|Changed|Security)" CHANGELOG.md && echo "PASS: Categories present" || echo "FAIL"

# Check key features mentioned
grep -c "AES\|XSS\|模板\|历史" CHANGELOG.md
# Expected: >= 4
```

**ARCHITECTURE.md Verification**:
```bash
# Check sections exist
grep "^## " ARCHITECTURE.md | wc -l
# Expected: >= 4 (Overview, Backend, Frontend, Data Flow, Security)

grep "src/server" ARCHITECTURE.md && echo "PASS: Backend structure covered" || echo "FAIL"
grep "src/public" ARCHITECTURE.md && echo "PASS: Frontend structure covered" || echo "FAIL"
```

**API.md Verification**:
```bash
# Check all endpoints documented
grep "GET /api/config" API.md && echo "PASS: GET config" || echo "FAIL"
grep "POST /api/config" API.md && echo "PASS: POST config" || echo "FAIL"
grep "DELETE /api/config" API.md && echo "PASS: DELETE config" || echo "FAIL"
grep "POST /api/discover" API.md && echo "PASS: discover-models" || echo "FAIL"
grep "POST /api/test" API.md && echo "PASS: test-model" || echo "FAIL"
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (All tasks independent - execute immediately):
├── Task 1: README.md - Comprehensive update
├── Task 2: CHANGELOG.md - v2.0.0 release notes
├── Task 3: ARCHITECTURE.md - Modular structure
└── Task 4: API.md - HTTP + Frontend API reference

Critical Path: None (all independent)
Parallel Speedup: ~75% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 (README) | None | None | 2, 3, 4 |
| 2 (CHANGELOG) | None | None | 1, 3, 4 |
| 3 (ARCHITECTURE) | None | None | 1, 2, 4 |
| 4 (API) | None | None | 1, 2, 3 |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 2, 3, 4 | delegate_task(category='writing', run_in_background=true) for each file |

---

## TODOs

- [ ] 1. Update README.md with v2.0.0 content

  **What to do**:
  - Rewrite project structure section to show src/server/ and src/public/
  - Update installation/usage to reference new entry point (src/server/index.js)
  - Add v2.0.0 features section: XSS Protection, Input Validation, API Key Encryption, Import/Export, Templates, History/Rollback, Log Rotation, Config Caching
  - Add security section highlighting encryption and XSS protection
  - Add development section with test, lint, format commands
  - Update API endpoints list (add /api/test-model)
  - Remove or rewrite "Future Plans" section
  - Add provider templates list (OpenAI, Azure, Claude, Ollama, etc.)
  - Update file tree diagram

  **Must NOT do**:
  - Don't document encryption implementation details (just that it exists)
  - Don't include step-by-step tutorials for basic usage
  - Don't backfill detailed v1.0 changelog

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []
  - **Reasoning**: This is pure documentation writing. No special skills needed beyond clear technical writing.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `package.json:3` - Version 2.0.0 confirmation
  - `src/public/js/components/templates.js:9-69` - List of 10 provider templates
  - `src/server/routes/config.js:17-65` - API endpoints structure
  - `src/server/routes/models.js:13-48` - Model-related endpoints
  - `src/server/index.js:19` - Port 3456
  - `bin/opencode-switch.js` - CLI entry point
  - `README.md` (current) - Keep good sections, update outdated ones

  **Acceptance Criteria**:
  - [ ] README.md exists in root directory
  - [ ] No references to deleted server.js (except as legacy note if needed)
  - [ ] No references to root index.html (must reference src/public/index.html)
  - [ ] Project structure section shows src/ directory tree
  - [ ] Features section lists all 8 v2.0.0 features
  - [ ] Security section mentions XSS, encryption, validation
  - [ ] Development section shows npm test, lint, format commands
  - [ ] API section lists all 6 endpoints including /api/test-model
  - [ ] Provider templates section lists all 10 presets
  - [ ] "Future Plans" section removed or converted
  - [ ] Chinese/English tone matches current README style

  **Commit**: YES
  - Message: `docs: update README.md for v2.0.0 release`
  - Files: `README.md`

---

- [ ] 2. Create CHANGELOG.md for v2.0.0

  **What to do**:
  - Create new file following Keep a Changelog format
  - Version 2.0.0 header with date
  ### Added section:
  - Modular architecture (src/server, src/public)
  - XSS Protection with HTML escaping
  - Input validation middleware
  - API key encryption (AES-256-GCM)
  - Configuration import/export (JSON)
  - Provider templates (10 presets)
  - Configuration history and rollback (localStorage)
  - Log rotation
  - Config caching
  - Jest testing framework
  - ESLint + Prettier
  - GitHub Actions CI/CD
  - Model connection testing (/api/test-model)
  ### Changed section:
  - Entry point moved from server.js to src/server/index.js
  - Modular code organization
  - Enhanced security model
  ### Security section:
  - All user inputs sanitized
  - API keys encrypted at rest
  - Path traversal protection for static files
  ### Deprecated/Removed:
  - Legacy single-file architecture (server.js)
  - Brief mention of v1.0.0 baseline

  **Must NOT do**:
  - Don't document every git commit
  - Don't include internal refactoring that doesn't affect users
  - Don't speculate on v2.1.0 or v3.0.0

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `package.json:3` - Version 2.0.0
  - `src/public/js/utils/escape.js` - XSS protection
  - `src/server/services/encryptionService.js` - Encryption
  - `src/server/middleware/validation.js` - Input validation
  - `src/server/utils/logger.js` - Log rotation
  - `src/public/js/components/templates.js` - Templates list
  - `src/public/js/components/history.js` - History feature
  - User-provided v2.0.0 feature list

  **Acceptance Criteria**:
  - [ ] CHANGELOG.md created in root directory
  - [ ] Follows Keep a Changelog format (Added/Changed/Security categories)
  - [ ] Version 2.0.0 header with date
  - [ ] All 8 major features listed under Added
  - [ ] Engineering improvements (testing, linting, CI/CD) included
  - [ ] Security enhancements in dedicated section
  - [ ] Architecture change noted under Changed
  - [ ] Brief v1.0.0 reference for baseline
  - [ ] Unreleased section placeholder for future entries

  **Commit**: YES
  - Message: `docs: add CHANGELOG.md for v2.0.0 release`
  - Files: `CHANGELOG.md`

---

- [ ] 3. Create ARCHITECTURE.md

  **What to do**:
  - Create comprehensive architecture documentation
  ## Overview section:
  - Explain modular architecture decision
  - Separation of concerns (backend API vs frontend UI)
  - Technology stack (Node.js, vanilla JS, no frameworks)
  ## Backend Architecture (src/server/):
  - `/index.js` - HTTP server, middleware composition, route handling
  - `/routes/` - Route definitions (config.js, models.js)
  - `/services/` - Business logic (configService.js, modelService.js, encryptionService.js)
  - `/middleware/` - Request processing (validation.js)
  - `/utils/` - Helpers (logger.js with rotation, validator.js)
  ## Frontend Architecture (src/public/):
  - `/index.html` - Single page application
  - `/js/components/` - UI modules (templates.js, history.js, ui.js)
  - `/js/utils/` - Client utilities (api.js, escape.js)
  - `/js/app.js` - Main application logic
  ## Data Flow section:
  - HTTP request flow: Server → Middleware → Routes → Services → Config file
  - Frontend flow: User action → API module → Backend → Update UI
  - Import/Export flow: File read → Parse → Multiple API calls → Update
  - History flow: Config change → Save to localStorage → Render history list
  ## Security Architecture section:
  - Input validation at middleware layer
  - XSS protection in frontend rendering
  - API key encryption in storage layer
  - Path traversal protection in static file serving
  ## File Organization diagram (ASCII or description)

  **Must NOT do**:
  - Don't include implementation code snippets
  - Don't explain encryption algorithm details
  - Don't document every function in every file
  - Don't include performance benchmarks

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/server/index.js` - Server entry and middleware composition
  - `src/server/routes/config.js` - Route structure
  - `src/server/services/` - Service layer organization
  - `src/server/middleware/validation.js` - Middleware pattern
  - `src/server/utils/logger.js` - Utility structure
  - `src/public/js/components/` - Frontend component organization
  - `src/public/js/utils/api.js` - API client structure

  **Acceptance Criteria**:
  - [ ] ARCHITECTURE.md created in root directory
  - [ ] Overview explains modular design rationale
  - [ ] Backend section documents all 4 subdirectories (routes, services, middleware, utils)
  - [ ] Frontend section documents component and utils organization
  - [ ] Data Flow section explains at least 3 key flows (normal API, import, history)
  - [ ] Security Architecture section covers 4 security layers
  - [ ] ASCII diagram or clear description of file organization
  - [ ] No implementation code, only high-level explanation

  **Commit**: YES
  - Message: `docs: add ARCHITECTURE.md explaining v2.0.0 modular structure`
  - Files: `ARCHITECTURE.md`

---

- [ ] 4. Create API.md

  **What to do**:
  - Create HTTP API reference documentation
  ## HTTP API Endpoints section:
  For each of the 6 endpoints, document:
  - Method + Path
  - Description
  - Request parameters/body (with types)
  - Response format (with example JSON)
  - Error responses
  
  ### 1. GET /
  - Serves the web UI (src/public/index.html)
  - Response: text/html
  
  ### 2. GET /api/config
  - Returns full configuration object
  - Response: `{ provider: { ... } }`
  
  ### 3. POST /api/config
  - Adds or updates a provider
  - Body: `{ providerId: string, config: ProviderConfig }`
  - Response: `{ success: boolean }`
  
  ### 4. DELETE /api/config/:id
  - Deletes a provider by ID
  - Response: `{ success: boolean, error?: string }`
  
  ### 5. POST /api/discover-models
  - Discovers available models from provider API
  - Body: `{ baseURL: string, apiKey: string }`
  - Response: `{ models: string[] } | { error: string }`
  
  ### 6. POST /api/test-model
  - Tests connection to a specific model
  - Body: `{ baseURL: string, apiKey: string, modelId: string }`
  - Response: `{ success: boolean, error?: string }`
  
  ## Frontend API section (JavaScript modules):
  Document key frontend modules that developers might extend:
  
  ### API Module (src/public/js/utils/api.js)
  - `getConfig()` - Fetch configuration
  - `saveProvider(id, config)` - Save provider
  - `deleteProvider(id)` - Delete provider
  - `discoverModels(baseURL, apiKey)` - Auto-discover
  - `testModel(baseURL, apiKey, modelId)` - Test connection
  - `exportConfig()` - Client-side export (creates download)
  - `importConfig(file)` - Client-side import (reads file, saves providers)
  
  ### ConfigHistory Module (src/public/js/components/history.js)
  - `save(config)` - Save snapshot to localStorage
  - `getHistory()` - Get all historical snapshots
  - `restore(timestamp)` - Restore specific snapshot
  - `clear()` - Clear all history
  - `renderHistoryList()` - Generate HTML for history UI
  
  ### ProviderTemplates (src/public/js/components/templates.js)
  - Document the 10 available templates
  - Each template: name, npm package, baseURL, description
  
  ### EscapeUtils (src/public/js/utils/escape.js)
  - `escapeHtml(text)` - XSS protection for text
  - `escapeObject(obj)` - XSS protection for objects
  
  ## Configuration Schema section:
  Document the JSON structure stored and returned:
  ```json
  {
    "provider": {
      "provider-id": {
        "name": "Display Name",
        "npm": "@ai-sdk/package",
        "options": {
          "baseURL": "https://api.example.com/v1",
          "apiKey": "encrypted-key"
        },
        "models": {
          "model-id": { "name": "Model Name" }
        }
      }
    }
  }
  ```

  **Must NOT do**:
  - Don't include full source code
  - Don't document internal service methods not exposed via HTTP
  - Don't include authentication details (API keys in examples should be fake)

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/server/routes/config.js` - HTTP route definitions
  - `src/server/routes/models.js` - Model endpoints
  - `src/public/js/utils/api.js` - Frontend API client
  - `src/public/js/components/history.js` - History module
  - `src/public/js/components/templates.js` - Templates data
  - `src/public/js/utils/escape.js` - Escape utilities
  - `example-config.json` - Configuration schema example

  **Acceptance Criteria**:
  - [ ] API.md created in root directory
  - [ ] All 6 HTTP endpoints documented with method, path, request, response
  - [ ] Each endpoint has example request/response JSON
  - [ ] API module documented with all 7 methods
  - [ ] ConfigHistory module documented with all 5 methods
  - [ ] All 10 provider templates listed
  - [ ] EscapeUtils documented
  - [ ] Configuration JSON schema documented
  - [ ] No real API keys in examples (use placeholder like "sk-xxx")

  **Commit**: YES
  - Message: `docs: add API.md documenting HTTP endpoints and frontend modules`
  - Files: `API.md`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `docs: update README.md for v2.0.0 release` | README.md | grep -c "src/server" README.md >= 1 |
| 2 | `docs: add CHANGELOG.md for v2.0.0 release` | CHANGELOG.md | test -f CHANGELOG.md |
| 3 | `docs: add ARCHITECTURE.md explaining v2.0.0 modular structure` | ARCHITECTURE.md | grep "src/server" ARCHITECTURE.md |
| 4 | `docs: add API.md documenting HTTP endpoints and frontend modules` | API.md | grep "GET /api/config" API.md |

---

## Success Criteria

### Verification Commands

```bash
# File existence
test -f README.md && test -f CHANGELOG.md && test -f ARCHITECTURE.md && test -f API.md && echo "All files created"

# README accuracy
grep -q "src/server/index.js" README.md && echo "README: Entry point correct"
grep -q "XSS\|加密" README.md && echo "README: Security mentioned"
grep -q "npm test" README.md && echo "README: Testing documented"

# CHANGELOG format
grep -q "^## \[2.0.0\]" CHANGELOG.md && echo "CHANGELOG: Version header OK"
grep -q "### Added" CHANGELOG.md && echo "CHANGELOG: Categories OK"

# ARCHITECTURE completeness
grep -q "src/server" ARCHITECTURE.md && echo "ARCHITECTURE: Backend covered"
grep -q "src/public" ARCHITECTURE.md && echo "ARCHITECTURE: Frontend covered"
grep -q "Security" ARCHITECTURE.md && echo "ARCHITECTURE: Security section OK"

# API documentation
grep -q "GET /api/config" API.md && echo "API: GET endpoint OK"
grep -q "POST /api/test-model" API.md && echo "API: Test endpoint OK"
grep -q "ProviderTemplates" API.md && echo "API: Templates documented"
```

### Final Checklist
- [ ] README.md updated with no old file references
- [ ] All 4 documentation files created in root directory
- [ ] CHANGELOG follows Keep a Changelog format
- [ ] ARCHITECTURE explains modular structure clearly
- [ ] API documents all endpoints with examples
- [ ] No implementation secrets exposed (no real API keys, no encryption details)
- [ ] Consistent formatting across all files
- [ ] Cross-references between files work (relative links if any)

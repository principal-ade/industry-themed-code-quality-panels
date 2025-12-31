# LensDataDebugPanel Improvements

This document outlines proposed improvements to the `LensDataDebugPanel` component for better troubleshooting of quality lens data issues.

## Background

### The Problem We Encountered

On 2024-12-30, we discovered that test coverage data from `BunTestLens` wasn't appearing on the map visualization. After investigation, we found:

1. **Root Cause**: `BunTestLens` was populating `fileMetrics` with coverage data, but NOT `result.coverage.files`
2. **Map Requirement**: The map visualization uses `fileCoverage` which is extracted from `result.coverage.files` (via `extractQualityDataFromResults` in the registry)
3. **Debugging Gap**: The current debug panel shows aggregate `coverage.line` percentage but doesn't show whether `coverage.files` array exists or is populated

This issue would have been immediately visible if the debug panel showed the presence/absence of `coverage.files`.

---

## Proposed Improvements

### 1. Coverage Files Section (Critical)

**Purpose**: Show whether `coverage.files` is populated, which is required for map visualization.

**Location**: Add after the existing coverage percentage display in the expanded lens view.

```tsx
interface CoverageFile {
  file: string;
  lines: number;
  branches?: number;
  functions?: number;
  statements?: number;
}

// Update the LensResult interface
export interface LensResult {
  // ... existing fields
  coverage?: {
    line: number;
    branch?: number;
    function?: number;
    statement?: number;
    files?: CoverageFile[]; // ADD THIS
  } | null;
}
```

**Implementation**:

```tsx
{
  /* Coverage Data Section */
}
{
  result.coverage && (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: theme.colors.textMuted,
          marginBottom: 8,
        }}
      >
        Coverage Data
      </div>
      <div
        style={{
          padding: 12,
          backgroundColor: theme.colors.surface,
          borderRadius: 4,
        }}
      >
        {/* Aggregate metrics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: theme.colors.textMuted }}>
              Line
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {result.coverage.line}%
            </div>
          </div>
          {result.coverage.branch !== undefined && (
            <div>
              <div style={{ fontSize: 11, color: theme.colors.textMuted }}>
                Branch
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {result.coverage.branch}%
              </div>
            </div>
          )}
          {result.coverage.function !== undefined && (
            <div>
              <div style={{ fontSize: 11, color: theme.colors.textMuted }}>
                Function
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {result.coverage.function}%
              </div>
            </div>
          )}
        </div>

        {/* coverage.files status - CRITICAL FOR DEBUGGING */}
        <div
          style={{
            padding: 8,
            borderRadius: 4,
            backgroundColor: result.coverage.files?.length
              ? "rgba(34, 197, 94, 0.1)"
              : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${result.coverage.files?.length ? "#22c55e" : "#ef4444"}`,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: result.coverage.files?.length ? "#22c55e" : "#ef4444",
            }}
          >
            coverage.files: {result.coverage.files?.length ?? 0} entries
          </div>
          {!result.coverage.files?.length && (
            <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
              Warning: Coverage won't appear on map visualization!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### 2. Data Validation Warnings

**Purpose**: Proactively surface issues with lens data that could cause visualization problems.

**Implementation**:

```tsx
// Add this helper function
function getLensValidationWarnings(result: LensResult): string[] {
  const warnings: string[] = [];
  const lensId = result.lens?.id?.toLowerCase() ?? "";

  // Test lens specific validations
  const testLenses = [
    "jest",
    "vitest",
    "bun-test",
    "pytest",
    "cargo-test",
    "cargo-nextest",
  ];
  const isTestLens = testLenses.includes(lensId);

  if (isTestLens) {
    if (!result.coverage) {
      warnings.push("Test lens has no coverage data");
    } else if (!result.coverage.files?.length) {
      warnings.push(
        "Test lens missing coverage.files - coverage won't show on map",
      );
    }
  }

  // General validations
  if (result.metrics?.filesAnalyzed === 0 && result.execution?.success) {
    warnings.push(
      "0 files analyzed despite successful execution - check lens configuration",
    );
  }

  if (
    result.fileMetrics?.length === 0 &&
    (result.metrics?.filesAnalyzed ?? 0) > 0
  ) {
    warnings.push("No fileMetrics despite files being analyzed");
  }

  // Formatting lens validations
  const formattingLenses = ["prettier", "biome-format", "rustfmt"];
  if (formattingLenses.includes(lensId)) {
    if (!result.fileMetrics?.length && !result.analyzedFiles?.length) {
      warnings.push(
        "Formatting lens has no file data - check prepareCommand() adds required flags",
      );
    }
  }

  // Check for mismatch between metrics and actual data
  if (result.metrics?.totalIssues !== result.issues?.length) {
    warnings.push(
      `Metrics shows ${result.metrics?.totalIssues} issues but ${result.issues?.length ?? 0} issues in array`,
    );
  }

  return warnings;
}

// Add to component, right after the Metrics Summary section
{
  (() => {
    const warnings = getLensValidationWarnings(result);
    if (warnings.length === 0) return null;

    return (
      <div
        style={{
          padding: 12,
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          border: "1px solid #f59e0b",
          borderRadius: 4,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#f59e0b",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Validation Warnings
        </div>
        {warnings.map((warning, idx) => (
          <div
            key={idx}
            style={{
              fontSize: 12,
              color: "#d97706",
              paddingLeft: 20,
              marginBottom: 4,
            }}
          >
            • {warning}
          </div>
        ))}
      </div>
    );
  })();
}
```

---

### 3. Custom Metrics Display

**Purpose**: Show lens-specific metrics that are useful for debugging (e.g., passRate, functionCoverage, lineCoverage for test lenses).

**Implementation**:

```tsx
{
  /* Custom Metrics */
}
{
  result.metrics?.custom && Object.keys(result.metrics.custom).length > 0 && (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: theme.colors.textMuted,
          marginBottom: 8,
        }}
      >
        Lens-Specific Metrics
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 8,
          padding: 12,
          backgroundColor: theme.colors.surface,
          borderRadius: 4,
        }}
      >
        {Object.entries(result.metrics.custom).map(([key, value]) => (
          <div key={key}>
            <div
              style={{
                fontSize: 11,
                color: theme.colors.textMuted,
                textTransform: "capitalize",
              }}
            >
              {key.replace(/([A-Z])/g, " $1").trim()}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: theme.colors.text,
              }}
            >
              {typeof value === "number"
                ? Number.isInteger(value)
                  ? value
                  : value.toFixed(2)
                : String(value)}
              {key.toLowerCase().includes("rate") ||
              key.toLowerCase().includes("coverage")
                ? "%"
                : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 4. Raw JSON Toggle

**Purpose**: Allow deep inspection of the actual lens result data structure for debugging edge cases.

**Implementation**:

```tsx
// Add state at component level
const [showRawJson, setShowRawJson] = React.useState<string | null>(null);

// Add toggle button and display in the expanded lens view
<div style={{ marginTop: 16 }}>
  <button
    onClick={() => setShowRawJson(showRawJson === lensKey ? null : lensKey)}
    style={{
      padding: "6px 12px",
      fontSize: 11,
      backgroundColor: "transparent",
      border: `1px solid ${theme.colors.border}`,
      borderRadius: 4,
      color: theme.colors.textMuted,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6,
    }}
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
    {showRawJson === lensKey ? "Hide" : "Show"} Raw JSON
  </button>

  {showRawJson === lensKey && (
    <div style={{ marginTop: 8 }}>
      <pre
        style={{
          fontSize: 10,
          lineHeight: 1.4,
          maxHeight: 400,
          overflow: "auto",
          padding: 12,
          backgroundColor: "#0d1117",
          color: "#c9d1d9",
          borderRadius: 4,
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {JSON.stringify(result, null, 2)}
      </pre>
      <button
        onClick={() =>
          navigator.clipboard.writeText(JSON.stringify(result, null, 2))
        }
        style={{
          marginTop: 8,
          padding: "4px 8px",
          fontSize: 10,
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: 4,
          color: theme.colors.textMuted,
          cursor: "pointer",
        }}
      >
        Copy to Clipboard
      </button>
    </div>
  )}
</div>;
```

---

### 5. Extraction Preview

**Purpose**: Show what `extractQualityDataFromResults` would extract, helping debug map visualization issues.

**Implementation**:

```tsx
{
  /* Extraction Preview */
}
<div style={{ marginTop: 16 }}>
  <div
    style={{
      fontSize: 12,
      fontWeight: 600,
      color: theme.colors.textMuted,
      marginBottom: 8,
    }}
  >
    Map Data Extraction Preview
  </div>
  <div
    style={{
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 4,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    }}
  >
    <div>
      <div
        style={{ fontSize: 11, color: theme.colors.textMuted, marginBottom: 4 }}
      >
        fileCoverage (from coverage.files)
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          color:
            (result.coverage?.files?.length ?? 0) > 0 ? "#22c55e" : "#ef4444",
        }}
      >
        {result.coverage?.files?.length ?? 0}
        <span
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: theme.colors.textMuted,
            marginLeft: 4,
          }}
        >
          entries
        </span>
      </div>
    </div>
    <div>
      <div
        style={{ fontSize: 11, color: theme.colors.textMuted, marginBottom: 4 }}
      >
        fileMetrics (from fileMetrics)
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          color:
            (result.fileMetrics?.length ?? 0) > 0
              ? "#22c55e"
              : theme.colors.textMuted,
        }}
      >
        {result.fileMetrics?.length ?? 0}
        <span
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: theme.colors.textMuted,
            marginLeft: 4,
          }}
        >
          entries
        </span>
      </div>
    </div>
  </div>
</div>;
```

---

### 6. Analyzed Files Section

**Purpose**: Show all files that were analyzed (not just files with issues).

**Implementation**:

```tsx
// Update interface to include analyzedFiles
export interface LensResult {
  // ... existing fields
  analyzedFiles?: Array<{
    path: string;
    hasIssues: boolean;
  }>;
}

// Add collapsible section
{
  result.analyzedFiles && result.analyzedFiles.length > 0 && (
    <div style={{ marginTop: 16 }}>
      <div
        onClick={() => toggleAnalyzedFiles(lensKey)}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: theme.colors.textMuted,
          marginBottom: 8,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: expandedAnalyzedFiles.has(lensKey)
              ? "rotate(90deg)"
              : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        >
          <polyline points="9,18 15,12 9,6" />
        </svg>
        Analyzed Files ({result.analyzedFiles.length})
      </div>

      {expandedAnalyzedFiles.has(lensKey) && (
        <div
          style={{
            maxHeight: 300,
            overflow: "auto",
            padding: 8,
            backgroundColor: theme.colors.surface,
            borderRadius: 4,
          }}
        >
          {result.analyzedFiles.map((file, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 8px",
                fontSize: 12,
                borderRadius: 2,
                backgroundColor: file.hasIssues
                  ? "rgba(239, 68, 68, 0.05)"
                  : "transparent",
              }}
            >
              <span
                style={{
                  color: theme.colors.text,
                  cursor: onFileClick ? "pointer" : "default",
                }}
                onClick={() => onFileClick?.(file.path)}
              >
                {file.path}
              </span>
              {file.hasIssues && (
                <span
                  style={{
                    fontSize: 10,
                    color: "#ef4444",
                    padding: "1px 4px",
                    borderRadius: 2,
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                  }}
                >
                  issues
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Required Type Updates

Update the `LensResult` interface in `LensDataDebugPanel.tsx`:

```tsx
export interface LensResult {
  package: { name: string; path?: string };
  lens: { id: string; command: string };
  execution: {
    success: boolean;
    exitCode?: number;
    duration?: number;
    timestamp: number;
  };
  issues: Issue[];
  metrics: {
    filesAnalyzed: number;
    totalIssues: number;
    issuesBySeverity: {
      error: number;
      warning: number;
      info: number;
      hint: number;
    };
    executionTime: number;
    custom?: Record<string, unknown>; // Already exists
  };
  fileMetrics?: Array<{
    file: string;
    score: number;
    issueCount: number;
    errorCount: number;
    warningCount: number;
    infoCount?: number;
    hintCount?: number;
    categories?: Record<string, number>;
  }>;
  coverage?: {
    line: number;
    branch?: number;
    function?: number;
    statement?: number;
    files?: Array<{
      // ADD THIS
      file: string;
      lines: number;
      branches?: number;
      functions?: number;
      statements?: number;
    }>;
  } | null;
  analyzedFiles?: Array<{
    // ADD THIS
    path: string;
    hasIssues: boolean;
  }>;
  qualityScore?: number; // ADD THIS
  error?: string; // ADD THIS
}
```

---

## Dependencies

No additional libraries are required. All improvements use:

- React (already installed)
- Inline styles (existing pattern)
- Native browser APIs (`navigator.clipboard`)

Optional enhancements that would require new dependencies:

| Enhancement                | Library                                              | Purpose                          |
| -------------------------- | ---------------------------------------------------- | -------------------------------- |
| JSON syntax highlighting   | `react-syntax-highlighter` or `prism-react-renderer` | Better readability for raw JSON  |
| Copy to clipboard fallback | `copy-to-clipboard`                                  | Support older browsers           |
| Virtualized file lists     | `react-window` or `@tanstack/react-virtual`          | Performance for large file lists |

### If Adding JSON Syntax Highlighting

```bash
npm install react-syntax-highlighter
npm install -D @types/react-syntax-highlighter
```

```tsx
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Replace the <pre> in Raw JSON section with:
<SyntaxHighlighter
  language="json"
  style={oneDark}
  customStyle={{
    fontSize: 10,
    maxHeight: 400,
    borderRadius: 4,
  }}
>
  {JSON.stringify(result, null, 2)}
</SyntaxHighlighter>;
```

---

## Implementation Priority

| Priority     | Improvement              | Impact                                | Effort |
| ------------ | ------------------------ | ------------------------------------- | ------ |
| 1 (Critical) | Coverage Files Section   | Would have caught the BunTestLens bug | Low    |
| 2 (High)     | Data Validation Warnings | Proactive issue detection             | Medium |
| 3 (High)     | Extraction Preview       | Direct visibility into map data       | Low    |
| 4 (Medium)   | Custom Metrics Display   | Better debugging for test lenses      | Low    |
| 5 (Medium)   | Raw JSON Toggle          | Deep debugging capability             | Low    |
| 6 (Low)      | Analyzed Files Section   | Complete file visibility              | Medium |

---

## Testing

After implementing these changes, test with:

1. **Jest results** - Should show `coverage.files` populated
2. **Vitest results** - Should show `coverage.files` populated
3. **Bun test results** - Should show `coverage.files` populated (after lenses v0.1.53+)
4. **ESLint results** - Should show fileMetrics, no coverage
5. **Prettier results** - Should show fileMetrics, no coverage
6. **TypeScript results** - Should show fileMetrics, no coverage

### Test Scenarios for Validation Warnings

1. Test lens with no coverage data at all
2. Test lens with aggregate coverage but no `coverage.files`
3. Lens with 0 filesAnalyzed but successful execution
4. Metrics showing different issue count than issues array

---

## Related Files

- `/src/components/LensDataDebugPanel.tsx` - Main component implementation
- `/src/panels/LensDataDebugPanel.tsx` - Panel wrapper with context
- `@principal-ai/quality-lens-registry` - Contains `extractQualityDataFromResults`
- `@principal-ai/codebase-quality-lenses` - Contains lens implementations

---

## Changelog

| Date       | Change                                                              |
| ---------- | ------------------------------------------------------------------- |
| 2024-12-30 | Initial document created after BunTestLens coverage.files debugging |

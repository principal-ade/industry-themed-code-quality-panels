# Quality Lens Types Reference

Types for building UI components that display quality lens results from `@principal-ai/codebase-quality-lenses`.

## Installation

```bash
npm install @principal-ai/codebase-quality-lenses
```

## Import

```typescript
import type {
  Issue,
  TestResult,
  Coverage,
  FileMetric,
  LensResult,
  QualityHexagonMetrics,
  FormattedResults,
  Severity,
  Metrics,
} from "@principal-ai/codebase-quality-lenses";
```

## Core Types

### Issue

Individual issue found by a quality tool (ESLint, TypeScript, Prettier, etc.)

```typescript
interface Issue {
  file: string; // Relative file path
  line: number; // Line number (1-based)
  column?: number; // Column number (1-based)
  endLine?: number; // End line for multi-line issues
  endColumn?: number; // End column
  severity: Severity; // 'error' | 'warning' | 'info' | 'hint'
  message: string; // Issue message
  rule?: string; // Rule or error code (e.g., "no-unused-vars")
  source: string; // Tool that found this (e.g., "eslint")
  category?: string; // Category (e.g., "style", "type-error")
  fix?: {
    // Suggested fix if available
    text: string;
    range?: {
      start: { line: number; column: number };
      end: { line: number; column: number };
    };
  };
  metadata?: Record<string, unknown>;
}
```

### TestResult

Individual test result from test runners (Jest, Vitest, Bun).

```typescript
interface TestResult {
  suite: string; // Test suite name
  name: string; // Test name
  status: "passed" | "failed" | "skipped" | "pending";
  duration?: number; // Duration in ms
  error?: string; // Failure message
  file?: string; // File containing test
  line?: number; // Line number
}
```

### Coverage

Code coverage information from test runners.

```typescript
interface Coverage {
  line: number; // Overall line coverage %
  branch?: number; // Overall branch coverage %
  function?: number; // Overall function coverage %
  statement?: number; // Overall statement coverage %
  files?: Array<{
    // Per-file coverage
    file: string;
    lines: number;
    branches?: number;
    functions?: number;
    statements?: number;
    uncoveredLines?: number[];
  }>;
}
```

### FileMetric

Per-file quality metrics for visualizations (Code City, heatmaps).

```typescript
interface FileMetric {
  file: string; // Relative file path
  score: number; // Quality score 0-100 (100 = no issues)
  issueCount: number; // Total issues
  errorCount: number; // Error-severity issues
  warningCount: number; // Warning-severity issues
  infoCount: number; // Info-severity issues
  hintCount: number; // Hint-severity issues
  fixableCount?: number; // Auto-fixable issues
  categories?: Record<string, number>; // Issues by category
}
```

### QualityHexagonMetrics

Six dimensions of code quality for radar/hexagon charts.

```typescript
interface QualityHexagonMetrics {
  tests: number; // Test coverage and passing rate (0-100)
  deadCode: number; // Dead code score (100 = no dead code)
  formatting: number; // Code formatting consistency (0-100)
  linting: number; // Linting compliance (0-100)
  types: number; // Type safety score (0-100)
  documentation: number; // Documentation coverage (0-100)
}
```

### Metrics

Aggregated metrics about an analysis run.

```typescript
interface Metrics {
  filesAnalyzed: number;
  totalIssues: number;
  issuesBySeverity: {
    error: number;
    warning: number;
    info: number;
    hint: number;
  };
  executionTime: number; // ms
  custom?: Record<string, unknown>; // Tool-specific
}
```

## Artifact Format

### FormattedResults

The format stored as GitHub Actions artifacts and retrieved by web-ade.

```typescript
interface FormattedResults {
  metadata: {
    timestamp: string; // ISO timestamp
    version: string; // Schema version
    totalPackages: number;
    totalLenses: number;
    git?: {
      commit?: string;
      branch?: string;
      repository?: string; // "owner/repo"
    };
  };

  results: Array<{
    package: { name: string; path?: string };
    lens: { id: string; command: string };
    execution: {
      success: boolean;
      exitCode?: number;
      duration?: number;
      timestamp: number;
    };
    issues: Issue[];
    metrics: Record<string, unknown>;
    coverage?: Coverage;
    fileMetrics?: FileMetric[];
    qualityContext: Record<string, unknown>;
    error?: string;
  }>;

  qualityMetrics?: {
    packages: Array<{
      name: string;
      path?: string;
      hexagon: QualityHexagonMetrics;
    }>;
  };
}
```

## Lens IDs

Available lens identifiers that appear in results:

| Lens ID        | Category      | Tool       |
| -------------- | ------------- | ---------- |
| `eslint`       | linting       | ESLint     |
| `biome-lint`   | linting       | Biome      |
| `typescript`   | types         | TypeScript |
| `prettier`     | formatting    | Prettier   |
| `biome-format` | formatting    | Biome      |
| `jest`         | tests         | Jest       |
| `vitest`       | tests         | Vitest     |
| `bun-test`     | tests         | Bun        |
| `knip`         | deadCode      | Knip       |
| `alexandria`   | documentation | Alexandria |

## Usage Examples

### Display Issues by File

```typescript
function groupIssuesByFile(issues: Issue[]): Map<string, Issue[]> {
  const grouped = new Map<string, Issue[]>();
  for (const issue of issues) {
    const existing = grouped.get(issue.file) || [];
    existing.push(issue);
    grouped.set(issue.file, existing);
  }
  return grouped;
}
```

### Calculate Quality Score

```typescript
function calculateAverageScore(fileMetrics: FileMetric[]): number {
  if (fileMetrics.length === 0) return 100;
  const total = fileMetrics.reduce((sum, fm) => sum + fm.score, 0);
  return Math.round(total / fileMetrics.length);
}
```

### Get Severity Color

```typescript
function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case "error":
      return "#ef4444"; // red
    case "warning":
      return "#f59e0b"; // amber
    case "info":
      return "#3b82f6"; // blue
    case "hint":
      return "#6b7280"; // gray
  }
}
```

### Render Hexagon Dimension

```typescript
function getHexagonLabel(key: keyof QualityHexagonMetrics): string {
  const labels = {
    tests: "Tests",
    deadCode: "Dead Code",
    formatting: "Formatting",
    linting: "Linting",
    types: "Types",
    documentation: "Docs",
  };
  return labels[key];
}
```

## Data Flow

```
GitHub Action
    ↓
quality-lens-cli (runs lenses)
    ↓
results.json (FormattedResults)
    ↓
GitHub Artifact (quality-lens-results-{sha})
    ↓
web-ade API (/api/github/repo/.../quality-artifacts)
    ↓
PanelContext (qualityData slice)
    ↓
UI Panels (QualityHexagonPanel, FileCity, etc.)
```

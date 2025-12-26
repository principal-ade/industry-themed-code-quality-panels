import type { Meta, StoryObj } from "@storybook/react";
import { LensDataDebugPanel, FormattedResults } from "./LensDataDebugPanel";
import { slateTheme } from "@principal-ade/industry-theme";

// Real data from GitHub Actions artifact
import testData from "../../test-data-results.json";

const meta = {
  title: "Components/LensDataDebugPanel",
  component: LensDataDebugPanel,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#1a1a2e" },
        { name: "light", value: "#f5f5f5" },
      ],
    },
    docs: {
      description: {
        component:
          "Debug panel for inspecting raw lens data from quality-lens-cli. Shows files analyzed, issues by file, and metrics for each lens result.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LensDataDebugPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RealData: Story = {
  render: (args) => (
    <div style={{ maxWidth: 900 }}>
      <LensDataDebugPanel {...args} />
    </div>
  ),
  args: {
    data: testData as FormattedResults,
    theme: slateTheme,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Real data from codebase-quality-lens-cli GitHub Actions artifact. Click on a lens to expand and see files with issues.",
      },
    },
  },
};

export const WithFileClick: Story = {
  render: (args) => (
    <div style={{ maxWidth: 900 }}>
      <LensDataDebugPanel {...args} />
    </div>
  ),
  args: {
    data: testData as FormattedResults,
    theme: slateTheme,
    onFileClick: (file, line) => {
      alert(`Navigate to: ${file}${line ? `:${line}` : ""}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "With file click handler - clicking a file or issue will trigger navigation callback.",
      },
    },
  },
};

// Minimal mock data for testing empty states
const emptyData: FormattedResults = {
  metadata: {
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    totalPackages: 1,
    totalLenses: 2,
    git: {
      commit: "abc1234",
      branch: "main",
      repository: "example/repo",
    },
  },
  results: [
    {
      package: { name: "my-package", path: "" },
      lens: { id: "typescript", command: "typecheck" },
      execution: {
        success: true,
        exitCode: 0,
        duration: 1234,
        timestamp: Date.now(),
      },
      issues: [],
      metrics: {
        filesAnalyzed: 42,
        totalIssues: 0,
        issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
        executionTime: 1234,
      },
    },
    {
      package: { name: "my-package", path: "" },
      lens: { id: "eslint", command: "lint" },
      execution: {
        success: true,
        exitCode: 0,
        duration: 567,
        timestamp: Date.now(),
      },
      issues: [],
      metrics: {
        filesAnalyzed: 38,
        totalIssues: 0,
        issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
        executionTime: 567,
      },
    },
  ],
};

export const NoIssues: Story = {
  render: (args) => (
    <div style={{ maxWidth: 900 }}>
      <LensDataDebugPanel {...args} />
    </div>
  ),
  args: {
    data: emptyData,
    theme: slateTheme,
  },
  parameters: {
    docs: {
      description: {
        story: "When all lenses pass with no issues.",
      },
    },
  },
};

// Mock data with various issue types (single package)
const mixedData: FormattedResults = {
  metadata: {
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    totalPackages: 1,
    totalLenses: 3,
    git: {
      commit: "def5678",
      branch: "feature/test",
      repository: "example/mixed-repo",
    },
  },
  results: [
    {
      package: { name: "@example/core", path: "packages/core" },
      lens: { id: "typescript", command: "typecheck" },
      execution: {
        success: false,
        exitCode: 1,
        duration: 2345,
        timestamp: Date.now(),
      },
      issues: [
        {
          file: "src/index.ts",
          line: 10,
          column: 5,
          severity: "error",
          message: "Type 'string' is not assignable to type 'number'.",
          rule: "TS2322",
          source: "typescript",
        },
        {
          file: "src/index.ts",
          line: 25,
          column: 12,
          severity: "error",
          message: "Property 'foo' does not exist on type 'Bar'.",
          rule: "TS2339",
          source: "typescript",
        },
        {
          file: "src/utils.ts",
          line: 8,
          severity: "warning",
          message: "'unused' is declared but its value is never read.",
          rule: "TS6133",
          source: "typescript",
        },
      ],
      metrics: {
        filesAnalyzed: 15,
        totalIssues: 3,
        issuesBySeverity: { error: 2, warning: 1, info: 0, hint: 0 },
        executionTime: 2345,
      },
    },
    {
      package: { name: "@example/core", path: "packages/core" },
      lens: { id: "jest", command: "test" },
      execution: {
        success: true,
        exitCode: 0,
        duration: 5678,
        timestamp: Date.now(),
      },
      issues: [],
      metrics: {
        filesAnalyzed: 8,
        totalIssues: 0,
        issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
        executionTime: 5678,
        custom: {
          totalTests: 42,
          passedTests: 42,
          failedTests: 0,
          passRate: 100,
        },
      },
      coverage: {
        line: 87.5,
        branch: 72.3,
        function: 91.2,
      },
      fileMetrics: [
        {
          file: "src/index.ts",
          score: 95,
          issueCount: 0,
          errorCount: 0,
          warningCount: 0,
        },
        {
          file: "src/utils.ts",
          score: 88,
          issueCount: 0,
          errorCount: 0,
          warningCount: 0,
        },
      ],
    },
    {
      package: { name: "@example/core", path: "packages/core" },
      lens: { id: "prettier", command: "format" },
      execution: {
        success: false,
        exitCode: 1,
        duration: 123,
        timestamp: Date.now(),
      },
      issues: [
        {
          file: "src/components/Button.tsx",
          line: 1,
          severity: "warning",
          message: "File is not formatted correctly",
          source: "prettier",
        },
        {
          file: "src/components/Input.tsx",
          line: 1,
          severity: "warning",
          message: "File is not formatted correctly",
          source: "prettier",
        },
      ],
      metrics: {
        filesAnalyzed: 20,
        totalIssues: 2,
        issuesBySeverity: { error: 0, warning: 2, info: 0, hint: 0 },
        executionTime: 123,
      },
    },
  ],
};

// Multi-package monorepo data
const monorepoData: FormattedResults = {
  metadata: {
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    totalPackages: 3,
    totalLenses: 9,
    git: {
      commit: "abc1234",
      branch: "main",
      repository: "acme/monorepo",
    },
  },
  results: [
    // @acme/core package
    {
      package: { name: "@acme/core", path: "packages/core" },
      lens: { id: "typescript", command: "typecheck" },
      execution: {
        success: true,
        exitCode: 0,
        duration: 1200,
        timestamp: Date.now(),
      },
      issues: [],
      metrics: {
        filesAnalyzed: 25,
        totalIssues: 0,
        issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
        executionTime: 1200,
      },
    },
    {
      package: { name: "@acme/core", path: "packages/core" },
      lens: { id: "eslint", command: "lint" },
      execution: {
        success: true,
        exitCode: 0,
        duration: 800,
        timestamp: Date.now(),
      },
      issues: [],
      metrics: {
        filesAnalyzed: 25,
        totalIssues: 0,
        issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
        executionTime: 800,
      },
    },
    {
      package: { name: "@acme/core", path: "packages/core" },
      lens: { id: "jest", command: "test" },
      execution: {
        success: true,
        exitCode: 0,
        duration: 3500,
        timestamp: Date.now(),
      },
      issues: [],
      metrics: {
        filesAnalyzed: 15,
        totalIssues: 0,
        issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
        executionTime: 3500,
      },
      coverage: { line: 92, branch: 85, function: 95 },
    },
    // @acme/web package
    {
      package: { name: "@acme/web", path: "apps/web" },
      lens: { id: "typescript", command: "typecheck" },
      execution: {
        success: false,
        exitCode: 1,
        duration: 2000,
        timestamp: Date.now(),
      },
      issues: [
        {
          file: "src/pages/Home.tsx",
          line: 15,
          severity: "error",
          message: "Property 'data' is missing",
          rule: "TS2741",
          source: "typescript",
        },
        {
          file: "src/pages/Home.tsx",
          line: 28,
          severity: "error",
          message: "Type 'undefined' is not assignable",
          rule: "TS2322",
          source: "typescript",
        },
      ],
      metrics: {
        filesAnalyzed: 45,
        totalIssues: 2,
        issuesBySeverity: { error: 2, warning: 0, info: 0, hint: 0 },
        executionTime: 2000,
      },
    },
    {
      package: { name: "@acme/web", path: "apps/web" },
      lens: { id: "eslint", command: "lint" },
      execution: {
        success: false,
        exitCode: 1,
        duration: 1500,
        timestamp: Date.now(),
      },
      issues: [
        {
          file: "src/utils/helpers.ts",
          line: 5,
          severity: "warning",
          message: "Unexpected any. Specify a different type.",
          rule: "@typescript-eslint/no-explicit-any",
          source: "eslint",
        },
        {
          file: "src/utils/helpers.ts",
          line: 12,
          severity: "warning",
          message: "Unexpected any. Specify a different type.",
          rule: "@typescript-eslint/no-explicit-any",
          source: "eslint",
        },
        {
          file: "src/components/Button.tsx",
          line: 8,
          severity: "error",
          message: "React Hook useEffect has a missing dependency",
          rule: "react-hooks/exhaustive-deps",
          source: "eslint",
        },
      ],
      metrics: {
        filesAnalyzed: 45,
        totalIssues: 3,
        issuesBySeverity: { error: 1, warning: 2, info: 0, hint: 0 },
        executionTime: 1500,
      },
    },
    {
      package: { name: "@acme/web", path: "apps/web" },
      lens: { id: "jest", command: "test" },
      execution: {
        success: true,
        exitCode: 0,
        duration: 8000,
        timestamp: Date.now(),
      },
      issues: [],
      metrics: {
        filesAnalyzed: 20,
        totalIssues: 0,
        issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
        executionTime: 8000,
      },
      coverage: { line: 68, branch: 55, function: 72 },
    },
    // @acme/cli package
    {
      package: { name: "@acme/cli", path: "packages/cli" },
      lens: { id: "typescript", command: "typecheck" },
      execution: {
        success: true,
        exitCode: 0,
        duration: 600,
        timestamp: Date.now(),
      },
      issues: [],
      metrics: {
        filesAnalyzed: 10,
        totalIssues: 0,
        issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
        executionTime: 600,
      },
    },
    {
      package: { name: "@acme/cli", path: "packages/cli" },
      lens: { id: "eslint", command: "lint" },
      execution: {
        success: true,
        exitCode: 0,
        duration: 400,
        timestamp: Date.now(),
      },
      issues: [],
      metrics: {
        filesAnalyzed: 10,
        totalIssues: 0,
        issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
        executionTime: 400,
      },
    },
    {
      package: { name: "@acme/cli", path: "packages/cli" },
      lens: { id: "jest", command: "test" },
      execution: {
        success: true,
        exitCode: 0,
        duration: 1200,
        timestamp: Date.now(),
      },
      issues: [],
      metrics: {
        filesAnalyzed: 5,
        totalIssues: 0,
        issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
        executionTime: 1200,
      },
      coverage: { line: 88, branch: 80, function: 90 },
    },
  ],
};

export const MixedResults: Story = {
  render: (args) => (
    <div style={{ maxWidth: 900 }}>
      <LensDataDebugPanel {...args} />
    </div>
  ),
  args: {
    data: mixedData,
    theme: slateTheme,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Mixed results with typescript errors, passing tests with coverage, and formatting issues.",
      },
    },
  },
};

export const Monorepo: Story = {
  render: (args) => (
    <div style={{ maxWidth: 900 }}>
      <LensDataDebugPanel {...args} />
    </div>
  ),
  args: {
    data: monorepoData,
    theme: slateTheme,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Multi-package monorepo with 3 packages. Click package buttons to switch between them. @acme/core is clean, @acme/web has issues, @acme/cli is clean.",
      },
    },
  },
};

export const MonorepoPreselected: Story = {
  render: (args) => (
    <div style={{ maxWidth: 900 }}>
      <LensDataDebugPanel {...args} />
    </div>
  ),
  args: {
    data: monorepoData,
    theme: slateTheme,
    selectedPackage: "@acme/web",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Monorepo with @acme/web pre-selected (the package with issues).",
      },
    },
  },
};

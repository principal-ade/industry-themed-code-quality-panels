import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LensDataDebugPanel } from "./LensDataDebugPanel";
import {
  MockPanelProvider,
  createMockContext,
  createMockActions,
  createMockEvents,
} from "../mocks/panelContext";
import type { DataSlice } from "../types";
import type { FormattedResults } from "../components/LensDataDebugPanel";

// Import real test data
import testData from "../../test-data-results.json";

/**
 * LensDataDebugPanel displays raw lens results data for debugging and verification.
 * Shows package breakdown, lens results with pass/fail status, and files with issues.
 */
const meta = {
  title: "Panels/LensDataDebugPanel",
  component: LensDataDebugPanel,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A debug panel for inspecting raw lens results from quality-lens-cli. Useful for verifying data collection and troubleshooting issues.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    context: createMockContext(),
    actions: createMockActions(),
    events: createMockEvents(),
  },
} satisfies Meta<typeof LensDataDebugPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state with real data from GitHub Actions artifact
 */
export const Default: Story = {
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set("lensResults", {
      scope: "repository",
      name: "lensResults",
      data: testData as FormattedResults,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          currentScope: {
            type: "repository",
            workspace: {
              name: "code-quality",
              path: "/Users/developer/code-quality",
            },
            repository: {
              name: "codebase-quality-lens-cli",
              path: "/Users/developer/codebase-quality-lens-cli",
            },
          },
        }}
      >
        {(props) => <LensDataDebugPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Real data from the codebase-quality-lens-cli GitHub Actions artifact.",
      },
    },
  },
};

/**
 * Monorepo with multiple packages
 */
export const Monorepo: Story = {
  render: () => {
    const monorepoData: FormattedResults = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        totalPackages: 3,
        totalLenses: 9,
        git: {
          commit: "abc1234def5678",
          branch: "main",
          repository: "acme/monorepo",
        },
      },
      results: [
        // @acme/core - all passing
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
          analyzedFiles: [
            { path: "src/index.ts", hasIssues: false },
            { path: "src/utils.ts", hasIssues: false },
            { path: "src/types.ts", hasIssues: false },
          ],
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
          fileMetrics: [
            {
              file: "src/index.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/utils.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/index.ts", hasIssues: false },
            { path: "src/utils.ts", hasIssues: false },
          ],
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
            custom: {
              totalTests: 45,
              passedTests: 45,
              failedTests: 0,
              passRate: 100,
            },
          },
          coverage: {
            line: 92,
            branch: 85,
            function: 95,
            files: [
              { file: "src/index.ts", lines: 95, branches: 88, functions: 100 },
              { file: "src/utils.ts", lines: 89, branches: 82, functions: 92 },
            ],
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
              score: 89,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/index.ts", hasIssues: false },
            { path: "src/utils.ts", hasIssues: false },
          ],
        },
        // @acme/web - has issues
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
              message: "Property 'data' is missing in type",
              rule: "TS2741",
              source: "typescript",
            },
            {
              file: "src/pages/Home.tsx",
              line: 28,
              severity: "error",
              message: "Type 'undefined' is not assignable to type 'string'",
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
          analyzedFiles: [
            { path: "src/pages/Home.tsx", hasIssues: true },
            { path: "src/pages/About.tsx", hasIssues: false },
            { path: "src/components/Header.tsx", hasIssues: false },
          ],
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
            totalIssues: 2,
            issuesBySeverity: { error: 1, warning: 1, info: 0, hint: 0 },
            executionTime: 1500,
          },
          fileMetrics: [
            {
              file: "src/utils/helpers.ts",
              score: 85,
              issueCount: 1,
              errorCount: 0,
              warningCount: 1,
            },
            {
              file: "src/components/Button.tsx",
              score: 70,
              issueCount: 1,
              errorCount: 1,
              warningCount: 0,
            },
            {
              file: "src/pages/Home.tsx",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/utils/helpers.ts", hasIssues: true },
            { path: "src/components/Button.tsx", hasIssues: true },
            { path: "src/pages/Home.tsx", hasIssues: false },
          ],
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
            custom: {
              totalTests: 78,
              passedTests: 78,
              failedTests: 0,
              passRate: 100,
            },
          },
          coverage: {
            line: 68,
            branch: 55,
            function: 72,
            files: [
              {
                file: "src/pages/Home.tsx",
                lines: 72,
                branches: 58,
                functions: 80,
              },
              {
                file: "src/components/Button.tsx",
                lines: 65,
                branches: 50,
                functions: 70,
              },
              {
                file: "src/utils/helpers.ts",
                lines: 60,
                branches: 45,
                functions: 65,
              },
            ],
          },
          fileMetrics: [
            {
              file: "src/pages/Home.tsx",
              score: 72,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/components/Button.tsx",
              score: 65,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/pages/Home.tsx", hasIssues: false },
            { path: "src/components/Button.tsx", hasIssues: false },
          ],
        },
        // @acme/cli - all passing
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
          analyzedFiles: [
            { path: "src/cli.ts", hasIssues: false },
            { path: "src/commands/run.ts", hasIssues: false },
          ],
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
          fileMetrics: [
            {
              file: "src/cli.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/commands/run.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/cli.ts", hasIssues: false },
            { path: "src/commands/run.ts", hasIssues: false },
          ],
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
            custom: {
              totalTests: 22,
              passedTests: 22,
              failedTests: 0,
              passRate: 100,
            },
          },
          coverage: {
            line: 88,
            branch: 80,
            function: 90,
            files: [
              { file: "src/cli.ts", lines: 90, branches: 82, functions: 92 },
              {
                file: "src/commands/run.ts",
                lines: 86,
                branches: 78,
                functions: 88,
              },
            ],
          },
          fileMetrics: [
            {
              file: "src/cli.ts",
              score: 90,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/commands/run.ts",
              score: 86,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/cli.ts", hasIssues: false },
            { path: "src/commands/run.ts", hasIssues: false },
          ],
        },
      ],
    };

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set("lensResults", {
      scope: "repository",
      name: "lensResults",
      data: monorepoData,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          currentScope: {
            type: "repository",
            workspace: {
              name: "acme-workspace",
              path: "/Users/developer/acme",
            },
            repository: {
              name: "acme-monorepo",
              path: "/Users/developer/acme/monorepo",
            },
          },
        }}
      >
        {(props) => <LensDataDebugPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Multi-package monorepo with 3 packages. @acme/core and @acme/cli are clean, @acme/web has issues.",
      },
    },
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set("lensResults", {
      scope: "repository",
      name: "lensResults",
      data: null,
      loading: true,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
        }}
      >
        {(props) => <LensDataDebugPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the panel while lens data is loading.",
      },
    },
  },
};

/**
 * No data available
 */
export const NoData: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => <LensDataDebugPanel {...props} />}
    </MockPanelProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: "Shows the empty state when no lens data is available.",
      },
    },
  },
};

/**
 * Ideal Polyglot Monorepo - shows what lens data should look like for different project types
 */
export const IdealPolyglotMonorepo: Story = {
  render: () => {
    const polyglotData: FormattedResults = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        totalPackages: 4,
        totalLenses: 17,
        git: {
          commit: "abc123def",
          branch: "main",
          repository: "acme/polyglot-monorepo",
        },
      },
      results: [
        // =========================================================================
        // TypeScript/Node.js Package (@acme/web-app)
        // =========================================================================
        {
          package: { name: "@acme/web-app", path: "apps/web" },
          lens: { id: "typescript", command: "tsc --noEmit" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 2340,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 48,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 2340,
          },
          analyzedFiles: [
            { path: "src/index.ts", hasIssues: false },
            { path: "src/app.ts", hasIssues: false },
            { path: "src/config.ts", hasIssues: false },
            { path: "src/utils/helpers.ts", hasIssues: false },
            { path: "src/services/api.ts", hasIssues: false },
          ],
        },
        {
          package: { name: "@acme/web-app", path: "apps/web" },
          lens: { id: "eslint", command: "eslint src --ext .ts,.tsx" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 1560,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 48,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 1560,
          },
          fileMetrics: [
            {
              file: "src/index.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/app.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/config.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/index.ts", hasIssues: false },
            { path: "src/app.ts", hasIssues: false },
            { path: "src/config.ts", hasIssues: false },
          ],
        },
        {
          package: { name: "@acme/web-app", path: "apps/web" },
          lens: { id: "prettier", command: "prettier --check src" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 890,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 48,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 890,
          },
          fileMetrics: [
            {
              file: "src/index.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/app.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
        },
        {
          package: { name: "@acme/web-app", path: "apps/web" },
          lens: { id: "vitest", command: "vitest run --coverage" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 4520,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 24,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 4520,
            custom: {
              totalTests: 156,
              passedTests: 156,
              failedTests: 0,
              passRate: 100,
            },
          },
          coverage: {
            line: 94.2,
            branch: 87.5,
            function: 96.8,
            statement: 93.9,
            files: [
              {
                file: "src/index.ts",
                lines: 100,
                branches: 100,
                functions: 100,
                statements: 100,
              },
              {
                file: "src/app.ts",
                lines: 95.5,
                branches: 88.2,
                functions: 100,
                statements: 94.8,
              },
              {
                file: "src/utils/helpers.ts",
                lines: 92.3,
                branches: 85.7,
                functions: 95.0,
                statements: 91.8,
              },
              {
                file: "src/services/api.ts",
                lines: 91.4,
                branches: 82.4,
                functions: 94.1,
                statements: 90.6,
              },
            ],
          },
          fileMetrics: [
            {
              file: "src/index.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/app.ts",
              score: 95,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/utils/helpers.ts",
              score: 92,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/index.ts", hasIssues: false },
            { path: "src/app.ts", hasIssues: false },
            { path: "src/utils/helpers.ts", hasIssues: false },
          ],
        },
        {
          package: { name: "@acme/web-app", path: "apps/web" },
          lens: { id: "knip", command: "knip" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 3200,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 48,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 3200,
            custom: { unusedFiles: 0, unusedExports: 0, unusedDependencies: 0 },
          },
        },
        // =========================================================================
        // Rust Package (@acme/rust-cli)
        // =========================================================================
        {
          package: { name: "@acme/rust-cli", path: "tools/cli" },
          lens: { id: "cargo-check", command: "cargo check" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 1890,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 32,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 1890,
          },
          analyzedFiles: [
            { path: "src/main.rs", hasIssues: false },
            { path: "src/lib.rs", hasIssues: false },
            { path: "src/config.rs", hasIssues: false },
            { path: "src/cli.rs", hasIssues: false },
          ],
        },
        {
          package: { name: "@acme/rust-cli", path: "tools/cli" },
          lens: { id: "clippy", command: "cargo clippy -- -D warnings" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 2450,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 32,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 2450,
          },
          fileMetrics: [
            {
              file: "src/main.rs",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/lib.rs",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/config.rs",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/main.rs", hasIssues: false },
            { path: "src/lib.rs", hasIssues: false },
            { path: "src/config.rs", hasIssues: false },
          ],
        },
        {
          package: { name: "@acme/rust-cli", path: "tools/cli" },
          lens: { id: "rustfmt", command: "cargo fmt --check" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 340,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 32,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 340,
          },
          fileMetrics: [
            {
              file: "src/main.rs",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/lib.rs",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
        },
        {
          package: { name: "@acme/rust-cli", path: "tools/cli" },
          lens: { id: "cargo-nextest", command: "cargo nextest run" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 8920,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 18,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 8920,
            custom: {
              totalTests: 89,
              passedTests: 89,
              failedTests: 0,
              passRate: 100,
            },
          },
          coverage: {
            line: 91.8,
            branch: 84.2,
            function: 95.6,
            files: [
              {
                file: "src/main.rs",
                lines: 88.5,
                branches: 80.0,
                functions: 100,
              },
              {
                file: "src/lib.rs",
                lines: 94.2,
                branches: 87.5,
                functions: 96.0,
              },
              {
                file: "src/config.rs",
                lines: 100,
                branches: 100,
                functions: 100,
              },
              {
                file: "src/cli.rs",
                lines: 92.1,
                branches: 85.7,
                functions: 94.4,
              },
            ],
          },
          fileMetrics: [
            {
              file: "src/lib.rs",
              score: 94,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/config.rs",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/lib.rs", hasIssues: false },
            { path: "src/config.rs", hasIssues: false },
            { path: "src/cli.rs", hasIssues: false },
          ],
        },
        // =========================================================================
        // Python Package (@acme/python-api)
        // =========================================================================
        {
          package: { name: "@acme/python-api", path: "services/api" },
          lens: { id: "mypy", command: "mypy src" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 3450,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 28,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 3450,
          },
          analyzedFiles: [
            { path: "src/__init__.py", hasIssues: false },
            { path: "src/main.py", hasIssues: false },
            { path: "src/config.py", hasIssues: false },
            { path: "src/api/routes.py", hasIssues: false },
          ],
        },
        {
          package: { name: "@acme/python-api", path: "services/api" },
          lens: { id: "ruff", command: "ruff check src" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 780,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 28,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 780,
          },
          fileMetrics: [
            {
              file: "src/main.py",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/config.py",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/api/routes.py",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/main.py", hasIssues: false },
            { path: "src/config.py", hasIssues: false },
            { path: "src/api/routes.py", hasIssues: false },
          ],
        },
        {
          package: { name: "@acme/python-api", path: "services/api" },
          lens: { id: "ruff-format", command: "ruff format --check src" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 420,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 28,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 420,
          },
          fileMetrics: [
            {
              file: "src/main.py",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/config.py",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
        },
        {
          package: { name: "@acme/python-api", path: "services/api" },
          lens: { id: "pytest", command: "pytest --cov=src" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 6780,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 15,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 6780,
            custom: {
              totalTests: 142,
              passedTests: 142,
              failedTests: 0,
              passRate: 100,
            },
          },
          coverage: {
            line: 89.4,
            branch: 82.1,
            function: 93.5,
            files: [
              {
                file: "src/main.py",
                lines: 95.2,
                branches: 88.9,
                functions: 100,
              },
              {
                file: "src/config.py",
                lines: 100,
                branches: 100,
                functions: 100,
              },
              {
                file: "src/api/routes.py",
                lines: 91.3,
                branches: 85.7,
                functions: 94.4,
              },
              {
                file: "src/services/auth.py",
                lines: 90.8,
                branches: 84.6,
                functions: 95.0,
              },
            ],
          },
          fileMetrics: [
            {
              file: "src/main.py",
              score: 95,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/config.py",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/api/routes.py",
              score: 91,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/main.py", hasIssues: false },
            { path: "src/config.py", hasIssues: false },
            { path: "src/api/routes.py", hasIssues: false },
          ],
        },
        // =========================================================================
        // Bun Package (@acme/bun-server)
        // =========================================================================
        {
          package: { name: "@acme/bun-server", path: "services/edge" },
          lens: { id: "typescript", command: "tsc --noEmit" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 1890,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 36,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 1890,
          },
          analyzedFiles: [
            { path: "src/index.ts", hasIssues: false },
            { path: "src/server.ts", hasIssues: false },
            { path: "src/routes/api.ts", hasIssues: false },
          ],
        },
        {
          package: { name: "@acme/bun-server", path: "services/edge" },
          lens: { id: "biome", command: "biome check src" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 450,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 36,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 450,
          },
          fileMetrics: [
            {
              file: "src/index.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/server.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/index.ts", hasIssues: false },
            { path: "src/server.ts", hasIssues: false },
          ],
        },
        {
          package: { name: "@acme/bun-server", path: "services/edge" },
          lens: { id: "biome-format", command: "biome format --check src" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 280,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 36,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 280,
          },
          fileMetrics: [
            {
              file: "src/index.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
        },
        {
          package: { name: "@acme/bun-server", path: "services/edge" },
          lens: { id: "bun-test", command: "bun test --coverage" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 2340,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 18,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 2340,
            custom: {
              totalTests: 78,
              passedTests: 78,
              failedTests: 0,
              passRate: 100,
            },
          },
          coverage: {
            line: 92.6,
            branch: 86.3,
            function: 97.2,
            statement: 92.1,
            files: [
              {
                file: "src/index.ts",
                lines: 100,
                branches: 100,
                functions: 100,
                statements: 100,
              },
              {
                file: "src/server.ts",
                lines: 94.8,
                branches: 89.5,
                functions: 100,
                statements: 94.2,
              },
              {
                file: "src/routes/api.ts",
                lines: 91.2,
                branches: 84.6,
                functions: 95.5,
                statements: 90.8,
              },
              {
                file: "src/middleware/auth.ts",
                lines: 88.4,
                branches: 78.9,
                functions: 92.3,
                statements: 87.6,
              },
            ],
          },
          fileMetrics: [
            {
              file: "src/index.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/server.ts",
              score: 95,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/routes/api.ts",
              score: 91,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/index.ts", hasIssues: false },
            { path: "src/server.ts", hasIssues: false },
            { path: "src/routes/api.ts", hasIssues: false },
          ],
        },
      ],
    };

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set("lensResults", {
      scope: "repository",
      name: "lensResults",
      data: polyglotData,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          currentScope: {
            type: "repository",
            workspace: {
              name: "acme-workspace",
              path: "/Users/developer/acme",
            },
            repository: {
              name: "polyglot-monorepo",
              path: "/Users/developer/acme/polyglot-monorepo",
            },
          },
        }}
      >
        {(props) => <LensDataDebugPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "**Ideal Polyglot Monorepo** - Shows what lens data should look like when everything is working correctly. Contains 4 packages: TypeScript web app (apps/web), Rust CLI (tools/cli), Python API (services/api), and Bun edge server (services/edge). All packages have coverage.files populated for map visualization.",
      },
    },
  },
};

/**
 * All lenses passing
 */
export const AllPassing: Story = {
  render: () => {
    const cleanData: FormattedResults = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        totalPackages: 1,
        totalLenses: 4,
        git: {
          commit: "clean123",
          branch: "main",
          repository: "example/clean-project",
        },
      },
      results: [
        {
          package: { name: "clean-project", path: "" },
          lens: { id: "typescript", command: "typecheck" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 1500,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 50,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 1500,
          },
          analyzedFiles: [
            { path: "src/index.ts", hasIssues: false },
            { path: "src/app.ts", hasIssues: false },
            { path: "src/utils/helpers.ts", hasIssues: false },
            { path: "src/services/api.ts", hasIssues: false },
          ],
        },
        {
          package: { name: "clean-project", path: "" },
          lens: { id: "eslint", command: "lint" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 1200,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 50,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 1200,
          },
          fileMetrics: [
            {
              file: "src/index.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/app.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/utils/helpers.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/index.ts", hasIssues: false },
            { path: "src/app.ts", hasIssues: false },
            { path: "src/utils/helpers.ts", hasIssues: false },
          ],
        },
        {
          package: { name: "clean-project", path: "" },
          lens: { id: "prettier", command: "format" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 300,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 50,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 300,
          },
          fileMetrics: [
            {
              file: "src/index.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/app.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/index.ts", hasIssues: false },
            { path: "src/app.ts", hasIssues: false },
          ],
        },
        {
          package: { name: "clean-project", path: "" },
          lens: { id: "jest", command: "test" },
          execution: {
            success: true,
            exitCode: 0,
            duration: 5000,
            timestamp: Date.now(),
          },
          issues: [],
          metrics: {
            filesAnalyzed: 25,
            totalIssues: 0,
            issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
            executionTime: 5000,
            custom: {
              totalTests: 120,
              passedTests: 120,
              failedTests: 0,
              passRate: 100,
            },
          },
          coverage: {
            line: 95,
            branch: 90,
            function: 98,
            files: [
              {
                file: "src/index.ts",
                lines: 100,
                branches: 95,
                functions: 100,
              },
              { file: "src/app.ts", lines: 96, branches: 90, functions: 98 },
              {
                file: "src/utils/helpers.ts",
                lines: 92,
                branches: 85,
                functions: 95,
              },
              {
                file: "src/services/api.ts",
                lines: 90,
                branches: 82,
                functions: 94,
              },
            ],
          },
          fileMetrics: [
            {
              file: "src/index.ts",
              score: 100,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/app.ts",
              score: 96,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
            {
              file: "src/utils/helpers.ts",
              score: 92,
              issueCount: 0,
              errorCount: 0,
              warningCount: 0,
            },
          ],
          analyzedFiles: [
            { path: "src/index.ts", hasIssues: false },
            { path: "src/app.ts", hasIssues: false },
            { path: "src/utils/helpers.ts", hasIssues: false },
          ],
        },
      ],
    };

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set("lensResults", {
      scope: "repository",
      name: "lensResults",
      data: cleanData,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          currentScope: {
            type: "repository",
            workspace: {
              name: "example",
              path: "/Users/developer/example",
            },
            repository: {
              name: "clean-project",
              path: "/Users/developer/example/clean-project",
            },
          },
        }}
      >
        {(props) => <LensDataDebugPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "All lenses passing with no issues - a clean codebase.",
      },
    },
  },
};

/**
 * Component wrapper for WithEventIntegration story (to satisfy hooks rules)
 */
const WithEventIntegrationDemo: React.FC = () => {
  // Create a mock emitter with a trigger helper for the story controls
  const [emitterWithTrigger] = React.useState(() => {
    const baseEmitter = createMockEvents();
    return {
      ...baseEmitter,
      triggerSelect: (packagePath: string, packageName: string) => {
        baseEmitter.emit({
          type: "package:select",
          source: "story-control",
          payload: { packagePath, packageName },
          timestamp: Date.now(),
        });
      },
    };
  });

  const polyglotData: FormattedResults = {
    metadata: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      totalPackages: 4,
      totalLenses: 8,
      git: {
        commit: "abc123",
        branch: "main",
        repository: "acme/polyglot-monorepo",
      },
    },
    results: [
      {
        package: { name: "@acme/web-app", path: "apps/web" },
        lens: { id: "typescript", command: "tsc" },
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
        package: { name: "@acme/web-app", path: "apps/web" },
        lens: { id: "eslint", command: "eslint" },
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
        package: { name: "@acme/rust-cli", path: "tools/cli" },
        lens: { id: "clippy", command: "cargo clippy" },
        execution: {
          success: true,
          exitCode: 0,
          duration: 2000,
          timestamp: Date.now(),
        },
        issues: [],
        metrics: {
          filesAnalyzed: 15,
          totalIssues: 0,
          issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
          executionTime: 2000,
        },
      },
      {
        package: { name: "@acme/rust-cli", path: "tools/cli" },
        lens: { id: "rustfmt", command: "cargo fmt" },
        execution: {
          success: true,
          exitCode: 0,
          duration: 300,
          timestamp: Date.now(),
        },
        issues: [],
        metrics: {
          filesAnalyzed: 15,
          totalIssues: 0,
          issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
          executionTime: 300,
        },
      },
      {
        package: { name: "@acme/python-api", path: "services/api" },
        lens: { id: "ruff", command: "ruff check" },
        execution: {
          success: true,
          exitCode: 0,
          duration: 500,
          timestamp: Date.now(),
        },
        issues: [],
        metrics: {
          filesAnalyzed: 20,
          totalIssues: 0,
          issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
          executionTime: 500,
        },
      },
      {
        package: { name: "@acme/python-api", path: "services/api" },
        lens: { id: "mypy", command: "mypy" },
        execution: {
          success: true,
          exitCode: 0,
          duration: 1500,
          timestamp: Date.now(),
        },
        issues: [],
        metrics: {
          filesAnalyzed: 20,
          totalIssues: 0,
          issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
          executionTime: 1500,
        },
      },
      {
        package: { name: "@acme/bun-server", path: "services/edge" },
        lens: { id: "biome", command: "biome check" },
        execution: {
          success: true,
          exitCode: 0,
          duration: 400,
          timestamp: Date.now(),
        },
        issues: [],
        metrics: {
          filesAnalyzed: 18,
          totalIssues: 0,
          issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
          executionTime: 400,
        },
      },
      {
        package: { name: "@acme/bun-server", path: "services/edge" },
        lens: { id: "bun-test", command: "bun test" },
        execution: {
          success: true,
          exitCode: 0,
          duration: 2000,
          timestamp: Date.now(),
        },
        issues: [],
        metrics: {
          filesAnalyzed: 18,
          totalIssues: 0,
          issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 },
          executionTime: 2000,
        },
      },
    ],
  };

  const mockSlices = new Map<string, DataSlice>();
  mockSlices.set("lensResults", {
    scope: "repository",
    name: "lensResults",
    data: polyglotData,
    loading: false,
    error: null,
    refresh: async () => {},
  });

  const packages = [
    { name: "@acme/web-app", path: "apps/web" },
    { name: "@acme/rust-cli", path: "tools/cli" },
    { name: "@acme/python-api", path: "services/api" },
    { name: "@acme/bun-server", path: "services/edge" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Control Bar - simulates file-city-panels selection */}
      <div
        style={{
          padding: 12,
          backgroundColor: "#1e1e2e",
          borderBottom: "1px solid #313244",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <span style={{ color: "#a6adc8", fontSize: 12, marginRight: 8 }}>
          Simulate package:select event:
        </span>
        {packages.map((pkg) => (
          <button
            key={pkg.name}
            onClick={() => emitterWithTrigger.triggerSelect(pkg.path, pkg.name)}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #45475a",
              backgroundColor: "#313244",
              color: "#cdd6f4",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {pkg.name}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <MockPanelProvider
          contextOverrides={{
            slices: mockSlices,
            currentScope: {
              type: "repository",
              workspace: { name: "acme", path: "/Users/developer/acme" },
              repository: {
                name: "polyglot-monorepo",
                path: "/Users/developer/acme/monorepo",
              },
            },
          }}
          eventsOverride={emitterWithTrigger}
        >
          {(props) => <LensDataDebugPanel {...props} />}
        </MockPanelProvider>
      </div>
    </div>
  );
};

/**
 * With Event Integration - demonstrates package:select event handling
 */
export const WithEventIntegration: Story = {
  render: () => <WithEventIntegrationDemo />,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Demonstrates event integration with file-city-panels. Click the buttons above to simulate `package:select` events - the panel will automatically switch to the selected package.",
      },
    },
  },
};

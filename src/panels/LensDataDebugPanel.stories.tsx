import type { Meta, StoryObj } from '@storybook/react-vite';
import { LensDataDebugPanel } from './LensDataDebugPanel';
import {
  MockPanelProvider,
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { DataSlice } from '../types';
import type { FormattedResults } from '../components/LensDataDebugPanel';

// Import real test data
import testData from '../../test-data-results.json';

/**
 * LensDataDebugPanel displays raw lens results data for debugging and verification.
 * Shows package breakdown, lens results with pass/fail status, and files with issues.
 */
const meta = {
  title: 'Panels/LensDataDebugPanel',
  component: LensDataDebugPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A debug panel for inspecting raw lens results from quality-lens-cli. Useful for verifying data collection and troubleshooting issues.',
      },
    },
  },
  tags: ['autodocs'],
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
    mockSlices.set('lensResults', {
      scope: 'repository',
      name: 'lensResults',
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
            type: 'repository',
            workspace: {
              name: 'code-quality',
              path: '/Users/developer/code-quality',
            },
            repository: {
              name: 'codebase-quality-lens-cli',
              path: '/Users/developer/codebase-quality-lens-cli',
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
        story: 'Real data from the codebase-quality-lens-cli GitHub Actions artifact.',
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
        version: '1.0.0',
        totalPackages: 3,
        totalLenses: 9,
        git: {
          commit: 'abc1234def5678',
          branch: 'main',
          repository: 'acme/monorepo',
        },
      },
      results: [
        // @acme/core - all passing
        {
          package: { name: '@acme/core', path: 'packages/core' },
          lens: { id: 'typescript', command: 'typecheck' },
          execution: { success: true, exitCode: 0, duration: 1200, timestamp: Date.now() },
          issues: [],
          metrics: { filesAnalyzed: 25, totalIssues: 0, issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 }, executionTime: 1200 },
        },
        {
          package: { name: '@acme/core', path: 'packages/core' },
          lens: { id: 'eslint', command: 'lint' },
          execution: { success: true, exitCode: 0, duration: 800, timestamp: Date.now() },
          issues: [],
          metrics: { filesAnalyzed: 25, totalIssues: 0, issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 }, executionTime: 800 },
        },
        {
          package: { name: '@acme/core', path: 'packages/core' },
          lens: { id: 'jest', command: 'test' },
          execution: { success: true, exitCode: 0, duration: 3500, timestamp: Date.now() },
          issues: [],
          metrics: { filesAnalyzed: 15, totalIssues: 0, issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 }, executionTime: 3500 },
          coverage: { line: 92, branch: 85, function: 95 },
        },
        // @acme/web - has issues
        {
          package: { name: '@acme/web', path: 'apps/web' },
          lens: { id: 'typescript', command: 'typecheck' },
          execution: { success: false, exitCode: 1, duration: 2000, timestamp: Date.now() },
          issues: [
            { file: 'src/pages/Home.tsx', line: 15, severity: 'error', message: "Property 'data' is missing in type", rule: 'TS2741', source: 'typescript' },
            { file: 'src/pages/Home.tsx', line: 28, severity: 'error', message: "Type 'undefined' is not assignable to type 'string'", rule: 'TS2322', source: 'typescript' },
          ],
          metrics: { filesAnalyzed: 45, totalIssues: 2, issuesBySeverity: { error: 2, warning: 0, info: 0, hint: 0 }, executionTime: 2000 },
        },
        {
          package: { name: '@acme/web', path: 'apps/web' },
          lens: { id: 'eslint', command: 'lint' },
          execution: { success: false, exitCode: 1, duration: 1500, timestamp: Date.now() },
          issues: [
            { file: 'src/utils/helpers.ts', line: 5, severity: 'warning', message: "Unexpected any. Specify a different type.", rule: '@typescript-eslint/no-explicit-any', source: 'eslint' },
            { file: 'src/components/Button.tsx', line: 8, severity: 'error', message: "React Hook useEffect has a missing dependency", rule: 'react-hooks/exhaustive-deps', source: 'eslint' },
          ],
          metrics: { filesAnalyzed: 45, totalIssues: 2, issuesBySeverity: { error: 1, warning: 1, info: 0, hint: 0 }, executionTime: 1500 },
        },
        {
          package: { name: '@acme/web', path: 'apps/web' },
          lens: { id: 'jest', command: 'test' },
          execution: { success: true, exitCode: 0, duration: 8000, timestamp: Date.now() },
          issues: [],
          metrics: { filesAnalyzed: 20, totalIssues: 0, issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 }, executionTime: 8000 },
          coverage: { line: 68, branch: 55, function: 72 },
        },
        // @acme/cli - all passing
        {
          package: { name: '@acme/cli', path: 'packages/cli' },
          lens: { id: 'typescript', command: 'typecheck' },
          execution: { success: true, exitCode: 0, duration: 600, timestamp: Date.now() },
          issues: [],
          metrics: { filesAnalyzed: 10, totalIssues: 0, issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 }, executionTime: 600 },
        },
        {
          package: { name: '@acme/cli', path: 'packages/cli' },
          lens: { id: 'eslint', command: 'lint' },
          execution: { success: true, exitCode: 0, duration: 400, timestamp: Date.now() },
          issues: [],
          metrics: { filesAnalyzed: 10, totalIssues: 0, issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 }, executionTime: 400 },
        },
        {
          package: { name: '@acme/cli', path: 'packages/cli' },
          lens: { id: 'jest', command: 'test' },
          execution: { success: true, exitCode: 0, duration: 1200, timestamp: Date.now() },
          issues: [],
          metrics: { filesAnalyzed: 5, totalIssues: 0, issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 }, executionTime: 1200 },
          coverage: { line: 88, branch: 80, function: 90 },
        },
      ],
    };

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('lensResults', {
      scope: 'repository',
      name: 'lensResults',
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
            type: 'repository',
            workspace: {
              name: 'acme-workspace',
              path: '/Users/developer/acme',
            },
            repository: {
              name: 'acme-monorepo',
              path: '/Users/developer/acme/monorepo',
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
        story: 'Multi-package monorepo with 3 packages. @acme/core and @acme/cli are clean, @acme/web has issues.',
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
    mockSlices.set('lensResults', {
      scope: 'repository',
      name: 'lensResults',
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
        story: 'Shows the panel while lens data is loading.',
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
        story: 'Shows the empty state when no lens data is available.',
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
        version: '1.0.0',
        totalPackages: 1,
        totalLenses: 4,
        git: {
          commit: 'clean123',
          branch: 'main',
          repository: 'example/clean-project',
        },
      },
      results: [
        {
          package: { name: 'clean-project', path: '' },
          lens: { id: 'typescript', command: 'typecheck' },
          execution: { success: true, exitCode: 0, duration: 1500, timestamp: Date.now() },
          issues: [],
          metrics: { filesAnalyzed: 50, totalIssues: 0, issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 }, executionTime: 1500 },
        },
        {
          package: { name: 'clean-project', path: '' },
          lens: { id: 'eslint', command: 'lint' },
          execution: { success: true, exitCode: 0, duration: 1200, timestamp: Date.now() },
          issues: [],
          metrics: { filesAnalyzed: 50, totalIssues: 0, issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 }, executionTime: 1200 },
        },
        {
          package: { name: 'clean-project', path: '' },
          lens: { id: 'prettier', command: 'format' },
          execution: { success: true, exitCode: 0, duration: 300, timestamp: Date.now() },
          issues: [],
          metrics: { filesAnalyzed: 50, totalIssues: 0, issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 }, executionTime: 300 },
        },
        {
          package: { name: 'clean-project', path: '' },
          lens: { id: 'jest', command: 'test' },
          execution: { success: true, exitCode: 0, duration: 5000, timestamp: Date.now() },
          issues: [],
          metrics: { filesAnalyzed: 25, totalIssues: 0, issuesBySeverity: { error: 0, warning: 0, info: 0, hint: 0 }, executionTime: 5000 },
          coverage: { line: 95, branch: 90, function: 98 },
        },
      ],
    };

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('lensResults', {
      scope: 'repository',
      name: 'lensResults',
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
            type: 'repository',
            workspace: {
              name: 'example',
              path: '/Users/developer/example',
            },
            repository: {
              name: 'clean-project',
              path: '/Users/developer/example/clean-project',
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
        story: 'All lenses passing with no issues - a clean codebase.',
      },
    },
  },
};

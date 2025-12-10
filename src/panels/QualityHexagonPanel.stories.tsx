import type { Meta, StoryObj } from '@storybook/react-vite';
import { QualityHexagonPanel } from './QualityHexagonPanel';
import {
  MockPanelProvider,
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { DataSlice } from '../types';

/**
 * QualityHexagonPanel visualizes code quality metrics using a hexagonal radar chart.
 * Shows quality tier, detailed metrics breakdown, and quick stats.
 */
const meta = {
  title: 'Panels/QualityHexagonPanel',
  component: QualityHexagonPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A panel for visualizing code quality metrics using a hexagonal radar chart. Shows quality tier (none, bronze, silver, gold, platinum), detailed metrics breakdown, and quick stats.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    context: createMockContext(),
    actions: createMockActions(),
    events: createMockEvents(),
  },
} satisfies Meta<typeof QualityHexagonPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state with good quality metrics
 */
export const Default: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => <QualityHexagonPanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * Platinum quality metrics - excellent codebase
 */
export const PlatinumQuality: Story = {
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('quality', {
      scope: 'repository',
      name: 'quality',
      data: {
        packages: [
          {
            name: '@acme/platinum-project',
            version: '2.0.0',
            metrics: {
              tests: 95,
              deadCode: 3,
              linting: 98,
              formatting: 100,
              types: 96,
              documentation: 92,
            },
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
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
              name: 'my-workspace',
              path: '/Users/developer/my-workspace',
            },
            repository: {
              name: 'platinum-project',
              path: '/Users/developer/platinum-project',
            },
          },
        }}
      >
        {(props) => <QualityHexagonPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a project with platinum-tier quality metrics.',
      },
    },
  },
};

/**
 * Poor quality metrics - legacy codebase
 */
export const PoorQuality: Story = {
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('quality', {
      scope: 'repository',
      name: 'quality',
      data: {
        packages: [
          {
            name: 'legacy-codebase',
            metrics: {
              tests: 25,
              deadCode: 45,
              linting: 40,
              formatting: 55,
              types: 20,
              documentation: 15,
            },
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
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
              name: 'my-workspace',
              path: '/Users/developer/my-workspace',
            },
            repository: {
              name: 'legacy-codebase',
              path: '/Users/developer/legacy-codebase',
            },
          },
        }}
      >
        {(props) => <QualityHexagonPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a project with poor quality metrics, typical of legacy codebases.',
      },
    },
  },
};

/**
 * Unbalanced metrics - good style but lacking tests
 */
export const UnbalancedMetrics: Story = {
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('quality', {
      scope: 'repository',
      name: 'quality',
      data: {
        packages: [
          {
            name: 'fast-mvp',
            version: '0.0.1',
            metrics: {
              tests: 30,
              deadCode: 5,
              linting: 95,
              formatting: 100,
              types: 90,
              documentation: 20,
            },
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
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
              name: 'my-workspace',
              path: '/Users/developer/my-workspace',
            },
            repository: {
              name: 'fast-mvp',
              path: '/Users/developer/fast-mvp',
            },
          },
        }}
      >
        {(props) => <QualityHexagonPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a project with unbalanced metrics - good code style but lacking tests and documentation.',
      },
    },
  },
};

/**
 * Monorepo with multiple packages
 */
export const Monorepo: Story = {
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('quality', {
      scope: 'repository',
      name: 'quality',
      data: {
        packages: [
          {
            name: '@acme/core',
            version: '1.2.0',
            metrics: {
              tests: 92,
              deadCode: 5,
              linting: 95,
              formatting: 100,
              types: 98,
              documentation: 85,
            },
          },
          {
            name: '@acme/ui',
            version: '1.0.0',
            metrics: {
              tests: 78,
              deadCode: 12,
              linting: 88,
              formatting: 95,
              types: 90,
              documentation: 60,
            },
          },
          {
            name: '@acme/utils',
            version: '0.5.0',
            metrics: {
              tests: 45,
              deadCode: 25,
              linting: 70,
              formatting: 85,
              types: 65,
              documentation: 30,
            },
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
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
              path: '/Users/developer/acme-workspace',
            },
            repository: {
              name: 'acme-monorepo',
              path: '/Users/developer/acme-monorepo',
            },
          },
        }}
      >
        {(props) => <QualityHexagonPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a monorepo with multiple packages, each with their own quality metrics.',
      },
    },
  },
};

/**
 * No repository loaded
 */
export const NoRepository: Story = {
  render: () => (
    <MockPanelProvider
      contextOverrides={{
        currentScope: {
          type: 'workspace',
          workspace: {
            name: 'my-workspace',
            path: '/Users/developer/my-workspace',
          },
        },
      }}
    >
      {(props) => <QualityHexagonPanel {...props} />}
    </MockPanelProvider>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows the panel when no repository is loaded.',
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
    mockSlices.set('quality', {
      scope: 'repository',
      name: 'quality',
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
        {(props) => <QualityHexagonPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the panel while quality data is loading.',
      },
    },
  },
};

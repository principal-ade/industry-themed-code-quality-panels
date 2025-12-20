import type { Meta, StoryObj } from '@storybook/react';
import { QualityMetricsList, QualityMetricsListCompact } from './QualityMetricsList';
import { slateTheme } from '@principal-ade/industry-theme';
import type { QualityMetrics } from '@principal-ai/codebase-composition';

const meta = {
  title: 'Components/QualityMetricsList',
  component: QualityMetricsList,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a2e' },
        { name: 'light', value: '#f5f5f5' },
      ],
    },
    docs: {
      description: {
        component: 'A list view of quality metrics with icons, progress bars, and optional click handlers. Each metric is displayed as a row with its value and visual indicator.'
      }
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof QualityMetricsList>;

export default meta;
type Story = StoryObj<typeof meta>;

// From GitHub Actions artifact - real data from codebase-quality-lens-cli
const realWorldMetrics: QualityMetrics = {
  tests: 100,
  deadCode: 2.5,
  formatting: 74.19,
  linting: 44,
  types: 100,
  documentation: 0,
};

const excellentMetrics: QualityMetrics = {
  documentation: 95,
  tests: 92,
  deadCode: 5,
  formatting: 100,
  linting: 98,
  types: 96
};

const goodMetrics: QualityMetrics = {
  documentation: 75,
  tests: 80,
  deadCode: 15,
  formatting: 90,
  linting: 85,
  types: 88
};

const poorMetrics: QualityMetrics = {
  documentation: 30,
  tests: 25,
  deadCode: 60,
  formatting: 40,
  linting: 35,
  types: 20
};

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 400 }}>
      <QualityMetricsList {...args} />
    </div>
  ),
  args: {
    metrics: goodMetrics,
    theme: slateTheme,
  }
};

export const RealWorldData: Story = {
  render: (args) => (
    <div style={{ width: 400 }}>
      <QualityMetricsList {...args} />
    </div>
  ),
  args: {
    metrics: realWorldMetrics,
    theme: slateTheme,
  },
  parameters: {
    docs: {
      description: {
        story: 'Real metrics from the codebase-quality-lens-cli GitHub Actions artifact. Note the mixed quality: excellent tests and types, but poor linting and no documentation.'
      }
    }
  }
};

export const Interactive: Story = {
  render: (args) => (
    <div style={{ width: 400 }}>
      <QualityMetricsList {...args} />
    </div>
  ),
  args: {
    metrics: realWorldMetrics,
    theme: slateTheme,
    onMetricClick: (metric) => alert(`Clicked: ${metric}`),
  },
  parameters: {
    docs: {
      description: {
        story: 'With click handler - rows become interactive with hover states and chevron indicators.'
      }
    }
  }
};

export const Excellent: Story = {
  render: (args) => (
    <div style={{ width: 400 }}>
      <QualityMetricsList {...args} />
    </div>
  ),
  args: {
    metrics: excellentMetrics,
    theme: slateTheme,
  },
  parameters: {
    docs: {
      description: {
        story: 'All metrics in the green zone - a well-maintained codebase.'
      }
    }
  }
};

export const Poor: Story = {
  render: (args) => (
    <div style={{ width: 400 }}>
      <QualityMetricsList {...args} />
    </div>
  ),
  args: {
    metrics: poorMetrics,
    theme: slateTheme,
  },
  parameters: {
    docs: {
      description: {
        story: 'Most metrics in the red zone - needs significant improvement.'
      }
    }
  }
};

export const Compact: Story = {
  render: (args) => (
    <div style={{ width: 250 }}>
      <QualityMetricsListCompact {...args} />
    </div>
  ),
  args: {
    metrics: realWorldMetrics,
    theme: slateTheme,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact version without icons or progress bars - suitable for sidebars or constrained spaces.'
      }
    }
  }
};

export const CompactInteractive: Story = {
  render: (args) => (
    <div style={{ width: 250 }}>
      <QualityMetricsListCompact {...args} />
    </div>
  ),
  args: {
    metrics: realWorldMetrics,
    theme: slateTheme,
    onMetricClick: (metric) => alert(`Clicked: ${metric}`),
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact version with click handlers for drill-down navigation.'
      }
    }
  }
};

export const SideBySide: Story = {
  args: {
    metrics: goodMetrics,
    theme: slateTheme,
  },
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <div>
        <h3 style={{ color: '#e5e7eb', marginBottom: 12, fontSize: 14 }}>Full List</h3>
        <div style={{ width: 380 }}>
          <QualityMetricsList metrics={realWorldMetrics} theme={slateTheme} />
        </div>
      </div>
      <div>
        <h3 style={{ color: '#e5e7eb', marginBottom: 12, fontSize: 14 }}>Compact List</h3>
        <div style={{ width: 200, padding: 12, backgroundColor: slateTheme.colors.surface, borderRadius: 8 }}>
          <QualityMetricsListCompact metrics={realWorldMetrics} theme={slateTheme} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of full and compact list variants using the same data.'
      }
    }
  }
};

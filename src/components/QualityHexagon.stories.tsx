import type { Meta, StoryObj } from "@storybook/react";
import {
  QualityHexagon,
  QualityHexagonCompact,
  QualityHexagonDetailed,
  QualityHexagonExpandable,
  QualityMetrics,
} from "./QualityHexagon";
import { slateTheme } from "@principal-ade/industry-theme";

const meta = {
  title: "Components/QualityHexagon",
  component: QualityHexagon,
  parameters: {
    layout: "centered",
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
          'A hexagonal radar chart visualization for code quality metrics. Each vertex represents a different quality dimension, creating a unique "fingerprint" for code quality.',
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    tier: {
      control: "select",
      options: ["none", "bronze", "silver", "gold", "platinum"],
      description: "Quality tier based on overall metrics",
    },
    showLabels: {
      control: "boolean",
      description: "Show metric labels around the hexagon",
    },
    showValues: {
      control: "boolean",
      description: "Show percentage values instead of labels",
    },
  },
} satisfies Meta<typeof QualityHexagon>;

export default meta;
type Story = StoryObj<typeof meta>;

const excellentMetrics: QualityMetrics = {
  documentation: 95,
  tests: 92,
  deadCode: 5,
  formatting: 100,
  linting: 98,
  types: 96,
};

const goodMetrics: QualityMetrics = {
  documentation: 75,
  tests: 80,
  deadCode: 15,
  formatting: 90,
  linting: 85,
  types: 88,
};

const averageMetrics: QualityMetrics = {
  documentation: 60,
  tests: 65,
  deadCode: 30,
  formatting: 75,
  linting: 70,
  types: 72,
};

const poorMetrics: QualityMetrics = {
  documentation: 30,
  tests: 25,
  deadCode: 60,
  formatting: 40,
  linting: 35,
  types: 20,
};

const unbalancedMetrics: QualityMetrics = {
  documentation: 95,
  tests: 30,
  deadCode: 5,
  formatting: 100,
  linting: 100,
  types: 95,
};

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 200, height: 200 }}>
      <QualityHexagon {...args} />
    </div>
  ),
  args: {
    metrics: goodMetrics,
    tier: "silver",
    theme: slateTheme,
    showLabels: false,
    showValues: false,
  },
};

export const Platinum: Story = {
  render: (args) => (
    <div style={{ width: 240, height: 240 }}>
      <QualityHexagon {...args} />
    </div>
  ),
  args: {
    metrics: excellentMetrics,
    tier: "platinum",
    theme: slateTheme,
    showLabels: true,
  },
};

export const Gold: Story = {
  render: (args) => (
    <div style={{ width: 240, height: 240 }}>
      <QualityHexagon {...args} />
    </div>
  ),
  args: {
    metrics: goodMetrics,
    tier: "gold",
    theme: slateTheme,
    showLabels: true,
  },
};

export const Silver: Story = {
  render: (args) => (
    <div style={{ width: 240, height: 240 }}>
      <QualityHexagon {...args} />
    </div>
  ),
  args: {
    metrics: averageMetrics,
    tier: "silver",
    theme: slateTheme,
    showLabels: true,
  },
};

export const Bronze: Story = {
  render: (args) => (
    <div style={{ width: 240, height: 240 }}>
      <QualityHexagon {...args} />
    </div>
  ),
  args: {
    metrics: poorMetrics,
    tier: "bronze",
    theme: slateTheme,
    showLabels: true,
  },
};

export const Unbalanced: Story = {
  render: (args) => (
    <div style={{ width: 240, height: 240 }}>
      <QualityHexagon {...args} />
    </div>
  ),
  args: {
    metrics: unbalancedMetrics,
    tier: "gold",
    theme: slateTheme,
    showLabels: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows a codebase with excellent documentation and code style, but poor test coverage.",
      },
    },
  },
};

export const WithValues: Story = {
  render: (args) => (
    <div style={{ width: 240, height: 240 }}>
      <QualityHexagon {...args} />
    </div>
  ),
  args: {
    metrics: goodMetrics,
    tier: "gold",
    theme: slateTheme,
    showLabels: true,
    showValues: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Displays percentage values instead of metric labels.",
      },
    },
  },
};

export const Sizes: Story = {
  args: {
    metrics: goodMetrics,
    tier: "gold",
    theme: slateTheme,
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 96, height: 96 }}>
          <QualityHexagon
            metrics={goodMetrics}
            tier="gold"
            theme={slateTheme}
          />
        </div>
        <p style={{ marginTop: 8, fontSize: 14, color: "#9ca3af" }}>Small</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 128, height: 128 }}>
          <QualityHexagon
            metrics={goodMetrics}
            tier="gold"
            theme={slateTheme}
          />
        </div>
        <p style={{ marginTop: 8, fontSize: 14, color: "#9ca3af" }}>Medium</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 192, height: 192 }}>
          <QualityHexagon
            metrics={goodMetrics}
            tier="gold"
            theme={slateTheme}
          />
        </div>
        <p style={{ marginTop: 8, fontSize: 14, color: "#9ca3af" }}>Large</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 256, height: 256 }}>
          <QualityHexagon
            metrics={goodMetrics}
            tier="gold"
            theme={slateTheme}
          />
        </div>
        <p style={{ marginTop: 8, fontSize: 14, color: "#9ca3af" }}>
          Extra Large
        </p>
      </div>
    </div>
  ),
};

export const Compact: Story = {
  args: {
    metrics: goodMetrics,
    tier: "gold",
    theme: slateTheme,
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <QualityHexagonCompact
        metrics={excellentMetrics}
        tier="platinum"
        theme={slateTheme}
      />
      <QualityHexagonCompact
        metrics={goodMetrics}
        tier="gold"
        theme={slateTheme}
      />
      <QualityHexagonCompact
        metrics={averageMetrics}
        tier="silver"
        theme={slateTheme}
      />
      <QualityHexagonCompact
        metrics={poorMetrics}
        tier="bronze"
        theme={slateTheme}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Compact version ideal for inline display in lists or tables.",
      },
    },
  },
};

export const Detailed: Story = {
  args: {
    metrics: goodMetrics,
    tier: "gold",
    theme: slateTheme,
  },
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 16, width: 600 }}
    >
      <QualityHexagonDetailed
        metrics={excellentMetrics}
        tier="platinum"
        theme={slateTheme}
      />
      <QualityHexagonDetailed
        metrics={unbalancedMetrics}
        tier="gold"
        theme={slateTheme}
      />
    </div>
  ),
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story:
          "Detailed view with full metrics breakdown, ideal for dashboards and reports.",
      },
    },
  },
};

export const ProgressComparison: Story = {
  args: {
    metrics: goodMetrics,
    tier: "gold",
    theme: slateTheme,
  },
  render: () => (
    <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 160, height: 160 }}>
          <QualityHexagon
            metrics={poorMetrics}
            tier="bronze"
            theme={slateTheme}
            showLabels={true}
          />
        </div>
        <p
          style={{
            marginTop: 16,
            fontSize: 14,
            fontWeight: 600,
            color: "#e5e7eb",
          }}
        >
          Before Refactoring
        </p>
        <p style={{ fontSize: 12, color: "#9ca3af" }}>Q1 2024</p>
      </div>

      <div style={{ fontSize: 32, color: "#9ca3af" }}>→</div>

      <div style={{ textAlign: "center" }}>
        <div style={{ width: 160, height: 160 }}>
          <QualityHexagon
            metrics={goodMetrics}
            tier="gold"
            theme={slateTheme}
            showLabels={true}
          />
        </div>
        <p
          style={{
            marginTop: 16,
            fontSize: 14,
            fontWeight: 600,
            color: "#e5e7eb",
          }}
        >
          After Refactoring
        </p>
        <p style={{ fontSize: 12, color: "#9ca3af" }}>Q2 2024</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Shows improvement in code quality metrics over time.",
      },
    },
  },
};

export const TeamComparison: Story = {
  args: {
    metrics: goodMetrics,
    tier: "gold",
    theme: slateTheme,
  },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 144, height: 144, margin: "0 auto" }}>
          <QualityHexagon
            metrics={excellentMetrics}
            tier="platinum"
            theme={slateTheme}
          />
        </div>
        <p style={{ marginTop: 8, fontWeight: 600, color: "#e5e7eb" }}>
          Backend Team
        </p>
        <p style={{ fontSize: 12, color: "#9ca3af" }}>API Services</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 144, height: 144, margin: "0 auto" }}>
          <QualityHexagon
            metrics={goodMetrics}
            tier="gold"
            theme={slateTheme}
          />
        </div>
        <p style={{ marginTop: 8, fontWeight: 600, color: "#e5e7eb" }}>
          Frontend Team
        </p>
        <p style={{ fontSize: 12, color: "#9ca3af" }}>Web Application</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 144, height: 144, margin: "0 auto" }}>
          <QualityHexagon
            metrics={averageMetrics}
            tier="silver"
            theme={slateTheme}
          />
        </div>
        <p style={{ marginTop: 8, fontWeight: 600, color: "#e5e7eb" }}>
          Mobile Team
        </p>
        <p style={{ fontSize: 12, color: "#9ca3af" }}>iOS/Android Apps</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Compare code quality across different teams or projects.",
      },
    },
  },
};

export const AllTiers: Story = {
  args: {
    metrics: goodMetrics,
    tier: "gold",
    theme: slateTheme,
  },
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {(["none", "bronze", "silver", "gold", "platinum"] as const).map(
        (tier) => (
          <div key={tier} style={{ textAlign: "center" }}>
            <div style={{ width: 120, height: 120 }}>
              <QualityHexagon
                metrics={
                  tier === "platinum"
                    ? excellentMetrics
                    : tier === "gold"
                      ? goodMetrics
                      : tier === "silver"
                        ? averageMetrics
                        : tier === "bronze"
                          ? poorMetrics
                          : {
                              tests: 10,
                              deadCode: 80,
                              linting: 15,
                              formatting: 20,
                              types: 5,
                              documentation: 10,
                            }
                }
                tier={tier}
                theme={slateTheme}
              />
            </div>
            <p
              style={{
                marginTop: 8,
                fontSize: 12,
                fontWeight: 600,
                color: "#e5e7eb",
                textTransform: "capitalize",
              }}
            >
              {tier}
            </p>
          </div>
        ),
      )}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Overview of all quality tiers from none to platinum.",
      },
    },
  },
};

export const Expandable: Story = {
  args: {
    metrics: goodMetrics,
    tier: "gold",
    theme: slateTheme,
  },
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 16, width: 300 }}
    >
      <QualityHexagonExpandable
        metrics={excellentMetrics}
        tier="platinum"
        theme={slateTheme}
        packageName="@principal-ade/core"
        packageVersion="1.2.3"
      />
      <QualityHexagonExpandable
        metrics={goodMetrics}
        tier="gold"
        theme={slateTheme}
        defaultExpanded={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Click the hexagon to expand/collapse the metrics breakdown below.",
      },
    },
  },
};

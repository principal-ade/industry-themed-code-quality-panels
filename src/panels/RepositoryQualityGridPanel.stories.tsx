import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "@principal-ade/industry-theme";
import { RepositoryQualityGridPanel } from "./RepositoryQualityGridPanel";
import { createMockPanelProps } from "../mocks/panelContext";

const meta = {
  title: "Panels/RepositoryQualityGridPanel",
  component: RepositoryQualityGridPanel,
  parameters: {
    layout: "fullscreen",
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
          "A panel that displays quality metrics for multiple repositories in a flat grid layout. Includes metric filtering dropdown, sorting by value, and click interactions.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RepositoryQualityGridPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ...createMockPanelProps(),
  },
  render: (args) => (
    <ThemeProvider>
      <div style={{ height: "100vh", width: "100%" }}>
        <RepositoryQualityGridPanel {...args} />
      </div>
    </ThemeProvider>
  ),
};

export const InContainer: Story = {
  args: {
    ...createMockPanelProps(),
  },
  render: (args) => (
    <ThemeProvider>
      <div style={{ height: 600, width: 800, border: "1px solid #333" }}>
        <RepositoryQualityGridPanel {...args} />
      </div>
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Panel rendered in a fixed-size container, simulating a panel slot in the application.",
      },
    },
  },
};

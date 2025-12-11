import type { Meta, StoryObj } from '@storybook/react';
import { RepositoryQualityGrid, RepositoryQualityItem } from './RepositoryQualityGrid';
import { slateTheme } from '@principal-ade/industry-theme';

const meta = {
  title: 'Components/RepositoryQualityGrid',
  component: RepositoryQualityGrid,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a2e' },
        { name: 'light', value: '#f5f5f5' },
      ],
    },
    docs: {
      description: {
        component: 'A flat grid layout for displaying quality hexagons across multiple repositories and packages. Ideal for organization-wide or project group quality overviews.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showRepositoryName: {
      control: 'boolean',
      description: 'Show repository name in item labels',
    },
    showSummary: {
      control: 'boolean',
      description: 'Show summary header with counts and overall tier',
    },
  },
} satisfies Meta<typeof RepositoryQualityGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for stories
const singlePackageRepos: RepositoryQualityItem[] = [
  {
    id: 'repo-1',
    name: 'api-gateway',
    packages: [
      {
        name: 'api-gateway',
        version: '2.1.0',
        metrics: { tests: 92, deadCode: 5, linting: 98, formatting: 100, types: 96, documentation: 85 },
      },
    ],
  },
  {
    id: 'repo-2',
    name: 'auth-service',
    packages: [
      {
        name: 'auth-service',
        version: '1.4.2',
        metrics: { tests: 88, deadCode: 8, linting: 95, formatting: 98, types: 90, documentation: 78 },
      },
    ],
  },
  {
    id: 'repo-3',
    name: 'user-service',
    packages: [
      {
        name: 'user-service',
        version: '3.0.1',
        metrics: { tests: 75, deadCode: 12, linting: 88, formatting: 95, types: 85, documentation: 70 },
      },
    ],
  },
  {
    id: 'repo-4',
    name: 'notification-service',
    packages: [
      {
        name: 'notification-service',
        version: '1.0.5',
        metrics: { tests: 65, deadCode: 20, linting: 82, formatting: 90, types: 78, documentation: 55 },
      },
    ],
  },
];

const monorepoWithPackages: RepositoryQualityItem[] = [
  {
    id: 'acme-platform',
    name: 'acme-platform',
    packages: [
      {
        name: '@acme/core',
        version: '4.2.0',
        metrics: { tests: 95, deadCode: 3, linting: 99, formatting: 100, types: 98, documentation: 92 },
      },
      {
        name: '@acme/ui',
        version: '4.2.0',
        metrics: { tests: 82, deadCode: 10, linting: 94, formatting: 98, types: 88, documentation: 75 },
      },
      {
        name: '@acme/utils',
        version: '4.2.0',
        metrics: { tests: 90, deadCode: 5, linting: 96, formatting: 100, types: 95, documentation: 88 },
      },
      {
        name: '@acme/api-client',
        version: '4.2.0',
        metrics: { tests: 78, deadCode: 8, linting: 92, formatting: 95, types: 90, documentation: 70 },
      },
    ],
  },
];

const mixedRepositories: RepositoryQualityItem[] = [
  {
    id: 'platform',
    name: 'platform',
    packages: [
      {
        name: '@org/core',
        version: '2.0.0',
        metrics: { tests: 94, deadCode: 4, linting: 98, formatting: 100, types: 97, documentation: 90 },
      },
      {
        name: '@org/ui-components',
        version: '2.0.0',
        metrics: { tests: 85, deadCode: 8, linting: 95, formatting: 98, types: 92, documentation: 80 },
      },
      {
        name: '@org/hooks',
        version: '2.0.0',
        metrics: { tests: 88, deadCode: 6, linting: 96, formatting: 100, types: 94, documentation: 85 },
      },
    ],
  },
  {
    id: 'backend',
    name: 'backend-services',
    packages: [
      {
        name: 'backend-services',
        version: '1.5.0',
        metrics: { tests: 80, deadCode: 15, linting: 90, formatting: 95, types: 85, documentation: 72 },
      },
    ],
  },
  {
    id: 'docs',
    name: 'documentation-site',
    packages: [
      {
        name: 'documentation-site',
        version: '1.0.0',
        metrics: { tests: 45, deadCode: 25, linting: 75, formatting: 85, types: 60, documentation: 95 },
      },
    ],
  },
];

const largeOrganization: RepositoryQualityItem[] = [
  ...singlePackageRepos,
  ...monorepoWithPackages,
  {
    id: 'mobile-app',
    name: 'mobile-app',
    packages: [
      {
        name: '@mobile/ios',
        version: '5.0.0',
        metrics: { tests: 72, deadCode: 18, linting: 85, formatting: 92, types: 80, documentation: 65 },
      },
      {
        name: '@mobile/android',
        version: '5.0.0',
        metrics: { tests: 68, deadCode: 22, linting: 82, formatting: 90, types: 75, documentation: 60 },
      },
    ],
  },
  {
    id: 'analytics',
    name: 'analytics-dashboard',
    packages: [
      {
        name: 'analytics-dashboard',
        version: '2.3.0',
        metrics: { tests: 55, deadCode: 30, linting: 78, formatting: 88, types: 70, documentation: 50 },
      },
    ],
  },
];

export const Default: Story = {
  args: {
    repositories: singlePackageRepos,
    theme: slateTheme,
    showRepositoryName: true,
    showSummary: true,
  },
};

export const MonorepoPackages: Story = {
  args: {
    repositories: monorepoWithPackages,
    theme: slateTheme,
    showRepositoryName: false, // Not needed since all packages are from same repo
    showSummary: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Displaying multiple packages from a single monorepo. Repository name is hidden since all packages are from the same source.',
      },
    },
  },
};

export const MixedRepositories: Story = {
  args: {
    repositories: mixedRepositories,
    theme: slateTheme,
    showRepositoryName: true,
    showSummary: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'A mix of monorepos and single-package repositories, showing how the grid handles diverse project structures.',
      },
    },
  },
};

export const LargeOrganization: Story = {
  args: {
    repositories: largeOrganization,
    theme: slateTheme,
    showRepositoryName: true,
    showSummary: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'A larger organization view with many repositories and packages. The grid wraps naturally to accommodate any number of items.',
      },
    },
  },
};

export const WithoutSummary: Story = {
  args: {
    repositories: singlePackageRepos,
    theme: slateTheme,
    showRepositoryName: true,
    showSummary: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Grid without the summary header, useful when embedding in a panel that already has its own header.',
      },
    },
  },
};

export const WithClickHandler: Story = {
  args: {
    repositories: mixedRepositories,
    theme: slateTheme,
    showRepositoryName: true,
    showSummary: true,
    onItemClick: (item) => {
      alert(`Clicked card: ${item.repositoryName} / ${item.packageName}\nTier: ${item.tier}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive grid where clicking an item triggers a callback. Items have hover effects to indicate interactivity.',
      },
    },
  },
};

export const WithVertexClickHandler: Story = {
  args: {
    repositories: mixedRepositories,
    theme: slateTheme,
    showRepositoryName: true,
    showSummary: true,
    onVertexClick: (item, vertex) => {
      alert(`Clicked vertex: ${vertex.label}\nValue: ${vertex.value}%\nPackage: ${item.packageName}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Click on any corner of the hexagon to trigger a callback with the metric details.',
      },
    },
  },
};

export const SingleRepository: Story = {
  args: {
    repositories: [singlePackageRepos[0]],
    theme: slateTheme,
    showRepositoryName: false,
    showSummary: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Single repository view - the grid gracefully handles just one item.',
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    repositories: [],
    theme: slateTheme,
    showRepositoryName: true,
    showSummary: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no repositories are provided.',
      },
    },
  },
};

export const VariedQualityTiers: Story = {
  args: {
    repositories: [
      {
        id: 'platinum-repo',
        name: 'platinum-quality',
        packages: [
          {
            name: 'platinum-quality',
            metrics: { tests: 95, deadCode: 2, linting: 99, formatting: 100, types: 98, documentation: 95 },
          },
        ],
      },
      {
        id: 'gold-repo',
        name: 'gold-quality',
        packages: [
          {
            name: 'gold-quality',
            metrics: { tests: 82, deadCode: 12, linting: 90, formatting: 95, types: 88, documentation: 80 },
          },
        ],
      },
      {
        id: 'silver-repo',
        name: 'silver-quality',
        packages: [
          {
            name: 'silver-quality',
            metrics: { tests: 68, deadCode: 25, linting: 78, formatting: 85, types: 72, documentation: 65 },
          },
        ],
      },
      {
        id: 'bronze-repo',
        name: 'bronze-quality',
        packages: [
          {
            name: 'bronze-quality',
            metrics: { tests: 45, deadCode: 40, linting: 60, formatting: 70, types: 50, documentation: 40 },
          },
        ],
      },
      {
        id: 'none-repo',
        name: 'needs-work',
        packages: [
          {
            name: 'needs-work',
            metrics: { tests: 15, deadCode: 60, linting: 30, formatting: 40, types: 20, documentation: 15 },
          },
        ],
      },
    ],
    theme: slateTheme,
    showRepositoryName: false,
    showSummary: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all quality tiers from platinum to none, demonstrating the visual differentiation.',
      },
    },
  },
};

import React from 'react';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import type { PanelComponentProps } from '../types';
import type { QualityMetrics } from '@principal-ai/codebase-composition';
import {
  RepositoryQualityGrid,
  type RepositoryQualityItem,
  type FlatGridItem,
  type VertexHoverInfo,
} from '../components/RepositoryQualityGrid';

// Mock data for demonstration
const mockRepositories: RepositoryQualityItem[] = [
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

// Repository quality data from slice
interface RepositoryQualityData {
  id: string;
  name: string;
  path?: string;
  packages: Array<{
    name: string;
    version?: string;
    metrics: QualityMetrics;
  }>;
}

// Slice data shape
interface RepositoriesQualitySliceData {
  repositories: RepositoryQualityData[];
  lastUpdated: string;
}

/**
 * RepositoryQualityGridPanelContent - Internal component that uses theme
 */
const RepositoryQualityGridPanelContent: React.FC<PanelComponentProps> = ({
  context,
  events,
}) => {
  const { theme } = useTheme();

  // Get repositories quality data from context if available
  const qualitySlice = context.getSlice<RepositoriesQualitySliceData>('repositoriesQuality');
  const hasQualitySlice = context.hasSlice('repositoriesQuality');
  const isLoading = qualitySlice?.loading ?? false;

  // Determine repositories to display
  const repositories: RepositoryQualityItem[] = React.useMemo(() => {
    if (qualitySlice?.data?.repositories) {
      return qualitySlice.data.repositories;
    }
    if (hasQualitySlice) {
      // Slice exists but no data yet
      return [];
    }
    // No slice - use mock for demo
    return mockRepositories;
  }, [qualitySlice?.data?.repositories, hasQualitySlice]);

  // Handle item click
  const handleItemClick = (item: FlatGridItem) => {
    events.emit({
      type: 'principal-ade.repository-quality-grid:item:click',
      source: 'principal-ade.repository-quality-grid-panel',
      timestamp: Date.now(),
      payload: {
        repositoryId: item.repositoryId,
        repositoryName: item.repositoryName,
        packageName: item.packageName,
        tier: item.tier,
      },
    });
  };

  // Handle vertex click
  const handleVertexClick = (item: FlatGridItem, vertex: VertexHoverInfo) => {
    events.emit({
      type: 'principal-ade.repository-quality-grid:vertex:click',
      source: 'principal-ade.repository-quality-grid-panel',
      timestamp: Date.now(),
      payload: {
        repositoryId: item.repositoryId,
        repositoryName: item.repositoryName,
        packageName: item.packageName,
        metric: vertex.key,
        label: vertex.label,
        value: vertex.value,
      },
    });
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (context.hasSlice('repositoriesQuality')) {
      await context.refresh('workspace', 'repositoriesQuality');
    }
  };

  // Subscribe to events
  React.useEffect(() => {
    const unsubscribers = [
      events.on('principal-ade.repository-quality-grid:refresh', async () => {
        await handleRefresh();
      }),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, context]);

  return (
    <div
      style={{
        fontFamily: theme.fonts.body,
        height: '100%',
        minHeight: 0,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {isLoading ? (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: theme.colors.textMuted,
          }}
        >
          Loading repository quality metrics...
        </div>
      ) : repositories.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: theme.colors.textMuted,
          }}
        >
          No repositories with quality metrics found.
        </div>
      ) : (
        <RepositoryQualityGrid
          repositories={repositories}
          theme={theme}
          onItemClick={handleItemClick}
          onVertexClick={handleVertexClick}
          showRepositoryName={true}
          showSummary={true}
        />
      )}
    </div>
  );
};

/**
 * RepositoryQualityGridPanel - A panel for visualizing quality metrics
 * across multiple repositories in a flat grid layout.
 */
export const RepositoryQualityGridPanel: React.FC<PanelComponentProps> = (props) => {
  return (
    <ThemeProvider>
      <RepositoryQualityGridPanelContent {...props} />
    </ThemeProvider>
  );
};

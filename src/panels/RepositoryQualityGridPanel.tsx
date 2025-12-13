import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import type { PanelComponentProps } from '../types';
import type { QualityMetrics } from '@principal-ai/codebase-composition';
import {
  RepositoryQualityGrid,
  type RepositoryQualityItem,
  type FlatGridItem,
  type VertexHoverInfo,
} from '../components/RepositoryQualityGrid';
import { QualityEmptyState } from '../components/QualityEmptyState';

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
  const isLoading = qualitySlice?.loading ?? false;

  // Determine repositories to display
  const repositories: RepositoryQualityItem[] = React.useMemo(() => {
    if (qualitySlice?.data?.repositories) {
      return qualitySlice.data.repositories;
    }
    return [];
  }, [qualitySlice?.data?.repositories]);

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
        <QualityEmptyState theme={theme} hasWorkflow={false} />
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
export const RepositoryQualityGridPanel = RepositoryQualityGridPanelContent;

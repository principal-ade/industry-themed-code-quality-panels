import React from 'react';
import { Terminal, Copy, Check, ChevronRight, Hexagon } from 'lucide-react';
import { useTheme, type Theme } from '@principal-ade/industry-theme';
import type { PanelComponentProps } from '../types';
import type { QualityMetrics } from '@principal-ai/codebase-composition';
import {
  RepositoryQualityGrid,
  type RepositoryQualityItem,
  type FlatGridItem,
  type VertexHoverInfo,
} from '../components/RepositoryQualityGrid';

/**
 * Copyable command line component
 */
const CommandLine: React.FC<{
  command: string;
  theme: Theme;
}> = ({ command, theme }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.log('Copy:', command);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 6,
        backgroundColor: theme.colors.background,
        border: `1px solid ${theme.colors.border}`,
        fontFamily: 'monospace',
        fontSize: 13,
      }}
    >
      <code style={{ color: theme.colors.text }}>{command}</code>
      <button
        onClick={handleCopy}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          border: 'none',
          backgroundColor: 'transparent',
          color: theme.colors.textMuted,
          cursor: 'pointer',
        }}
        title="Copy command"
      >
        {copied ? (
          <Check size={16} color={theme.colors.success} />
        ) : (
          <Copy size={16} />
        )}
      </button>
    </div>
  );
};

/**
 * Empty state for the repository quality grid
 */
const RepositoryQualityEmptyState: React.FC<{ theme: Theme }> = ({ theme }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 24,
        height: '100%',
        minHeight: 400,
      }}
    >
      {/* Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 64,
          height: 64,
          borderRadius: 16,
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <Hexagon size={32} color={theme.colors.textMuted} />
      </div>

      {/* Title and description */}
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: 18,
            fontWeight: 600,
            color: theme.colors.text,
          }}
        >
          No Quality Metrics
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: theme.colors.textMuted,
            lineHeight: 1.5,
          }}
        >
          Configure the Quality Lens GitHub Action on your repositories to track
          code quality metrics across your projects.
        </p>
      </div>

      {/* Setup instructions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 20,
          borderRadius: 8,
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 4,
          }}
        >
          <Terminal size={20} color={theme.colors.text} />
          <h4
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: theme.colors.text,
            }}
          >
            Get Started
          </h4>
        </div>

        {/* Step 1 */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              fontSize: 13,
              color: theme.colors.textMuted,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: theme.colors.primary,
                color: theme.colors.background,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              1
            </span>
            <span>Install the CLI</span>
          </div>
          <CommandLine
            command="npm install -g @principal-ai/quality-lens-cli"
            theme={theme}
          />
        </div>

        {/* Step 2 */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              fontSize: 13,
              color: theme.colors.textMuted,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: theme.colors.primary,
                color: theme.colors.background,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              2
            </span>
            <span>Initialize in each repository</span>
          </div>
          <CommandLine command="quality-lens init" theme={theme} />
        </div>

        {/* Next steps hint */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            paddingTop: 8,
            fontSize: 13,
            color: theme.colors.textMuted,
          }}
        >
          <ChevronRight size={14} />
          <span>Commit, push, and quality data will appear after CI runs</span>
        </div>
      </div>
    </div>
  );
};

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
        <RepositoryQualityEmptyState theme={theme} />
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

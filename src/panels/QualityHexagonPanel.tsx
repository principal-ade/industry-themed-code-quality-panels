import React from 'react';
import { Hexagon } from 'lucide-react';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import type { PanelComponentProps } from '../types';
import type { QualityMetrics } from '@principal-ai/codebase-composition';
import {
  QualityHexagonExpandable,
  QualityTier,
  calculateQualityTier,
} from '../components/QualityHexagon';

// Mock package data - in real usage, this would come from a quality slice
const mockPackages: Array<{
  name: string;
  version?: string;
  metrics: QualityMetrics;
}> = [
  {
    name: '@principal-ade/code-quality-panels',
    version: '0.1.0',
    metrics: {
      tests: 75,
      deadCode: 15,
      linting: 85,
      formatting: 90,
      types: 88,
      documentation: 65,
    },
  },
];

// Package quality data shape from slice
interface PackageQuality {
  name: string;
  version?: string;
  metrics: QualityMetrics;
}

// Slice data shape
interface QualitySliceData {
  packages: PackageQuality[];
  lastUpdated: string;
}

/**
 * QualityHexagonPanelContent - Internal component that uses theme
 */
const QualityHexagonPanelContent: React.FC<PanelComponentProps> = ({
  context,
  events,
}) => {
  const { theme } = useTheme();
  const [refreshingPackages, setRefreshingPackages] = React.useState<Set<string>>(new Set());

  // Get quality data from context if available
  const qualitySlice = context.getSlice<QualitySliceData>('quality');
  const hasQualitySlice = context.hasSlice('quality');
  const isLoading = qualitySlice?.loading ?? false;

  // Determine packages to display
  // - If slice exists and has data, use it
  // - If slice exists but is loading/empty, show empty
  // - If no slice at all, use mock data for demo
  const packages: PackageQuality[] = React.useMemo(() => {
    if (qualitySlice?.data?.packages) {
      return qualitySlice.data.packages;
    }
    if (hasQualitySlice) {
      // Slice exists but no data yet (loading or empty)
      return [];
    }
    // No slice - use mock for demo
    return mockPackages;
  }, [qualitySlice?.data?.packages, hasQualitySlice]);

  // Handle refresh for a specific package
  const handleRefreshPackage = async (packageName: string) => {
    setRefreshingPackages(prev => new Set(prev).add(packageName));
    try {
      if (context.hasSlice('quality')) {
        // In future, this could refresh just one package
        await context.refresh('repository', 'quality');
      }
    } finally {
      setRefreshingPackages(prev => {
        const next = new Set(prev);
        next.delete(packageName);
        return next;
      });
    }
  };

  // Handle refresh all
  const handleRefreshAll = async () => {
    const allNames = packages.map(p => p.name);
    setRefreshingPackages(new Set(allNames));
    try {
      if (context.hasSlice('quality')) {
        await context.refresh('repository', 'quality');
      }
    } finally {
      setRefreshingPackages(new Set());
    }
  };

  // Subscribe to events
  React.useEffect(() => {
    const unsubscribers = [
      events.on('principal-ade.quality-panel:refresh', async () => {
        await handleRefreshAll();
      }),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, context, packages]);

  // Tier colors for display
  const tierColors: Record<QualityTier, string> = {
    none: theme.colors.muted,
    bronze: theme.colors.warning,
    silver: theme.colors.secondary,
    gold: theme.colors.accent,
    platinum: theme.colors.primary,
  };

  // Calculate overall tier from all packages
  const overallTier = packages.length > 0
    ? calculateQualityTier(
        packages.reduce((acc, pkg) => ({
          tests: acc.tests + pkg.metrics.tests / packages.length,
          deadCode: acc.deadCode + pkg.metrics.deadCode / packages.length,
          linting: acc.linting + pkg.metrics.linting / packages.length,
          formatting: acc.formatting + pkg.metrics.formatting / packages.length,
          types: acc.types + pkg.metrics.types / packages.length,
          documentation: acc.documentation + pkg.metrics.documentation / packages.length,
        }), { tests: 0, deadCode: 0, linting: 0, formatting: 0, types: 0, documentation: 0 })
      )
    : 'none';

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
      <div
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Hexagon size={24} color={tierColors[overallTier]} />
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: theme.colors.text,
          }}
        >
          Code Quality
        </h2>
        <span
          title="Platinum: 90%+ avg | Gold: 75%+ | Silver: 60%+ | Bronze: 40%+"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: `1px solid ${theme.colors.border}`,
            fontSize: 12,
            color: theme.colors.textMuted,
            cursor: 'help',
          }}
        >
          ?
        </span>
        {packages.length > 1 && (
          <span style={{
            fontSize: 14,
            color: theme.colors.textMuted,
          }}>
            {packages.length} packages
          </span>
        )}
      </div>

      {/* Quality Hexagons for each package */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, minHeight: 0 }}>
        {isLoading ? (
          <div style={{
            padding: 40,
            textAlign: 'center',
            color: theme.colors.textMuted,
          }}>
            Loading quality metrics...
          </div>
        ) : packages.length === 0 ? (
          <div style={{
            padding: 40,
            textAlign: 'center',
            color: theme.colors.textMuted,
          }}>
            No packages found
          </div>
        ) : (
          packages.map((pkg) => {
            const tier = calculateQualityTier(pkg.metrics);
            return (
              <QualityHexagonExpandable
                key={pkg.name}
                metrics={pkg.metrics}
                tier={tier}
                theme={theme}
                packageName={pkg.name}
                packageVersion={pkg.version}
              />
            );
          })
        )}
      </div>
      </div>
    </div>
  );
};

/**
 * QualityHexagonPanel - A panel for visualizing code quality metrics
 */
export const QualityHexagonPanel: React.FC<PanelComponentProps> = (props) => {
  return (
    <ThemeProvider>
      <QualityHexagonPanelContent {...props} />
    </ThemeProvider>
  );
};

import { QualityHexagonPanel } from './panels/QualityHexagonPanel';
import type { PanelDefinition, PanelContextValue } from './types';

/**
 * Export array of panel definitions.
 * This is the required export for panel extensions.
 */
export const panels: PanelDefinition[] = [
  {
    metadata: {
      id: 'principal-ade.quality-hexagon-panel',
      name: 'Code Quality',
      icon: '⬡',
      version: '0.1.0',
      author: 'Principal ADE',
      description:
        'Visualize code quality metrics using a hexagonal radar chart showing tests, types, linting, formatting, documentation, and dead code.',
      slices: ['quality'],
      tools: [],
    },
    component: QualityHexagonPanel,

    onMount: async (context: PanelContextValue) => {
      console.log(
        'Quality Hexagon Panel mounted',
        context.currentScope.repository?.path
      );

      if (context.hasSlice('quality') && !context.isSliceLoading('quality')) {
        await context.refresh('repository', 'quality');
      }
    },

    onUnmount: async (_context: PanelContextValue) => {
      console.log('Quality Hexagon Panel unmounting');
    },
  },
];

/**
 * Optional: Called once when the entire package is loaded.
 */
export const onPackageLoad = async () => {
  console.log('Panel package loaded - Code Quality Panels');
};

/**
 * Optional: Called once when the package is unloaded.
 */
export const onPackageUnload = async () => {
  console.log('Panel package unloading - Code Quality Panels');
};

// Export components for direct usage
export {
  QualityHexagon,
  QualityHexagonCompact,
  QualityHexagonDetailed,
  calculateQualityTier,
  type QualityMetrics,
  type QualityTier,
} from './components';

// Export panel
export { QualityHexagonPanel } from './panels/QualityHexagonPanel';

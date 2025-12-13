import React from 'react';
import { Terminal, Copy, Check, ChevronRight, Zap, GitBranch, Info } from 'lucide-react';
import type { Theme } from '@principal-ade/industry-theme';

interface QualityEmptyStateProps {
  theme: Theme;
  hasWorkflow: boolean;
}

const WORKFLOW_FILE_PATH = '.github/workflows/quality-lens.yml';

/**
 * Check if a file path exists in a FileTree's allFiles array
 */
export function checkFileExistsInTree(
  treeData: { allFiles?: Array<{ relativePath?: string; path?: string }> } | undefined,
  targetPath: string
): boolean {
  if (!treeData?.allFiles) return false;

  const normalizedTarget = targetPath.replace(/^\//, '').toLowerCase();

  return treeData.allFiles.some((file) => {
    const filePath = (file.relativePath || file.path || '').toLowerCase();
    return filePath.endsWith(normalizedTarget) || filePath === normalizedTarget;
  });
}

/**
 * Copyable command line component
 */
const CommandLine: React.FC<{
  command: string;
  theme: Theme;
  label?: string;
}> = ({ command, theme, label }) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <span style={{ fontSize: 12, color: theme.colors.textMuted }}>{label}</span>
      )}
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
    </div>
  );
};

/**
 * Mini hexagon preview showing what metrics are tracked
 */
const MetricsPreview: React.FC<{ theme: Theme }> = ({ theme }) => {
  const metrics = [
    { key: 'tests', label: 'Tests', description: 'Test coverage & pass rate', icon: '🧪' },
    { key: 'linting', label: 'Linting', description: 'ESLint code quality', icon: '📝' },
    { key: 'types', label: 'Types', description: 'TypeScript type safety', icon: '🔷' },
    { key: 'formatting', label: 'Formatting', description: 'Prettier code style', icon: '✨' },
    { key: 'deadCode', label: 'Dead Code', description: 'Unused exports & deps', icon: '🧹' },
    { key: 'documentation', label: 'Docs', description: 'Code documentation', icon: '📚' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {metrics.map((m) => (
        <div
          key={m.key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 8px',
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          <span style={{ fontSize: 14 }}>{m.icon}</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 500, color: theme.colors.text }}>{m.label}</span>
            <span style={{ fontSize: 11, color: theme.colors.textMuted }}>{m.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Empty state component for when no quality data is available
 */
export const QualityEmptyState: React.FC<QualityEmptyStateProps> = ({
  theme,
  hasWorkflow,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  if (hasWorkflow) {
    // Workflow exists but no data yet
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 0',
          gap: 16,
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 6,
            backgroundColor: `${theme.colors.success}15`,
            color: theme.colors.success,
            fontSize: 13,
          }}
        >
          <Check size={16} />
          <span>Workflow detected at {WORKFLOW_FILE_PATH}</span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: theme.colors.textMuted,
            lineHeight: 1.5,
          }}
        >
          Quality metrics will appear here after your workflow runs. Push a commit to trigger it, or check the Actions tab for status.
        </p>

        <MetricsPreview theme={theme} />

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 6,
            backgroundColor: `${theme.colors.warning}10`,
            fontSize: 12,
            color: theme.colors.textMuted,
          }}
        >
          <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} color={theme.colors.warning} />
          <div>
            <strong style={{ color: theme.colors.text }}>Using private npm packages?</strong>
            <br />
            Add <code style={{ backgroundColor: theme.colors.background, padding: '1px 4px', borderRadius: 3 }}>NPM_TOKEN</code> to your repository secrets and ensure the workflow has access to it.
          </div>
        </div>
      </div>
    );
  }

  // No workflow - show setup instructions
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        gap: 16,
        width: '100%',
      }}
    >
      {/* What you'll get */}
      <div>
        <h4
          style={{
            margin: '0 0 12px 0',
            fontSize: 14,
            fontWeight: 600,
            color: theme.colors.text,
          }}
        >
          Track 6 quality dimensions
        </h4>
        <MetricsPreview theme={theme} />
      </div>

      {/* Quick Start */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 16,
          borderRadius: 8,
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Zap size={18} color={theme.colors.primary} />
          <h4
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: theme.colors.text,
            }}
          >
            Quick Start
          </h4>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: theme.colors.textMuted,
            lineHeight: 1.5,
          }}
        >
          Run this in your project directory to set up automated quality tracking:
        </p>

        <CommandLine
          command="npx @principal-ai/quality-lens-cli init"
          theme={theme}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: theme.colors.textMuted,
          }}
        >
          <GitBranch size={14} />
          <span>Then commit and push to start tracking</span>
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: 0,
          border: 'none',
          backgroundColor: 'transparent',
          color: theme.colors.textMuted,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        <ChevronRight
          size={14}
          style={{
            transform: showAdvanced ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        />
        <span>{showAdvanced ? 'Hide' : 'Show'} additional options</span>
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: 16,
            borderRadius: 8,
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Terminal size={18} color={theme.colors.text} />
            <h4
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                color: theme.colors.text,
              }}
            >
              CLI Commands
            </h4>
          </div>

          <CommandLine
            command="npx @principal-ai/quality-lens-cli list"
            theme={theme}
            label="See available quality tools in your project"
          />

          <CommandLine
            command="npx @principal-ai/quality-lens-cli run . --install"
            theme={theme}
            label="Run quality checks locally (auto-installs missing tools)"
          />

          <CommandLine
            command="npm install -g @principal-ai/quality-lens-cli"
            theme={theme}
            label="Install globally for faster repeated use"
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 6,
              backgroundColor: `${theme.colors.warning}10`,
              fontSize: 12,
              color: theme.colors.textMuted,
            }}
          >
            <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} color={theme.colors.warning} />
            <div>
              <strong style={{ color: theme.colors.text }}>Private npm packages?</strong>
              <br />
              If your project uses private @org packages, add <code style={{ backgroundColor: theme.colors.background, padding: '1px 4px', borderRadius: 3 }}>NPM_TOKEN</code> to your GitHub repository secrets under Settings → Secrets → Actions, and set the workflow environment if needed.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { WORKFLOW_FILE_PATH };

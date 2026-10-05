import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { ActionButton } from '@/components/admin/ui';
import { TrialLevelView } from './TrialLevelView';

const LEVELS = [1, 2, 3, 4, 5];

// L1-L5 tracker: candidates are called, marked attended and selected level by level.
export const TrialLevelsTab = () => {
  const [level, setLevel] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const { syncTrialCandidates } = usePlayerWorkflow();

  const handleRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const added = await syncTrialCandidates();
      toast.success(added ? `${added} paid player(s) added as candidates` : 'No new paid players to add');
      handleRefresh();
    } catch (err: any) {
      toast.error('Could not sync paid players', { description: err?.message });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="admin-muted max-w-[62ch]">
          Level 1 lists every candidate. Selecting a candidate moves them to the next level; every result or absence emails the player (with their certificate).
        </p>
        <ActionButton variant="soft" size="sm" icon={RefreshCw} loading={syncing} onClick={handleSync}>
          Sync paid players
        </ActionButton>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Trial level">
        {LEVELS.map(l => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={level === l}
            className="admin-chip"
            data-active={level === l}
            onClick={() => setLevel(l)}
          >
            Level {l}
          </button>
        ))}
      </div>

      <TrialLevelView level={level} key={`l${level}-${refreshKey}`} onRefresh={handleRefresh} />
    </div>
  );
};

export default TrialLevelsTab;

import React from 'react';
import { Flame, Trophy } from 'lucide-react';

const WellnessWidget = ({ achievements }) => {
  if (!achievements) return null;

  const wellnessPoints = Number(achievements.wellnessPoints || 0);
  const currentStreakDays = Number(achievements.currentStreakDays || 0);
  const unlockedBadges = Array.isArray(achievements.unlockedBadges) ? achievements.unlockedBadges : [];

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 p-5 text-white shadow-[0_12px_30px_rgb(0,0,0,0.12)] ring-1 ring-white/10">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85">
            Wellness Snapshot
          </div>
          <h3 className="mt-3 text-lg font-bold leading-tight">Health Score</h3>
          <p className="mt-1 text-sm text-white/80">Keep the streak going with regular health tracking.</p>
        </div>

        <div className="shrink-0 rounded-2xl bg-white/12 px-3 py-2 text-right backdrop-blur-sm">
          <div className="text-3xl font-black leading-none">{wellnessPoints}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75">Points</div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg">
          <Flame className="h-5 w-5 text-amber-200" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">
            {currentStreakDays} Day Streak
          </p>
          <p className="text-xs text-white/75">Consistency earns rewards.</p>
        </div>
      </div>

      {unlockedBadges.length > 0 && (
        <div className="mt-4 border-t border-white/15 pt-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
            <Trophy className="h-3.5 w-3.5" />
            Badges
          </div>
          <div className="flex flex-wrap gap-2">
            {unlockedBadges.map((badge, idx) => {
              const badgeName = badge?.badgeName || 'Achievement';
              const badgeId = badge?.badgeId || `${badgeName}-${idx}`;

              return (
                <span
                  key={badgeId}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90 shadow-sm"
                >
                  <span aria-hidden="true">🏆</span>
                  <span className="max-w-[11rem] truncate">{badgeName}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessWidget;
import { useMemo, useState } from 'react';
import {
  get12MonthFocusText,
  getBiggestConstraintText,
  getLikelyBreakthroughText,
  getPriorityLadder,
  getQuarterRoadmap,
  getStrongestAdvantageText,
  getStrongestPillar,
  getWeakestPillars,
  getWorkbookExercises,
  normalizePremiumPillarScores,
  pillarLabel,
  type PremiumPillarScores,
} from '../../utils/reportPersonalization';

type Props = {
  pillarScores: Record<string, number>;
  reportTier?: 'free' | 'standard' | 'premium';
  onUnlockPremium?: () => void;
};

type NotesState = {
  yearlyFocus: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
};

export default function PremiumGuidanceSection({
  pillarScores,
  reportTier = 'premium',
  onUnlockPremium,
}: Props) {
  const normalizedScores: PremiumPillarScores = useMemo(
    () => normalizePremiumPillarScores(pillarScores),
    [pillarScores]
  );

  const weakest = useMemo(
    () => getWeakestPillars(normalizedScores, 3),
    [normalizedScores]
  );

  const strongest = useMemo(
    () => getStrongestPillar(normalizedScores),
    [normalizedScores]
  );

  const ladder = useMemo(
    () => getPriorityLadder(normalizedScores),
    [normalizedScores]
  );

  const roadmap = useMemo(
    () => getQuarterRoadmap(normalizedScores),
    [normalizedScores]
  );

  const exercises = useMemo(
    () => getWorkbookExercises(normalizedScores),
    [normalizedScores]
  );

  const [notes, setNotes] = useState<NotesState>({
    yearlyFocus: '',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
  });

  return (
    <section className="bg-white/95 backdrop-blur rounded-3xl border border-white/10 shadow-sm p-6 md:p-8 mb-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex w-fit items-center rounded-full bg-copper-50 px-3 py-1 text-sm font-semibold text-copper-700">
            Premium Guidance
          </div>

          {reportTier !== 'premium' && (
            <button
              onClick={onUnlockPremium}
              className="text-sm font-semibold text-copper-600 hover:text-copper-700 hover:underline"
            >
              Unlock this section →
            </button>
          )}
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-navy-900">
            Your 12-Month Roadmap
          </h2>
          <p className="mt-2 text-gray-600 leading-7 max-w-3xl">
            This section turns your report into a guided implementation plan.
            It highlights your biggest constraint, your strongest advantage,
            and the sequence that should matter most over the next 12 months.
          </p>
          <p className="mt-3 text-sm font-medium text-copper-700">
            This plan is built around your weakest constraint — because that is
            where the fastest progress usually comes from.
          </p>
        </div>
      </div>

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-4 mb-6">
        <InfoCard
          label="Biggest Constraint"
          value={pillarLabel(weakest[0])}
          body={getBiggestConstraintText(weakest[0])}
        />
        <InfoCard
          label="Strongest Advantage"
          value={pillarLabel(strongest)}
          body={getStrongestAdvantageText(strongest)}
        />
        <InfoCard
          label="12-Month Focus"
          value={pillarLabel(weakest[0])}
          body={get12MonthFocusText(weakest[0])}
        />
        <InfoCard
          label="Likely Breakthrough"
          value="If consistent"
          body={getLikelyBreakthroughText(weakest[0])}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Commit your 12-month focus (this becomes your anchor)
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Put the plan into your own words so it is easier to follow through on.
        </p>
        <textarea
          rows={4}
          value={notes.yearlyFocus}
          onChange={(e) =>
            setNotes((prev) => ({ ...prev, yearlyFocus: e.target.value }))
          }
          placeholder="Example: Reduce debt pressure and build a $5,000 emergency buffer so I can stop living paycheck to paycheck."
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-copper-500"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 mb-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-navy-900">4-Quarter Roadmap</h3>
          <p className="mt-1 text-gray-600">
            Start with the weakest pressure point, then build strength outward.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {roadmap.map((item) => {
            const noteKey =
              item.quarter === 'Q1'
                ? 'q1'
                : item.quarter === 'Q2'
                ? 'q2'
                : item.quarter === 'Q3'
                ? 'q3'
                : 'q4';

            return (
              <div
                key={item.quarter}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="text-xs uppercase tracking-[0.18em] text-copper-600 font-semibold mb-2">
                  {item.quarter}
                </div>
                <h4 className="text-lg font-bold text-navy-900 mb-3">
                  {item.title}
                </h4>

                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    Main Focus
                  </div>
                  <p className="text-gray-700 leading-7">{item.mainFocus}</p>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    Actions
                  </div>
                  <ul className="space-y-2">
                    {item.actions.map((action) => (
                      <li
                        key={action}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-copper-600" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-4">
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    Checkpoint Question
                  </div>
                  <p className="text-gray-700 leading-7">{item.checkpoint}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes[noteKey]}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        [noteKey]: e.target.value,
                      }))
                    }
                    placeholder={`Notes for ${item.quarter}...`}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-copper-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-xl font-bold text-navy-900 mb-2">Priority Ladder</h3>
          <p className="text-gray-600 mb-2">
            This keeps your next moves from getting scattered.
          </p>
          <div className="text-sm text-copper-700 font-medium mb-4">
            Now = where progress starts • Next = what unlocks next growth • Later = what becomes important after that
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <PriorityColumn title="Now" pillars={ladder.now} />
            <PriorityColumn title="Next" pillars={ladder.next} />
            <PriorityColumn title="Later" pillars={ladder.later} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-xl font-bold text-navy-900 mb-2">
            Workbook Exercises Matched to Weak Areas
          </h3>
          <p className="text-gray-600 mb-4">
            These are selected prompts, not the full Field Guide.
          </p>

          <div className="space-y-4">
            {exercises.map((exercise) => (
              <div
                key={exercise.title}
                className="rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="text-xs uppercase tracking-[0.18em] text-copper-600 font-semibold mb-2">
                  {pillarLabel(exercise.pillar)}
                </div>
                <h4 className="text-base font-bold text-navy-900 mb-2">
                  {exercise.title}
                </h4>
                <p className="text-gray-700 leading-7">{exercise.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-xl font-bold text-navy-900 mb-2">90-Day Check-In Prompts</h3>
        <p className="text-gray-600 mb-4">
          Use these at the end of the quarter to decide what to reinforce next.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            'What improved?',
            'What stayed stuck?',
            'What is the next bottleneck?',
            'What should I focus on next quarter?',
          ].map((prompt) => (
            <div
              key={prompt}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="text-sm font-semibold text-gray-700 mb-3">
                {prompt}
              </div>
              <textarea
                rows={3}
                placeholder="Write your answer here..."
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-copper-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  label,
  value,
  body,
}: {
  label: string;
  value: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-gray-500 font-semibold mb-2">
        {label}
      </div>
      <div className="text-lg font-bold text-navy-900 mb-2">{value}</div>
      <p className="text-gray-700 leading-7">{body}</p>
    </div>
  );
}

function PriorityColumn({
  title,
  pillars,
}: {
  title: string;
  pillars: string[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-copper-600 font-semibold mb-3">
        {title}
      </div>
      <div className="space-y-2">
        {pillars.map((pillar) => (
          <div
            key={pillar}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-navy-900"
          >
            {pillarLabel(pillar as any)}
          </div>
        ))}
      </div>
    </div>
  );
}
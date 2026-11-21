import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import SkillsOverview from '../components/character/SkillsOverview';
import ActionsTab from '../components/character/view/ActionsTab';
import TraitsTab from '../components/character/view/TraitsTab';
import SpellsTab from '../components/character/view/SpellsTab';
import ResourceBars from '../components/character/view/ResourceBars';
import MitigationTable from '../components/character/view/MitigationTable';
import MovementTable from '../components/character/view/MovementTable';
import { TemplatePreview, TemplateStage, TEMPLATE_STAGE_INFO } from '../types/template';

type DetailTab = 'skills' | 'actions' | 'spells' | 'traits' | 'modules';

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'skills', label: 'Skills' },
  { id: 'actions', label: 'Actions & Reactions' },
  { id: 'spells', label: 'Spells' },
  { id: 'traits', label: 'Traits' },
  { id: 'modules', label: 'Modules' },
];

const chipStyle = (color = 'var(--color-white)'): React.CSSProperties => ({
  fontSize: '0.8rem',
  padding: '0.25rem 0.625rem',
  borderRadius: '0.375rem',
  backgroundColor: 'var(--color-dark-elevated)',
  border: '1px solid var(--color-dark-border)',
  color,
  whiteSpace: 'nowrap',
});

interface StatsSource {
  movement?: number;
  swim_speed?: number;
  climb_speed?: number;
  resources?: Record<string, { max?: number }>;
  mitigation?: Record<string, { min: number; max: number }>;
  immunities?: string[];
  vision?: string[];
}

const TemplateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const stageParam = parseInt(searchParams.get('stage') || '1', 10);
  const stage = ([1, 2, 3, 4].includes(stageParam) ? stageParam : 1) as TemplateStage;

  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>('skills');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/templates/${id}/preview?stage=${stage}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load template');
        return res.json();
      })
      .then((data: TemplatePreview) => {
        setPreview(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, stage]);

  const setStage = (s: TemplateStage) => setSearchParams({ stage: String(s) }, { replace: true });

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        <div style={{ color: 'var(--color-sunset)' }}>{error}</div>
        <Link to="/templates" style={{ color: 'var(--color-metal-gold)' }}>
          Back to templates
        </Link>
      </div>
    );
  }

  if (!preview) {
    return (
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem',
          color: 'var(--color-cloud)',
        }}
      >
        Loading template...
      </div>
    );
  }

  const { template, character, moduleSummaries, maxStage, pointsSpent, stagePoints } = preview;
  const stageInfo = TEMPLATE_STAGE_INFO[preview.stage];
  // Resources/mitigation/movement as the character sheet shows them, at full resources
  const stats = character as unknown as StatsSource;
  const full = (key: string) => {
    const max = stats.resources?.[key]?.max ?? 0;
    return { current: max, max };
  };
  const resources = {
    health: full('health'),
    resolve: full('resolve'),
    morale: full('morale'),
    energy: full('energy'),
  };
  const senses = [
    ...(stats.immunities || []).map((i) => `Immune to ${i}`),
    ...(stats.vision || []).map((v) => `${v} vision`),
  ];
  const missingModules = moduleSummaries.filter((m) => !m.found);
  const missingSpells = preview.missingSpells || [];

  // Spells have no stage, so check each list against the slots this stage provides
  const spellLists = [
    {
      key: 'spells',
      label: 'Spells',
      known: character.spells?.length ?? 0,
      slots: character.spellSlots ?? 0,
    },
    {
      key: 'sorcererSpells',
      label: 'Sorcerer spells',
      known: character.sorcererSpells?.length ?? 0,
      slots: character.sorcererSpellSlots ?? 0,
    },
    {
      key: 'thiefSpells',
      label: 'Thief spells',
      known: character.thiefSpells?.length ?? 0,
      slots: character.thiefSpellSlots ?? 0,
    },
  ];
  const lockedSpells = preview.lockedSpells || [];
  const hasSpells = spellLists.some((l) => l.known > 0) || lockedSpells.length > 0;
  const visibleTabs = TABS.filter((t) => t.id !== 'spells' || hasSpells);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <Link
        to="/templates"
        style={{ color: 'var(--color-cloud)', fontSize: '0.875rem', textDecoration: 'none' }}
      >
        ← All templates
      </Link>

      {/* Header */}
      <Card variant="default" style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
        <CardBody>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <h1 style={{ color: 'var(--color-white)', fontSize: '2rem', fontWeight: 700 }}>
              {template.name}
            </h1>
            <span style={{ ...chipStyle('var(--color-cloud)'), textTransform: 'capitalize' }}>
              {template.category}
            </span>
          </div>
          <p style={{ color: 'var(--color-cloud)', marginTop: '0.5rem' }}>{template.description}</p>
          {template.playstyle && (
            <p
              style={{
                color: 'var(--color-white)',
                marginTop: '0.75rem',
                fontSize: '0.9rem',
                borderLeft: '3px solid var(--color-metal-gold)',
                paddingLeft: '0.75rem',
              }}
            >
              {template.playstyle}
            </p>
          )}
          {missingSpells.length > 0 && (
            <p style={{ color: 'var(--color-sunset)', marginTop: '0.75rem', fontSize: '0.85rem' }}>
              Missing spells (not shown): {missingSpells.join(', ')}
            </p>
          )}
          {missingModules.length > 0 && (
            <p style={{ color: 'var(--color-sunset)', marginTop: '0.75rem', fontSize: '0.85rem' }}>
              Missing modules (not counted): {missingModules.map((m) => m.name).join(', ')}
            </p>
          )}
        </CardBody>
      </Card>

      {/* Stage selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        {([1, 2, 3, 4] as TemplateStage[]).map((s) => {
          const info = TEMPLATE_STAGE_INFO[s];
          const active = preview.stage === s;
          const available = s <= maxStage;
          return (
            <button
              key={s}
              disabled={!available}
              onClick={() => setStage(s)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: available ? 'pointer' : 'not-allowed',
                opacity: available ? 1 : 0.35,
                backgroundColor: active ? info.bg : 'var(--color-dark-elevated)',
                border: `2px solid ${active ? info.border : 'var(--color-dark-border)'}`,
                color: active ? info.color : 'var(--color-cloud)',
              }}
            >
              {info.label}
              <span style={{ fontWeight: 400, marginLeft: '0.375rem', fontSize: '0.75rem' }}>
                {info.points} pts
              </span>
            </button>
          );
        })}
        <span
          style={{
            marginLeft: 'auto',
            color: pointsSpent > stagePoints ? 'var(--color-sunset)' : 'var(--color-cloud)',
            fontSize: '0.875rem',
          }}
        >
          {loading ? 'Loading...' : `${pointsSpent} / ${stagePoints} module points`}
        </span>
      </div>

      {/* Resources, movement and mitigation, laid out like the character sheet header */}
      <Card variant="default" style={{ marginBottom: '1rem' }}>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-6">
            <div
              className="flex-1"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <ResourceBars resources={resources} readOnly />
              <MovementTable
                movement={stats.movement ?? 5}
                swim_speed={stats.swim_speed}
                climb_speed={stats.climb_speed}
              />
              {senses.length > 0 && (
                <div
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.85rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {senses.join(' · ')}
                </div>
              )}
            </div>
            {stats.mitigation && (
              <div className="flex-1 flex justify-center">
                <MitigationTable mitigation={stats.mitigation} />
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.25rem',
          borderBottom: '1px solid var(--color-dark-border)',
          marginBottom: '1rem',
        }}
      >
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? stageInfo.color : 'transparent'}`,
              color: activeTab === tab.id ? 'var(--color-white)' : 'var(--color-cloud)',
              fontWeight: activeTab === tab.id ? 700 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s' }}>
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 gap-6">
            {preview.extraTraining?.length > 0 && (
              <Card variant="default">
                <CardHeader>
                  <h2 style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 700 }}>
                    Extra Training
                  </h2>
                  <p style={{ color: 'var(--color-cloud)', fontSize: '0.8rem' }}>
                    One per 10 module points. Each gives +1 to a skill and is included below.
                  </p>
                </CardHeader>
                <CardBody>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {preview.extraTraining.map((t) => {
                      const info = TEMPLATE_STAGE_INFO[t.stage as TemplateStage];
                      return (
                        <span
                          key={t.name}
                          title={`Unlocks at ${info?.label ?? `stage ${t.stage}`}`}
                          style={{
                            ...chipStyle(t.found ? 'var(--color-white)' : 'var(--color-sunset)'),
                            borderColor: info?.border ?? 'var(--color-dark-border)',
                            opacity: t.unlocked ? 1 : 0.4,
                          }}
                        >
                          +1 {t.name}
                          <span
                            style={{
                              color: info?.color,
                              marginLeft: '0.375rem',
                              fontSize: '0.7rem',
                            }}
                          >
                            {info?.label ?? `Stage ${t.stage}`}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            )}
            <SkillsOverview character={character} />
          </div>
        )}

        {activeTab === 'actions' && <ActionsTab character={character} />}

        {activeTab === 'spells' && hasSpells && (
          <div className="grid grid-cols-1 gap-6">
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
              {spellLists
                .filter((l) => l.known > 0 || l.key === 'spells')
                .map((l) => (
                  <span
                    key={l.key}
                    style={{
                      color: l.known > l.slots ? 'var(--color-sunset)' : 'var(--color-cloud)',
                    }}
                  >
                    {l.label}: {l.known} / {l.slots} slots
                  </span>
                ))}
            </div>
            {lockedSpells.length > 0 && (
              <Card variant="default">
                <CardBody>
                  <div
                    style={{
                      color: 'var(--color-white)',
                      fontWeight: 700,
                      marginBottom: '0.25rem',
                    }}
                  >
                    Not castable yet at {stageInfo.label}
                  </div>
                  <p
                    style={{
                      color: 'var(--color-cloud)',
                      fontSize: '0.8rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    These need a higher roll than this stage&apos;s magic skill can reach, so
                    they&apos;re hidden below and don&apos;t use slots yet.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {lockedSpells.map((sp) => (
                      <span
                        key={`${sp.list}-${sp.name}`}
                        style={chipStyle('var(--color-cloud)')}
                        title={sp.maxRoll ? `Max roll ${sp.maxRoll}` : 'No talent in this school'}
                      >
                        {sp.name}{' '}
                        <span style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                          ({sp.school} RC {sp.rc}, max {sp.maxRoll})
                        </span>
                      </span>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            <SpellsTab
              characterId=""
              spells={character.spells || []}
              spellSlots={character.spellSlots ?? 0}
              sorcererSpells={character.sorcererSpells || []}
              sorcererSpellSlots={character.sorcererSpellSlots ?? 0}
              thiefSpells={character.thiefSpells || []}
              thiefSpellSlots={character.thiefSpellSlots ?? 0}
              canEdit={false}
              showExoticSchools={false}
            />
          </div>
        )}

        {activeTab === 'traits' && <TraitsTab character={character} characterId="" />}

        {activeTab === 'modules' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {moduleSummaries.map((m) => (
              <Card key={m.name} variant="default">
                <CardHeader>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {m.found ? (
                      <Link
                        to={`/modules?module=${encodeURIComponent(m.name)}`}
                        style={{ color: 'var(--color-white)', fontWeight: 700, fontSize: '1.1rem' }}
                      >
                        {m.name}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--color-sunset)', fontWeight: 700 }}>
                        {m.name} (not found)
                      </span>
                    )}
                    {m.mtype && (
                      <span
                        style={{
                          color: 'var(--color-cloud)',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                        }}
                      >
                        {m.mtype}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardBody>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {m.options.map((o) => {
                      const info = TEMPLATE_STAGE_INFO[o.stage as TemplateStage];
                      const taken = o.stage <= preview.stage;
                      const isNew = o.stage === preview.stage && preview.stage > 1;
                      return (
                        <div
                          key={o.location}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: taken ? 1 : 0.4,
                          }}
                        >
                          <span
                            style={{
                              width: '2rem',
                              color: 'var(--color-cloud)',
                              fontSize: '0.75rem',
                              flexShrink: 0,
                            }}
                          >
                            {o.location}
                          </span>
                          <span
                            style={{ color: 'var(--color-white)', fontSize: '0.875rem', flex: 1 }}
                          >
                            {o.name}
                          </span>
                          {isNew && (
                            <span
                              style={{
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                color: info?.color,
                              }}
                            >
                              NEW
                            </span>
                          )}
                          <span
                            title={info?.label}
                            style={{
                              width: '0.5rem',
                              height: '0.5rem',
                              borderRadius: '50%',
                              backgroundColor: info?.color ?? 'var(--color-cloud)',
                              flexShrink: 0,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateDetail;

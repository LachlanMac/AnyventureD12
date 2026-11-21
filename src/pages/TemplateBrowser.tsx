import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardBody } from '../components/ui/Card';
import TalentDisplay from '../components/character/TalentDisplay';
import { Template, TEMPLATE_STAGE_INFO, getTemplateMaxStage } from '../types/template';

const CATEGORIES = ['all', 'martial', 'magic', 'hybrid', 'support', 'utility'] as const;
const ATTRIBUTE_LABELS: [keyof Template['attributes'], string][] = [
  ['physique', 'PHY'],
  ['finesse', 'FIN'],
  ['mind', 'MND'],
  ['knowledge', 'KNW'],
  ['social', 'SOC'],
];

const formatSkillName = (key: string) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .replace(' Weapons', '');

// Top talents outside the base attributes, e.g. "Complex Melee 3"
const getHeadlineTalents = (t: Template) =>
  [
    ...Object.entries(t.weaponTalents),
    ...Object.entries(t.magicTalents),
    ...Object.entries(t.craftingTalents),
  ]
    .filter(([, v]) => v >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

const TemplateBrowser: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/templates')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load templates');
        return res.json();
      })
      .then(setTemplates)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter(
      (t) =>
        (category === 'all' || t.category === category) &&
        (!q ||
          t.name.toLowerCase().includes(q) ||
          t.modules.some((m) => m.moduleName.toLowerCase().includes(q)))
    );
  }, [templates, category, search]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--color-white)',
            marginBottom: '0.5rem',
          }}
        >
          Build Templates
        </h1>
        <p style={{ color: 'var(--color-cloud)', fontSize: '0.95rem' }}>
          Ready-made character builds. Open one to see the skills, actions and traits it ends up
          with at each stage of progression.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <input
          type="text"
          placeholder="Search templates or modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1 1 240px',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--color-dark-elevated)',
            border: '1px solid var(--color-dark-border)',
            borderRadius: '0.375rem',
            color: 'var(--color-white)',
          }}
        />
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              textTransform: 'capitalize',
              cursor: 'pointer',
              backgroundColor:
                category === c ? 'var(--color-sat-purple-faded)' : 'var(--color-dark-elevated)',
              border: `1px solid ${category === c ? 'var(--color-sat-purple)' : 'var(--color-dark-border)'}`,
              color: category === c ? 'var(--color-white)' : 'var(--color-cloud)',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: 'var(--color-cloud)' }}>Loading templates...</div>}
      {error && <div style={{ color: 'var(--color-sunset)' }}>{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ color: 'var(--color-cloud)' }}>No templates match.</div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {filtered.map((t) => {
          const maxStage = getTemplateMaxStage(t);
          return (
            <Link key={t._id} to={`/templates/${t._id}`} style={{ textDecoration: 'none' }}>
              <Card variant="default" hoverEffect={true}>
                <CardBody>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <h2
                      style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 700 }}
                    >
                      {t.name}
                    </h2>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        textTransform: 'capitalize',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: 'var(--color-dark-elevated)',
                        border: '1px solid var(--color-dark-border)',
                        color: 'var(--color-cloud)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t.category}
                    </span>
                  </div>

                  <p
                    style={{
                      color: 'var(--color-cloud)',
                      fontSize: '0.875rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {t.description}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: '0.25rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {ATTRIBUTE_LABELS.map(([key, label]) => (
                      <div key={key} style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            color: 'var(--color-metal-gold)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          {label}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <TalentDisplay talent={t.attributes[key]} maxTalent={4} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {getHeadlineTalents(t).length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.375rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {getHeadlineTalents(t).map(([key, value]) => (
                        <span
                          key={key}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            backgroundColor: 'var(--color-dark-elevated)',
                            color: 'var(--color-white)',
                          }}
                        >
                          {formatSkillName(key)}{' '}
                          <span style={{ color: 'var(--color-metal-gold)' }}>{value}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: '1px solid var(--color-dark-border)',
                      paddingTop: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>
                      {t.modules.map((m) => m.moduleName).join(', ')}
                    </span>
                    <span
                      style={{
                        color: TEMPLATE_STAGE_INFO[maxStage].color,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Up to {TEMPLATE_STAGE_INFO[maxStage].label}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateBrowser;

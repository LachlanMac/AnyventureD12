import React, { useEffect, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import SkillsOverview from '../components/character/SkillsOverview';
import ActionsTab from '../components/character/view/ActionsTab';
import TraitsTab from '../components/character/view/TraitsTab';
import CharacterStatsPanel from '../components/character/view/CharacterStatsPanel';
import { Character } from '../types/character';
import { DerivedTraitCategories } from '../types/template';

// Random commoner generator (unlinked page at /random). Rolls the data/random tables
// on the server and shows the resulting character; nothing is saved.

type TableKey = 'birth' | 'childhood' | 'origin' | 'occupation';
type IncludeKey =
  | TableKey
  | 'culture'
  | 'social'
  | 'age'
  | 'personality'
  | 'physical'
  | 'quirks'
  | 'special'
  | 'parents';

interface GeneratorOptions {
  ancestries: string[];
  culture: string[];
  social: string[];
  genders: string[];
  ageGroups: { key: string; name: string }[];
  birth: string[];
  childhood: string[];
  origin: string[];
  occupation: string[];
  personality: string[];
  physical: string[];
  special: string[];
  specialChance: number;
}

interface Settings {
  include: Record<IncludeKey, boolean>;
  locks: Partial<
    Record<
      | TableKey
      | 'ancestry'
      | 'gender'
      | 'culture'
      | 'social'
      | 'ageGroup'
      | 'personality'
      | 'physical'
      | 'special',
      string
    >
  >;
  counts: { personality: number; physical: number };
}

interface BackgroundElement {
  category: string;
  tone: 'positive' | 'negative' | 'neutral' | null;
  name: string;
  description: string;
  data: string;
  modules: Record<string, number>;
  injuries: string[];
}

interface Parent {
  role: 'mother' | 'father';
  name: string;
  occupation: string | null;
  status: 'alive' | 'dead' | 'unknown';
  age: number | null;
  diedYearsAgo: number | null;
  cause: string | null;
}

interface BiographyStyle {
  key: string;
  name: string;
}

interface WrittenBiography {
  style: string;
  text: string;
  truncated: boolean;
}

const STYLE_KEY = 'anyventure.randomGenerator.biographyStyle';

// Styling for the AI-written biography's Markdown
const biographyMarkdown: Components = {
  h1: ({ children }) => (
    <h1
      style={{
        color: 'var(--color-white)',
        fontSize: '1.5rem',
        fontWeight: 700,
        margin: '0 0 0.5rem',
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      style={{
        color: 'var(--color-old-gold)',
        fontSize: '1.1rem',
        fontWeight: 700,
        margin: '1.25rem 0 0.4rem',
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      style={{
        color: 'var(--color-white)',
        fontSize: '1rem',
        fontWeight: 600,
        margin: '1rem 0 0.3rem',
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ color: 'var(--color-cloud)', margin: '0 0 0.75rem', lineHeight: 1.65 }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', margin: '0 0 0.75rem' }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ listStyle: 'decimal', paddingLeft: '1.25rem', margin: '0 0 0.75rem' }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ color: 'var(--color-cloud)', marginBottom: '0.35rem', lineHeight: 1.6 }}>
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong style={{ color: 'var(--color-white)', fontWeight: 700 }}>{children}</strong>
  ),
  em: ({ children }) => <em style={{ color: 'var(--color-cloud)' }}>{children}</em>,
  hr: () => (
    <hr style={{ border: 0, borderTop: '1px solid var(--color-dark-border)', margin: '1rem 0' }} />
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: '3px solid var(--color-sat-purple)',
        paddingLeft: '0.75rem',
        margin: '0 0 0.75rem',
      }}
    >
      {children}
    </blockquote>
  ),
};

interface CommonerResult {
  character: Character & { derivedTraits?: DerivedTraitCategories };
  parents: Parent[];
  biography: string;
  profile: {
    name: string;
    gender: string;
    ancestry: string;
    ancestryOptions: { name: string; choice: string | null }[];
    age: number | null;
    ageGroup: string | null;
    birthplace: string | null;
    culture: {
      name: string;
      restriction: string | null;
      benefit: string | null;
      startingItem: { name: string; description: string } | null;
    } | null;
    height: string;
    weight: string;
    size: string;
    wealth: number | null;
    items: string[];
  };
  background: BackgroundElement[];
  quirks: { text: string; type: string }[];
  modules: { name: string; options: { location: string; name: string }[] }[];
}

type ResultTab = 'skills' | 'actions' | 'traits';

const SETTINGS_KEY = 'anyventure.randomGenerator.settings';

const DEFAULT_SETTINGS: Settings = {
  include: {
    culture: true,
    social: true,
    birth: true,
    childhood: true,
    origin: true,
    occupation: true,
    age: true,
    personality: true,
    physical: true,
    quirks: true,
    special: true,
    parents: true,
  },
  locks: {},
  counts: { personality: 2, physical: 1 },
};

// Remembered per browser; the page works the same if storage is unavailable
const loadSettings = (): Settings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw) as Partial<Settings>;
    return {
      include: { ...DEFAULT_SETTINGS.include, ...saved.include },
      locks: { ...saved.locks },
      counts: { ...DEFAULT_SETTINGS.counts, ...saved.counts },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const TONE_COLORS: Record<string, string> = {
  positive: 'var(--color-old-gold)',
  negative: 'var(--color-sunset)',
  neutral: 'var(--color-cloud)',
};

const labelStyle: React.CSSProperties = {
  color: 'var(--color-white)',
  fontSize: '0.875rem',
  fontWeight: 600,
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.375rem 0.5rem',
  borderRadius: '0.375rem',
  backgroundColor: 'var(--color-dark-elevated)',
  border: '1px solid var(--color-dark-border)',
  color: 'var(--color-white)',
  fontSize: '0.85rem',
};

const RandomGenerator: React.FC = () => {
  const [options, setOptions] = useState<GeneratorOptions | null>(null);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [result, setResult] = useState<CommonerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>('skills');
  const [copied, setCopied] = useState(false);
  const [styles, setStyles] = useState<BiographyStyle[]>([]);
  const [bioStyle, setBioStyle] = useState<string>(() => {
    try {
      return localStorage.getItem(STYLE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [written, setWritten] = useState<WrittenBiography | null>(null);
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [writtenCopied, setWrittenCopied] = useState(false);

  const chooseStyle = (key: string) => {
    setBioStyle(key);
    try {
      localStorage.setItem(STYLE_KEY, key);
    } catch {
      // storage unavailable; the choice just won't persist
    }
  };

  // Send the brief to the local AI server with the chosen style's system prompt
  const writeBiography = async () => {
    if (!result || !bioStyle) return;
    setWriting(true);
    setWriteError(null);
    try {
      const res = await fetch('/api/random/biography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style: bioStyle, brief: result.biography }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Writing the biography failed');
      setWritten(data);
    } catch (err) {
      setWriteError((err as Error).message);
    } finally {
      setWriting(false);
    }
  };

  const copyWritten = async () => {
    if (!written) return;
    try {
      await navigator.clipboard.writeText(written.text);
      setWrittenCopied(true);
      setTimeout(() => setWrittenCopied(false), 1500);
    } catch {
      setWriteError('Could not copy to the clipboard; select the text and copy it instead.');
    }
  };

  const copyBiography = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.biography);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Could not copy to the clipboard; select the text and copy it instead.');
    }
  };

  const parentText = (p: Parent) => {
    const job = p.occupation ? p.occupation : 'unknown trade';
    if (p.status === 'unknown') return `Fate unknown · last known as ${job.toLowerCase()}`;
    if (p.status === 'dead') {
      const when = p.diedYearsAgo ? ` ${p.diedYearsAgo} years ago` : '';
      const atAge = p.age !== null ? ` at ${p.age}` : '';
      return `${job} · died${p.cause ? ` of ${p.cause}` : ''}${when}${atAge}`;
    }
    return `${job} · alive${p.age !== null ? `, ${p.age}` : ''}`;
  };

  useEffect(() => {
    fetch('/api/random/options')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load generator options');
        return res.json();
      })
      .then(setOptions)
      .catch((err: Error) => setError(err.message));
    fetch('/api/random/biography-styles')
      .then((res) => (res.ok ? res.json() : []))
      .then((list: BiographyStyle[]) => {
        setStyles(list);
        setBioStyle((current) =>
          list.some((st) => st.key === current) ? current : (list[0]?.key ?? '')
        );
      })
      .catch(() => setStyles([]));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // storage unavailable; settings just won't persist
    }
  }, [settings]);

  const setInclude = (key: IncludeKey, value: boolean) =>
    setSettings((s) => ({ ...s, include: { ...s.include, [key]: value } }));
  const setLock = (key: keyof Settings['locks'], value: string) =>
    setSettings((s) => ({ ...s, locks: { ...s.locks, [key]: value || undefined } }));
  const setCount = (key: keyof Settings['counts'], value: number) =>
    setSettings((s) => ({ ...s, counts: { ...s.counts, [key]: value } }));

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/random/commoner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Generation failed');
      setResult(data);
      setWritten(null); // the old biography belongs to the old character
      setWriteError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // One option row: a single dropdown of Disabled / Random / a specific pick.
  // includeKey null = can't be disabled (ancestry, gender); lockKey null = nothing to pick (quirks).
  const DISABLED = '__disabled__';
  const RANDOM = '__random__';
  const renderRow = (
    label: string,
    includeKey: IncludeKey | null,
    lockKey: keyof Settings['locks'] | null,
    values: { value: string; label: string }[],
    extra?: React.ReactNode,
    randomLabel = 'Random'
  ) => {
    const enabled = includeKey ? settings.include[includeKey] : true;
    const value = !enabled ? DISABLED : (lockKey && settings.locks[lockKey]) || RANDOM;
    const onChange = (v: string) => {
      if (includeKey) setInclude(includeKey, v !== DISABLED);
      if (lockKey) setLock(lockKey, v === DISABLED || v === RANDOM ? '' : v);
    };
    return (
      <div
        key={label}
        style={{
          display: 'grid',
          gridTemplateColumns: '9rem 1fr',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <label style={labelStyle}>{label}</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {enabled && extra}
          <select
            style={{ ...selectStyle, opacity: enabled ? 1 : 0.6 }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {includeKey && <option value={DISABLED}>Disabled</option>}
            <option value={RANDOM}>{randomLabel}</option>
            {values.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const asValues = (list: string[] = []) => list.map((v) => ({ value: v, label: v }));

  const countInput = (key: keyof Settings['counts'], max: number, includeKey: IncludeKey) => (
    <input
      type="number"
      min={0}
      max={max}
      value={settings.counts[key]}
      disabled={!settings.include[includeKey]}
      title="How many to roll"
      onChange={(e) => setCount(key, Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
      style={{ ...selectStyle, width: '4rem' }}
    />
  );

  const profile = result?.profile;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <h1
        style={{
          color: 'var(--color-white)',
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: '0.25rem',
        }}
      >
        Commoner Generator
      </h1>
      <p style={{ color: 'var(--color-cloud)', marginBottom: '1rem' }}>
        Roll a commoner from the background tables. Each row can be disabled, left random, or set to
        a specific entry.
      </p>

      <Card variant="default" style={{ marginBottom: '1rem' }}>
        <CardBody>
          {!options ? (
            <div style={{ color: 'var(--color-cloud)' }}>{error || 'Loading options...'}</div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '0.75rem 2rem',
              }}
            >
              {renderRow('Ancestry', null, 'ancestry', asValues(options.ancestries))}
              {renderRow('Gender', null, 'gender', asValues(options.genders))}
              {renderRow('Culture', 'culture', 'culture', asValues(options.culture))}
              {renderRow('Social Module', 'social', 'social', asValues(options.social))}
              {renderRow(
                'Age',
                'age',
                'ageGroup',
                options.ageGroups.map((g) => ({ value: g.key, label: g.name }))
              )}
              {renderRow('Birth', 'birth', 'birth', asValues(options.birth))}
              {renderRow('Childhood', 'childhood', 'childhood', asValues(options.childhood))}
              {renderRow('Origin', 'origin', 'origin', asValues(options.origin))}
              {renderRow('Occupation', 'occupation', 'occupation', asValues(options.occupation))}
              {renderRow(
                'Personality',
                'personality',
                'personality',
                asValues(options.personality),
                countInput('personality', 5, 'personality')
              )}
              {renderRow(
                'Physical',
                'physical',
                'physical',
                asValues(options.physical),
                countInput('physical', 4, 'physical')
              )}
              {renderRow('Quirks', 'quirks', null, [])}
              {renderRow('Parents', 'parents', null, [])}
              {renderRow(
                'Rare Trait',
                'special',
                'special',
                asValues(options.special),
                undefined,
                `Random (${options.specialChance}% chance)`
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              onClick={generate}
              disabled={loading || !options}
              style={{
                padding: '0.625rem 1.5rem',
                borderRadius: '0.375rem',
                fontWeight: 700,
                backgroundColor: 'var(--color-sat-purple)',
                color: 'var(--color-white)',
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading || !options ? 0.6 : 1,
              }}
            >
              {loading ? 'Rolling...' : result ? 'Reroll' : 'Generate'}
            </button>
            <button
              onClick={() => setSettings(DEFAULT_SETTINGS)}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: 'transparent',
                color: 'var(--color-cloud)',
                border: '1px solid var(--color-dark-border)',
                cursor: 'pointer',
              }}
            >
              Reset options
            </button>
          </div>
          {error && options && (
            <p style={{ color: 'var(--color-sunset)', marginTop: '0.75rem' }}>{error}</p>
          )}
        </CardBody>
      </Card>

      {result && profile && (
        <>
          {/* Who they are */}
          <Card variant="default" style={{ marginBottom: '1rem' }}>
            <CardBody>
              <h2 style={{ color: 'var(--color-white)', fontSize: '1.5rem', fontWeight: 700 }}>
                {profile.name}
              </h2>
              <div style={{ color: 'var(--color-cloud)', marginTop: '0.25rem' }}>
                {[
                  profile.gender,
                  profile.ancestry,
                  profile.age !== null ? `${profile.age} years (${profile.ageGroup})` : null,
                  profile.height,
                  profile.weight,
                  profile.size,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
              {profile.birthplace && (
                <div style={{ color: 'var(--color-cloud)', marginTop: '0.25rem' }}>
                  Born {profile.birthplace.charAt(0).toLowerCase() + profile.birthplace.slice(1)}
                </div>
              )}
              {profile.culture && (
                <div style={{ color: 'var(--color-cloud)', marginTop: '0.25rem' }}>
                  {profile.culture.name} culture
                  {profile.culture.startingItem && (
                    <span title={profile.culture.startingItem.description}>
                      {' '}
                      · carries a {profile.culture.startingItem.name}
                    </span>
                  )}
                </div>
              )}
              {profile.ancestryOptions.some((o) => o.choice) && (
                <div style={{ color: 'var(--color-cloud)', marginTop: '0.25rem' }}>
                  {profile.ancestryOptions
                    .filter((o) => o.choice)
                    .map((o) => `${o.name}: ${o.choice}`)
                    .join(' · ')}
                </div>
              )}
              {(profile.wealth !== null || profile.items.length > 0) && (
                <div style={{ color: 'var(--color-white)', marginTop: '0.5rem' }}>
                  {profile.wealth !== null && <span>Wealth: {profile.wealth}</span>}
                  {profile.items.length > 0 && (
                    <span style={{ marginLeft: profile.wealth !== null ? '1rem' : 0 }}>
                      Items: {profile.items.join(', ')}
                    </span>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {/* What they've lived through */}
          <Card variant="default" style={{ marginBottom: '1rem' }}>
            <CardHeader>
              <h3 style={{ color: 'var(--color-white)', fontSize: '1.15rem', fontWeight: 700 }}>
                Background
              </h3>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {result.background.map((e, i) => (
                  <div
                    key={`${e.category}-${e.name}-${i}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '7rem 1fr',
                      gap: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--color-cloud)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        paddingTop: '0.2rem',
                      }}
                    >
                      {e.category}
                    </div>
                    <div>
                      <div
                        style={{
                          color: e.tone ? TONE_COLORS[e.tone] : 'var(--color-white)',
                          fontWeight: 600,
                        }}
                      >
                        {e.name}
                        {Object.keys(e.modules || {}).length > 0 && (
                          <span
                            style={{
                              color: 'var(--color-cloud)',
                              fontWeight: 400,
                              fontSize: '0.8rem',
                              marginLeft: '0.5rem',
                            }}
                          >
                            grants{' '}
                            {Object.entries(e.modules)
                              .map(([m, pts]) => `${m.replace(/_/g, ' ')} (${pts})`)
                              .join(', ')}
                          </span>
                        )}
                      </div>
                      {e.description && (
                        <div style={{ color: 'var(--color-cloud)', fontSize: '0.85rem' }}>
                          {e.description}
                        </div>
                      )}
                      {e.injuries?.length > 0 && (
                        <div style={{ color: 'var(--color-sunset)', fontSize: '0.8rem' }}>
                          Injury: {e.injuries.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {result.quirks.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '7rem 1fr', gap: '0.75rem' }}>
                    <div
                      style={{
                        color: 'var(--color-cloud)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Quirks
                    </div>
                    <div style={{ color: 'var(--color-white)' }}>
                      {result.quirks.map((q) => q.text).join('. ')}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {result.parents.length > 0 && (
            <Card variant="default" style={{ marginBottom: '1rem' }}>
              <CardHeader>
                <h3 style={{ color: 'var(--color-white)', fontSize: '1.15rem', fontWeight: 700 }}>
                  Parents
                </h3>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {result.parents.map((par) => (
                    <div
                      key={par.role}
                      style={{ display: 'grid', gridTemplateColumns: '7rem 1fr', gap: '0.75rem' }}
                    >
                      <div
                        style={{
                          color: 'var(--color-cloud)',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          paddingTop: '0.2rem',
                        }}
                      >
                        {par.role}
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>
                          {par.name}
                        </span>
                        <span
                          style={{
                            color:
                              par.status === 'alive' ? 'var(--color-cloud)' : 'var(--color-sunset)',
                            marginLeft: '0.5rem',
                            fontSize: '0.85rem',
                          }}
                        >
                          {parentText(par)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* AI-written biography from the brief below, in the chosen style */}
          <Card variant="default" style={{ marginBottom: '1rem' }}>
            <CardHeader>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <h3 style={{ color: 'var(--color-white)', fontSize: '1.15rem', fontWeight: 700 }}>
                  Biography
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select
                    style={{ ...selectStyle, width: 'auto' }}
                    value={bioStyle}
                    onChange={(e) => chooseStyle(e.target.value)}
                    disabled={styles.length === 0}
                  >
                    {styles.length === 0 && <option value="">No styles</option>}
                    {styles.map((st) => (
                      <option key={st.key} value={st.key}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={writeBiography}
                    disabled={writing || !bioStyle}
                    style={{
                      padding: '0.375rem 0.875rem',
                      borderRadius: '0.375rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-sat-purple)',
                      color: 'var(--color-white)',
                      border: 'none',
                      cursor: writing || !bioStyle ? 'default' : 'pointer',
                      opacity: writing || !bioStyle ? 0.6 : 1,
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {writing ? 'Writing...' : written ? 'Rewrite' : 'Write'}
                  </button>
                  {written && (
                    <button
                      onClick={copyWritten}
                      style={{
                        padding: '0.375rem 0.875rem',
                        borderRadius: '0.375rem',
                        backgroundColor: 'var(--color-dark-elevated)',
                        border: '1px solid var(--color-dark-border)',
                        color: writtenCopied ? 'var(--color-old-gold)' : 'var(--color-white)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      {writtenCopied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {writeError && (
                <div style={{ color: 'var(--color-sunset)', marginBottom: '0.5rem' }}>
                  {writeError}
                </div>
              )}
              {written ? (
                <>
                  <div style={{ fontSize: '0.95rem' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={biographyMarkdown}>
                      {written.text}
                    </ReactMarkdown>
                  </div>
                  {written.truncated && (
                    <div
                      style={{
                        color: 'var(--color-cloud)',
                        fontSize: '0.8rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      The AI hit its length limit, so this may be cut off.
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: 'var(--color-cloud)', fontSize: '0.9rem' }}>
                  {writing
                    ? 'Writing with the local AI server. This can take 10 to 30 seconds.'
                    : 'Pick a style and press Write to turn the brief below into a biography.'}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Plain-text facts to hand to an AI model for writing a biography */}
          <Card variant="default" style={{ marginBottom: '1rem' }}>
            <CardHeader>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <h3 style={{ color: 'var(--color-white)', fontSize: '1.15rem', fontWeight: 700 }}>
                  Biography Brief
                </h3>
                <button
                  onClick={copyBiography}
                  style={{
                    padding: '0.375rem 0.875rem',
                    borderRadius: '0.375rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    border: '1px solid var(--color-dark-border)',
                    color: copied ? 'var(--color-old-gold)' : 'var(--color-white)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  color: 'var(--color-cloud)',
                  maxHeight: '28rem',
                  overflowY: 'auto',
                  margin: 0,
                }}
              >
                {result.biography}
              </pre>
            </CardBody>
          </Card>

          <CharacterStatsPanel character={result.character} />

          <div
            style={{
              display: 'flex',
              gap: '0.25rem',
              borderBottom: '1px solid var(--color-dark-border)',
              marginBottom: '1rem',
            }}
          >
            {(
              [
                ['skills', 'Skills'],
                ['actions', 'Actions & Reactions'],
                ['traits', 'Traits'],
              ] as [ResultTab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  padding: '0.625rem 1rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === id ? 'var(--color-sat-purple)' : 'transparent'}`,
                  color: activeTab === id ? 'var(--color-white)' : 'var(--color-cloud)',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'skills' && <SkillsOverview character={result.character} />}
          {activeTab === 'actions' && <ActionsTab character={result.character} />}
          {activeTab === 'traits' && <TraitsTab character={result.character} characterId="" />}
        </>
      )}
    </div>
  );
};

export default RandomGenerator;

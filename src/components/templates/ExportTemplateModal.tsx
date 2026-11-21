import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { TEMPLATE_STAGE_INFO, TemplateStage } from '../../types/template';

interface ExportTemplateModalProps {
  characterId: string;
  characterName: string;
  onClose: () => void;
}

// Shape returned by GET /api/characters/:id/plan/export (the data/templates file format)
interface ExportedTemplate {
  name: string;
  modules: { module: string; options: Record<string, number> }[];
  spells: string[];
  sorcererSpells: string[];
  thiefSpells: string[];
  extraTraining: string[];
}

interface TemplateBudget {
  attributePoints: number;
  talentStars: number;
  // cumulative module points at each stage used, e.g. { 1: 15, 2: 25 }
  stageTotals: Record<string, number>;
  errors: string[];
}

const CATEGORIES = ['martial', 'magic', 'hybrid', 'support', 'utility'];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  backgroundColor: 'var(--color-dark-elevated)',
  border: '1px solid var(--color-dark-border)',
  borderRadius: '0.375rem',
  color: 'var(--color-white)',
  fontSize: '0.875rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: 'var(--color-cloud)',
  fontSize: '0.8rem',
  marginBottom: '0.25rem',
};

const ExportTemplateModal: React.FC<ExportTemplateModalProps> = ({
  characterId,
  characterName,
  onClose,
}) => {
  const [name, setName] = useState(characterName);
  const [category, setCategory] = useState('martial');
  const [description, setDescription] = useState('');
  const [playstyle, setPlaystyle] = useState('');

  const [preview, setPreview] = useState<ExportedTemplate | null>(null);
  const [budget, setBudget] = useState<TemplateBudget | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOverwrite, setConfirmOverwrite] = useState<string | null>(null);
  const [result, setResult] = useState<{
    templateId: string;
    fileName: string;
    warnings: string[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/characters/${characterId}/plan/export`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Could not read build'))))
      .then((data: { template: ExportedTemplate; budget: TemplateBudget }) => {
        setPreview(data.template);
        setBudget(data.budget);
      })
      .catch((err) => setError(err.message));
  }, [characterId]);

  const save = async (overwrite: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/characters/${characterId}/plan/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, category, description, playstyle, overwrite }),
      });
      const data = await res.json();
      if (res.status === 409 && data.exists) {
        setConfirmOverwrite(data.message);
      } else if (!res.ok) {
        setError(data.message || 'Export failed');
      } else {
        setConfirmOverwrite(null);
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setSaving(false);
    }
  };

  // Count options per stage for the summary
  const stageCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const m of preview?.modules || []) {
    for (const s of Object.values(m.options)) stageCounts[s] = (stageCounts[s] || 0) + 1;
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-dark-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '0.5rem',
          padding: '1.25rem',
        }}
      >
        <h2
          style={{
            color: 'var(--color-white)',
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '0.25rem',
          }}
        >
          Export as Template
        </h2>
        <p style={{ color: 'var(--color-cloud)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Saves this character&apos;s attributes, talents, spells and module plan as an official
          template in <code>data/templates/</code>. Modules come only from the plan; what the
          character has actually taken is ignored. Ancestry and starting trait are not included.
        </p>

        {result ? (
          <div>
            <p style={{ color: 'rgb(34, 197, 94)', marginBottom: '0.5rem' }}>
              Saved to <code>data/templates/{result.fileName}</code>.
            </p>
            {result.warnings.length > 0 && (
              <div
                style={{
                  color: 'var(--color-sunset)',
                  fontSize: '0.8rem',
                  marginBottom: '0.75rem',
                }}
              >
                {result.warnings.map((w) => (
                  <div key={w}>{w}</div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Link to={`/templates/${result.templateId}`}>
                <Button variant="accent">View Template</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {preview && (
              <div
                style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  borderRadius: '0.375rem',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  color: 'var(--color-cloud)',
                }}
              >
                <div style={{ color: 'var(--color-white)', marginBottom: '0.25rem' }}>
                  {preview.modules.length} modules:{' '}
                  {preview.modules.map((m) => m.module).join(', ') || 'none'}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {([1, 2, 3, 4] as TemplateStage[])
                    .filter((s) => stageCounts[s] > 0)
                    .map((s) => (
                      <span key={s} style={{ color: TEMPLATE_STAGE_INFO[s].color }}>
                        {TEMPLATE_STAGE_INFO[s].label}: {stageCounts[s]} options
                      </span>
                    ))}
                </div>
                <div style={{ marginTop: '0.25rem' }}>
                  Spells: {preview.spells.length} · Sorcerer: {preview.sorcererSpells.length} ·
                  Thief: {preview.thiefSpells.length}
                </div>
                <div style={{ marginTop: '0.25rem' }}>
                  Extra Training:{' '}
                  {preview.extraTraining.length > 0 ? preview.extraTraining.join(', ') : 'none'}
                </div>
                {budget && (
                  <div
                    style={{
                      marginTop: '0.25rem',
                      color: budget.errors.length ? 'var(--color-sunset)' : 'var(--color-cloud)',
                    }}
                  >
                    Talent stars: {budget.talentStars} / 8 · Attribute points:{' '}
                    {budget.attributePoints} / 6
                  </div>
                )}
                {budget && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                      marginTop: '0.25rem',
                    }}
                  >
                    Module points:
                    {Object.entries(budget.stageTotals).map(([s, total]) => {
                      const info = TEMPLATE_STAGE_INFO[Number(s) as TemplateStage];
                      const exact = total === info.points;
                      return (
                        <span key={s} style={{ color: exact ? info.color : 'var(--color-sunset)' }}>
                          {info.label} {total} / {info.points}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {budget && budget.errors.length > 0 && (
              <div
                style={{
                  color: 'var(--color-sunset)',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  border: '1px solid var(--color-sunset)',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                  Can&apos;t export yet. Each stage must use exactly 15 / 25 / 35 / 45 module
                  points, and the build must fit the base creation budget (ancestry and starting
                  trait are ignored).
                </div>
                {budget.errors.map((e) => (
                  <div key={e}>{e}</div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Template name</label>
                <input
                  style={inputStyle}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setConfirmOverwrite(null);
                  }}
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  style={{ ...inputStyle, textTransform: 'capitalize' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: '4rem' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>How to play it (optional)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: '4rem' }}
                  value={playstyle}
                  onChange={(e) => setPlaystyle(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p
                style={{
                  color: 'var(--color-sunset)',
                  fontSize: '0.85rem',
                  marginBottom: '0.75rem',
                }}
              >
                {error}
              </p>
            )}
            {confirmOverwrite && (
              <p
                style={{
                  color: 'var(--color-metal-gold)',
                  fontSize: '0.85rem',
                  marginBottom: '0.75rem',
                }}
              >
                {confirmOverwrite}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              {confirmOverwrite ? (
                <Button variant="accent" onClick={() => save(true)} disabled={saving}>
                  {saving ? 'Saving...' : 'Overwrite'}
                </Button>
              ) : (
                <Button
                  variant="accent"
                  onClick={() => save(false)}
                  disabled={saving || !name.trim() || !preview || !!budget?.errors.length}
                >
                  {saving ? 'Saving...' : 'Save Template'}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExportTemplateModal;

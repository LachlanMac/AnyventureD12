import React, { useEffect, useState } from 'react';
import Card, { CardBody } from '../components/ui/Card';

interface Harmony { instrument: string; effect: string }
interface SongRow {
  id?: number;
  name: string;
  type: 'song' | 'ballad';
  magical: boolean;
  difficulty: number;
  description?: string;
  effect?: string;
  harmony_1?: Harmony | null;
  harmony_2?: Harmony | null;
  _file?: string;
}

const SongCompendium: React.FC = () => {
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'song' | 'ballad'>('all');
  const [magicalFilter, setMagicalFilter] = useState<'all' | 'yes' | 'no'>('all');

  // Sorting
  const [sortField, setSortField] = useState<'name' | 'type' | 'difficulty' | 'magical'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch('/api/songs');
        if (!res.ok) throw new Error('failed to fetch songs');
        const data = await res.json();
        setSongs(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filtered = songs
    .filter((s) => (typeFilter === 'all' ? true : s.type === typeFilter))
    .filter((s) => (magicalFilter === 'all' ? true : s.magical === (magicalFilter === 'yes')))
    .filter((s) => {
      if (!searchTerm.trim()) return true;
      const t = searchTerm.toLowerCase();
      return (
        (s.name || '').toLowerCase().includes(t) ||
        (s.description || '').toLowerCase().includes(t) ||
        (s.effect || '').toLowerCase().includes(t) ||
        (s.harmony_1?.effect || '').toLowerCase().includes(t) ||
        (s.harmony_2?.effect || '').toLowerCase().includes(t)
      );
    })
    .sort((a, b) => {
      let comp = 0;
      switch (sortField) {
        case 'name':
          comp = (a.name || '').localeCompare(b.name || '');
          break;
        case 'type':
          comp = (a.type || '').localeCompare(b.type || '');
          break;
        case 'difficulty':
          comp = (a.difficulty || 0) - (b.difficulty || 0);
          break;
        case 'magical':
          comp = (a.magical ? 1 : 0) - (b.magical ? 1 : 0);
          break;
      }
      return sortDirection === 'asc' ? comp : -comp;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="default"><CardBody>error: {error}</CardBody></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-white)', fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Song Compendium</h1>
        <p style={{ color: 'var(--color-cloud)', fontSize: '1.125rem' }}>Browse songs and ballads</p>
      </div>

      <Card variant="default" style={{ marginBottom: '2rem' }}>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="search songs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', backgroundColor: 'var(--color-dark-elevated)', color: 'var(--color-white)', border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem', padding: '0.75rem 1rem', paddingLeft: '2.5rem'
                }}
              />
              <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-cloud)' }}>🔎</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="type-filter" style={{ display: 'block', color: 'var(--color-cloud)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Type</label>
                <select id="type-filter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}
                  style={{ width: '100%', backgroundColor: 'var(--color-dark-elevated)', color: 'var(--color-white)', border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem', padding: '0.5rem' }}>
                  <option value="all">Any</option>
                  <option value="song">Song</option>
                  <option value="ballad">Ballad</option>
                </select>
              </div>
              <div>
                <label htmlFor="magical-filter" style={{ display: 'block', color: 'var(--color-cloud)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Magical</label>
                <select id="magical-filter" value={magicalFilter} onChange={(e) => setMagicalFilter(e.target.value as any)}
                  style={{ width: '100%', backgroundColor: 'var(--color-dark-elevated)', color: 'var(--color-white)', border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem', padding: '0.5rem' }}>
                  <option value="all">Any</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem', alignSelf: 'end' }}>Found {filtered.length} {filtered.length === 1 ? 'song' : 'songs'}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card variant="default">
        <CardBody style={{ padding: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(260px,1fr) 160px 140px 140px',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-dark-elevated)',
                borderBottom: '2px solid var(--color-dark-border)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                alignItems: 'center',
              }}
            >
              <button onClick={() => handleSort('name')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sortField === 'name' ? 'var(--color-metal-gold)' : 'var(--color-cloud)', fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'left' }}>
                name {sortField === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </button>
              <button onClick={() => handleSort('type')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sortField === 'type' ? 'var(--color-metal-gold)' : 'var(--color-cloud)', fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                type {sortField === 'type' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </button>
              <button onClick={() => handleSort('difficulty')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sortField === 'difficulty' ? 'var(--color-metal-gold)' : 'var(--color-cloud)', fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                difficulty {sortField === 'difficulty' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </button>
              <button onClick={() => handleSort('magical')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sortField === 'magical' ? 'var(--color-metal-gold)' : 'var(--color-cloud)', fontWeight: 'bold', fontSize: '0.875rem', textAlign: 'center' }}>
                magical {sortField === 'magical' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </button>
            </div>

            {filtered.map((s, idx) => (
              <div
                key={(s.id ?? idx) + (s._file || '')}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(260px,1fr) 160px 140px 140px',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--color-dark-border)' : 'none',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (s.id != null) {
                    window.location.href = `/songs/${s.id}`;
                  }
                }}
              >
                <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>{s.name}</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span
                    style={{
                      color: 'var(--color-cloud)',
                      textTransform: 'capitalize',
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      border: '1px solid var(--color-dark-border)'
                    }}
                  >
                    {s.type}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span
                    style={{
                      color: 'var(--color-white)',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '0.25rem',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--color-dark-border)'
                    }}
                  >
                    {s.difficulty ?? '-'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span
                    style={{
                      color: s.magical ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: s.magical ? 'rgba(215, 183, 64, 0.15)' : 'rgba(255,255,255,0.04)',
                      border: s.magical ? '1px solid rgba(215, 183, 64, 0.35)' : '1px solid var(--color-dark-border)'
                    }}
                  >
                    {s.magical ? 'yes' : 'no'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SongCompendium;

import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import { useCharacter } from '../hooks/useCharacters';
import { useSongs } from '../hooks/useSongs';
import { songsApi } from '../api/songs';

const SongsPage: React.FC = () => {
  const { id: characterId } = useParams<{ id: string }>();
  const { data: character, loading: characterLoading, error: characterError, refetch: refetchCharacter } = useCharacter(characterId);
  const { data: allSongs, loading: songsLoading, error: songsError } = useSongs();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all'|'song'|'ballad'>('all');
  const [magicalFilter, setMagicalFilter] = useState<'all'|'yes'|'no'>('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [songNote, setSongNote] = useState('');

  const learnedIds = useMemo(() => new Set((character && 'songs' in character ? (character as any).songs : []).map((s: any)=> (typeof s.songId==='string'? s.songId : s.songId?._id))), [character]);
  const isLearned = (songId: string) => learnedIds.has(songId);

  const filtered = useMemo(()=>{
    let list = allSongs || [];
    if (typeFilter!=='all') list = list.filter((s:any)=> s.type===typeFilter);
    if (magicalFilter!=='all') list = list.filter((s:any)=> s.magical === (magicalFilter==='yes'));
    if (search.trim()) {
      const t = search.toLowerCase().trim();
      list = list.filter((s:any)=> (s.name||'').toLowerCase().includes(t) || (s.description||'').toLowerCase().includes(t) || (s.effect||'').toLowerCase().includes(t));
    }
    // Sort: learned first, then type, then name (to match spells UX)
    return list.sort((a:any,b:any)=>{
      const aLearned = isLearned(a._id);
      const bLearned = isLearned(b._id);
      if (aLearned && !bLearned) return -1;
      if (!aLearned && bLearned) return 1;
      if (a.type !== b.type) return String(a.type).localeCompare(String(b.type));
      return String(a.name).localeCompare(String(b.name));
    });
  },[allSongs, typeFilter, magicalFilter, search]);

  const handleAdd = async (songId: string) => {
    if (!characterId) return;
    try{
      if (isLearned(songId)) return;
      setActionLoading(true);
      await songsApi.addToCharacter(characterId, songId, songNote);
      await refetchCharacter();
    } finally { setActionLoading(false); }
  };
  const handleRemove = async (songId: string) => {
    if (!characterId) return;
    try{ setActionLoading(true); await songsApi.removeFromCharacter(characterId, songId); await refetchCharacter(); } finally { setActionLoading(false); }
  };

  const loading = characterLoading || songsLoading;
  const error = characterError || songsError;
  if (loading) return <LoadingSpinner size="lg" message="Loading songs..."/>;
  if (error || !character) return (
    <div className="container mx-auto px-4 py-8"><ErrorState title="Failed to Load Character Songs" message={error || 'Character not found'} onRetry={()=> (window.location.href=`/characters/${characterId}`)} retryText="Return to Character" size="lg" /></div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
        <h1 style={{ color:'var(--color-white)', fontFamily:'var(--font-display)', fontSize:'2.5rem', fontWeight:'bold' }}>Character Songs</h1>
      </div>

      <div style={{ marginBottom:'1.5rem' }}>
        <Link to={`/characters/${characterId}`}><Button variant="secondary">&larr; Back to Character</Button></Link>
      </div>

      {/* Filters */}
      <Card variant="default" style={{ marginBottom:'1.5rem' }}>
        <CardHeader><h2 style={{ color:'var(--color-white)', fontSize:'1.25rem', fontWeight:'bold' }}>Filter Songs</h2></CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label style={{ color:'var(--color-cloud)', fontSize:'0.875rem', marginBottom:'0.5rem', display:'block' }}>Search</label>
              <input value={search} onChange={(e)=> setSearch(e.target.value)} placeholder="search songs..." style={{ width:'100%', backgroundColor:'var(--color-dark-elevated)', color:'var(--color-white)', border:'1px solid var(--color-dark-border)', borderRadius:'0.375rem', padding:'0.5rem' }} />
            </div>
            <div>
              <label style={{ color:'var(--color-cloud)', fontSize:'0.875rem', marginBottom:'0.5rem', display:'block' }}>Type</label>
              <select value={typeFilter} onChange={(e)=> setTypeFilter(e.target.value as any)} style={{ width:'100%', backgroundColor:'var(--color-dark-elevated)', color:'var(--color-white)', border:'1px solid var(--color-dark-border)', borderRadius:'0.375rem', padding:'0.5rem' }}>
                <option value="all">Any</option>
                <option value="song">Song</option>
                <option value="ballad">Ballad</option>
              </select>
            </div>
            <div>
              <label style={{ color:'var(--color-cloud)', fontSize:'0.875rem', marginBottom:'0.5rem', display:'block' }}>Magical</label>
              <select value={magicalFilter} onChange={(e)=> setMagicalFilter(e.target.value as any)} style={{ width:'100%', backgroundColor:'var(--color-dark-elevated)', color:'var(--color-white)', border:'1px solid var(--color-dark-border)', borderRadius:'0.375rem', padding:'0.5rem' }}>
                <option value="all">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: list */}
        <div className="md:col-span-1">
          <Card variant="default">
            <CardHeader>
              <h2 style={{ color:'var(--color-white)', fontSize:'1.25rem', fontWeight:'bold' }}>Available Songs</h2>
              <div style={{ color:'var(--color-cloud)', fontSize:'0.875rem' }}>{filtered.length} songs found</div>
            </CardHeader>
            <CardBody>
              {filtered.length===0 ? (
                <div style={{ color:'var(--color-cloud)', textAlign:'center' }}>No songs match your filters</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', maxHeight:'600px', overflowY:'auto', paddingRight:'0.25rem' }}>
                  {filtered.map((s:any)=>{
                    const learned = isLearned(s._id);
                    const selectedId = (selected && selected._id) || null;
                    return (
                      <div key={s._id}
                        onClick={()=> setSelected(s)}
                        style={{
                          padding:'0.75rem 1rem',
                          borderRadius:'0.375rem',
                          backgroundColor: learned ? 'var(--color-sat-purple-faded)' : 'var(--color-dark-elevated)',
                          cursor:'pointer',
                          border: selectedId===s._id ? '1px solid var(--color-metal-gold)' : learned ? '1px solid var(--color-sat-purple)' : '1px solid transparent',
                        }}
                      >
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div>
                            <div style={{ color:'var(--color-white)', fontWeight:'bold' }}>{s.name}</div>
                            <div style={{ color:'var(--color-cloud)', fontSize:'0.75rem', display:'flex', gap:'0.5rem' }}>
                              <span style={{ textTransform:'capitalize' }}>{s.type}</span>
                              <span>•</span>
                              <span>{s.magical ? 'magical' : 'non-magical'}</span>
                            </div>
                          </div>
                          <div>
                            {learned ? (
                              <span style={{ color:'var(--color-metal-gold)', fontSize:'0.75rem' }}>learned</span>
                            ) : (
                              <span style={{ color:'var(--color-cloud)', fontSize:'0.75rem' }}>available</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: details */}
        <div className="md:col-span-2">
          <Card variant="default">
            <CardHeader>
              <h2 style={{ color:'var(--color-white)', fontSize:'1.25rem', fontWeight:'bold' }}>Song Details</h2>
            </CardHeader>
            <CardBody>
              {selected ? (
                <>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <h3 style={{ color:'var(--color-white)', fontSize:'1.25rem', fontWeight:'bold' }}>{selected.name}</h3>
                      <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.25rem' }}>
                        <span style={{ textTransform:'capitalize', fontSize:'0.75rem', padding:'0.125rem 0.5rem', borderRadius:'9999px', border:'1px solid var(--color-dark-border)', color:'var(--color-cloud)' }}>{selected.type}</span>
                        <span style={{ fontSize:'0.75rem', padding:'0.125rem 0.5rem', borderRadius:'0.25rem', backgroundColor:'rgba(255,255,255,0.06)', border:'1px solid var(--color-dark-border)', color:'var(--color-cloud)' }}>difficulty: {selected.difficulty}</span>
                        {selected.magical && (<span style={{ fontSize:'0.75rem', padding:'0.125rem 0.5rem', borderRadius:'9999px', backgroundColor:'rgba(215,183,64,0.15)', border:'1px solid rgba(215,183,64,0.35)', color:'var(--color-metal-gold)' }}>magical</span>)}
                      </div>
                    </div>
                    {!isLearned(selected._id) ? (
                      <Button variant="accent" onClick={()=> handleAdd(selected._id)} disabled={actionLoading}>
                        {actionLoading ? 'Processing...' : 'Learn Song'}
                      </Button>
                    ) : (
                      <Button variant="secondary" onClick={()=> handleRemove(selected._id)} disabled={actionLoading}>
                        {actionLoading ? 'Processing...' : 'Forget Song'}
                      </Button>
                    )}
                  </div>

                  {selected.description && (
                    <div style={{ marginTop:'1rem' }}>
                      <h4 style={{ color:'var(--color-white)', fontWeight:'bold' }}>Description</h4>
                      <p style={{ color:'var(--color-cloud)' }}>{selected.description}</p>
                    </div>
                  )}
                  {selected.effect && (
                    <div style={{ marginTop:'1rem' }}>
                      <h4 style={{ color:'var(--color-white)', fontWeight:'bold' }}>Effect</h4>
                      <p style={{ color:'var(--color-cloud)' }}>{selected.effect}</p>
                    </div>
                  )}
                  {/* Notes */}
                  <div style={{ marginTop:'1rem' }}>
                    <h4 style={{ color:'var(--color-white)', fontWeight:'bold' }}>Personal Notes</h4>
                    <textarea
                      value={songNote}
                      onChange={(e)=> setSongNote(e.target.value)}
                      placeholder="Add your notes about this song here..."
                      style={{ width:'100%', minHeight:'100px', backgroundColor:'var(--color-dark-elevated)', color:'var(--color-white)', border:'1px solid var(--color-dark-border)', borderRadius:'0.375rem', padding:'0.75rem', resize:'vertical' }}
                    />
                  </div>
                  {(selected.harmony_1 || selected.harmony_2) && (
                    <div style={{ marginTop:'1rem' }}>
                      <h4 style={{ color:'var(--color-white)', fontWeight:'bold' }}>Harmonies</h4>
                      {selected.harmony_1 && (
                        <div style={{ border:'1px solid var(--color-dark-border)', borderRadius:'0.375rem', padding:'0.5rem', marginBottom:'0.5rem' }}>
                          <span style={{ fontSize:'0.75rem', padding:'0.125rem 0.5rem', borderRadius:'9999px', border:'1px solid var(--color-dark-border)', color:'var(--color-cloud)', marginRight:'0.5rem' }}>Talent: {selected.harmony_1.instrument}</span>
                          <span style={{ color:'var(--color-cloud)' }}>{selected.harmony_1.effect}</span>
                        </div>
                      )}
                      {selected.harmony_2 && (
                        <div style={{ border:'1px solid var(--color-dark-border)', borderRadius:'0.375rem', padding:'0.5rem' }}>
                          <span style={{ fontSize:'0.75rem', padding:'0.125rem 0.5rem', borderRadius:'9999px', border:'1px solid var(--color-dark-border)', color:'var(--color-cloud)', marginRight:'0.5rem' }}>Talent: {selected.harmony_2.instrument}</span>
                          <span style={{ color:'var(--color-cloud)' }}>{selected.harmony_2.effect}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color:'var(--color-cloud)' }}>Select a song to view details</div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SongsPage;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Card, { CardBody, CardHeader } from '../../../components/ui/Card';

interface Harmony { instrument: string; effect: string }
interface SongData { _id: string; name: string; type: 'song'|'ballad'; magical: boolean; difficulty: number; description?: string; effect?: string; harmony_1?: Harmony|null; harmony_2?: Harmony|null }
interface CharacterSong { _id: string; songId: SongData }

const SongsTab: React.FC<{ characterId: string }>=({ characterId })=>{
  const [songs, setSongs]=useState<CharacterSong[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{
    (async()=>{
      try{
        const res=await fetch(`/api/characters/${characterId}/songs`,{ headers:{ Authorization:`Bearer ${localStorage.getItem('token')||''}` }});
        if(!res.ok) throw new Error('failed to load songs');
        const data=await res.json();
        setSongs(data.songs||[]);
      }catch(e){ setError(e instanceof Error?e.message:'unknown error'); }
      finally{ setLoading(false);} })();
  },[characterId]);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={{ color:'var(--color-white)', fontSize:'1.25rem', fontWeight:'bold' }}>Songs</h2>
        <Link to={`/characters/${characterId}/songs`}><Button variant="accent">Manage Songs</Button></Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]"><div className="loading-spinner"></div></div>
      ) : error ? (
        <Card variant="default"><CardBody><div style={{ color:'var(--color-sunset)', textAlign:'center' }}>{error}</div></CardBody></Card>
      ) : songs.length===0 ? (
        <Card variant="default"><CardBody><div style={{ textAlign:'center', color:'var(--color-cloud)' }}>No songs known yet</div></CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {songs.map((s)=> {
            const type = s.songId?.type || 'song';
            const magical = !!s.songId?.magical;
            const headerStyle: React.CSSProperties = (() => {
              // Use explicit hex bases to ensure consistent rendering
              const purpleHex = '#554182'; // ballad base
              const aquaHex = '#06b6d4';   // song base
              const base = type === 'ballad' ? purpleHex : aquaHex;
              if (!magical) {
                // Solid subtle gradient tint
                return { background: `linear-gradient(180deg, ${base}CC, ${base}88)` };
              }
              // Magical: holographic shimmer overlays atop the base gradient
              return {
                background: `
                  linear-gradient(135deg, ${base}CC, ${base}88),
                  radial-gradient(1000px 200px at 0% 0%, rgba(255,255,255,0.25), transparent 30%),
                  radial-gradient(600px 150px at 100% 10%, rgba(255,255,255,0.18), transparent 35%),
                  linear-gradient(45deg, rgba(255,255,255,0.08), rgba(0,0,0,0.08))
                `
              };
            })();
            return (
              <Card key={s._id} variant="default" hoverEffect={true}>
                <CardHeader style={{ ...headerStyle, position:'relative', overflow:'hidden' }}>
                  {magical && (
                    <div
                      aria-hidden
                      style={{
                        position:'absolute',
                        inset:0,
                        // Chrome/holographic overlay: rainbow sheen + soft glare
                        background: `
                          linear-gradient(110deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 40%, rgba(255,255,255,0.18) 60%, rgba(255,255,255,0.03) 100%),
                          linear-gradient(90deg, rgba(255,0,128,0.18), rgba(0,255,255,0.18), rgba(255,255,0,0.18), rgba(255,0,128,0.18))
                        `,
                        mixBlendMode:'screen',
                        opacity:0.9,
                        pointerEvents:'none'
                      }}
                    />
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ color:'var(--color-white)', fontWeight:'bold' }}>{s.songId?.name}</div>
                      <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.25rem' }}>
                        <span style={{ textTransform:'capitalize', fontSize:'0.75rem', padding:'0.125rem 0.5rem', borderRadius:'9999px', border:'1px solid rgba(255,255,255,0.3)', color:'#fff' }}>{s.songId?.type}</span>
                        <span style={{ fontSize:'0.75rem', padding:'0.125rem 0.5rem', borderRadius:'0.25rem', backgroundColor:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff' }}>difficulty: {s.songId?.difficulty}</span>
                        {s.songId?.magical && (
                          <span style={{ fontSize:'0.75rem', padding:'0.125rem 0.5rem', borderRadius:'9999px', backgroundColor:'rgba(215,183,64,0.2)', border:'1px solid rgba(215,183,64,0.6)', color:'#f5d46a' }}>magical</span>
                        )}
                      </div>
                    </div>
                    <Link to={`/songs/${s.songId?._id || s.songId}`} style={{ color:'#fff' }}>View</Link>
                  </div>
                </CardHeader>
                <CardBody>
                  {/* Description */}
                  {s.songId?.description && (
                    <div style={{ marginTop:'0.75rem' }}>
                      <p style={{ color:'var(--color-cloud)', fontSize:'0.9rem' }}>{s.songId.description}</p>
                    </div>
                  )}

                  {/* Effect */}
                  {s.songId?.effect && (
                    <div style={{ marginTop:'0.75rem' }}>
                      <h4 style={{ color:'var(--color-white)', fontWeight:'bold', marginBottom:'0.25rem' }}>Effect</h4>
                      <p style={{ color:'var(--color-cloud)', fontSize:'0.9rem' }}>{s.songId.effect}</p>
                    </div>
                  )}

                  {/* Harmonies */}
                  {(s.songId?.harmony_1 || s.songId?.harmony_2) && (
                    <div style={{ marginTop:'0.75rem' }}>
                      <h4 style={{ color:'var(--color-white)', fontWeight:'bold', marginBottom:'0.25rem' }}>Harmonies</h4>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                        {s.songId?.harmony_1 && (
                          <div style={{ border:'1px solid var(--color-dark-border)', borderRadius:'0.375rem', padding:'0.5rem' }}>
                            <span style={{ fontSize:'0.75rem', padding:'0.125rem 0.5rem', borderRadius:'9999px', border:'1px solid var(--color-dark-border)', color:'var(--color-cloud)', marginRight:'0.5rem' }}>Talent: {s.songId.harmony_1.instrument}</span>
                            <span style={{ color:'var(--color-cloud)' }}>{s.songId.harmony_1.effect}</span>
                          </div>
                        )}
                        {s.songId?.harmony_2 && (
                          <div style={{ border:'1px solid var(--color-dark-border)', borderRadius:'0.375rem', padding:'0.5rem' }}>
                            <span style={{ fontSize:'0.75rem', padding:'0.125rem 0.5rem', borderRadius:'9999px', border:'1px solid var(--color-dark-border)', color:'var(--color-cloud)', marginRight:'0.5rem' }}>Talent: {s.songId.harmony_2.instrument}</span>
                            <span style={{ color:'var(--color-cloud)' }}>{s.songId.harmony_2.effect}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SongsTab;

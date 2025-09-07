import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card, { CardBody } from '../components/ui/Card';

interface Harmony { instrument: string; effect: string }
interface SongData {
  id?: number;
  name: string;
  type: 'song' | 'ballad';
  magical: boolean;
  difficulty: number;
  description?: string;
  effect?: string;
  harmony_1?: Harmony | null;
  harmony_2?: Harmony | null;
}

const SongDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState<SongData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const res = await fetch(`/api/songs/${id}`);
        if (!res.ok) throw new Error('failed to fetch song');
        const data = await res.json();
        setSong(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="loading-spinner"></div></div>;
  if (error || !song) return <div className="container mx-auto px-4 py-8"><Card variant="default"><CardBody>error: {error || 'not found'}</CardBody></Card></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate('/songs')} style={{ color: 'var(--color-cloud)', marginBottom: '1rem' }}>← Back to Song Compendium</button>
      <Card variant="default">
        <CardBody>
          <h1 style={{ color: 'var(--color-white)', fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 'bold' }}>{song.name}</h1>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--color-cloud)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ textTransform: 'capitalize', fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', border: '1px solid var(--color-dark-border)' }}>{song.type}</span>
            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-dark-border)' }}>difficulty: {song.difficulty}</span>
            {song.magical && (
              <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(215, 183, 64, 0.15)', border: '1px solid rgba(215, 183, 64, 0.35)', color: 'var(--color-metal-gold)' }}>magical</span>
            )}
          </div>
          {song.description && <p style={{ color: 'var(--color-cloud)', marginTop: '1rem' }}>{song.description}</p>}
          {song.effect && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>Effect</h3>
              <p style={{ color: 'var(--color-cloud)' }}>{song.effect}</p>
            </div>
          )}
          {(song.harmony_1 || song.harmony_2) && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>Harmonies</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {song.harmony_1 && (
                  <div style={{ border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem', padding: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', border: '1px solid var(--color-dark-border)', color: 'var(--color-cloud)', marginRight: '0.5rem' }}>
                      Talent: {song.harmony_1.instrument.charAt(0).toUpperCase() + song.harmony_1.instrument.slice(1)}
                    </span>
                    <span style={{ color: 'var(--color-cloud)' }}>{song.harmony_1.effect}</span>
                  </div>
                )}
                {song.harmony_2 && (
                  <div style={{ border: '1px solid var(--color-dark-border)', borderRadius: '0.375rem', padding: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', border: '1px solid var(--color-dark-border)', color: 'var(--color-cloud)', marginRight: '0.5rem' }}>
                      Talent: {song.harmony_2.instrument.charAt(0).toUpperCase() + song.harmony_2.instrument.slice(1)}
                    </span>
                    <span style={{ color: 'var(--color-cloud)' }}>{song.harmony_2.effect}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default SongDetail;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

// Define Character type
interface Character {
  _id: string;
  name: string;
  race: string;
  level: number;
  biography: string;
  createdAt: string;
  portraitUrl?: string | null;
  modulePoints?: {
    total: number;
    spent: number;
  };
}

const Characters: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        
        // Make API call to fetch characters for the authenticated user
        const response = await fetch('/api/characters', {
          credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
          throw new Error('Failed to load characters');
        }

        const data = await response.json();
        setCharacters(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching characters:', err);
        setError(err instanceof Error ? err.message : 'Failed to load characters. Please try again later.');
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  // Function to generate a gradient based on race
  const getRaceColor = (race: string) => {
    switch (race?.toLowerCase()) {
      case 'human':
        return 'linear-gradient(to right, rgba(152, 94, 109, 0.7), rgba(152, 94, 109, 0.2))';
      case 'jhen':
        return 'linear-gradient(to right, rgba(73, 78, 107, 0.7), rgba(73, 78, 107, 0.2))';
      case 'protoelf':
        return 'linear-gradient(to right, rgba(85, 65, 130, 0.7), rgba(85, 65, 130, 0.2))';
      case 'klaktil':
        return 'linear-gradient(to right, rgba(25, 34, 49, 0.7), rgba(25, 34, 49, 0.2))';
      case 'vxyahlian':
        return 'linear-gradient(to right, rgba(215, 183, 64, 0.7), rgba(215, 183, 64, 0.2))';
      case 'zssesh':
        return 'linear-gradient(to right, rgba(117, 127, 154, 0.7), rgba(117, 127, 154, 0.2))';
      default:
        return 'linear-gradient(to right, rgba(25, 34, 49, 0.7), rgba(25, 34, 49, 0.2))';
    }
  };

  // Get the first letter of the name for the avatar placeholder
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Get a short excerpt from biography
  const getBiographyExcerpt = (biography: string) => {
    if (!biography) return 'No background information';
    return biography.length > 50 ? biography.substring(0, 50) + '...' : biography;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '2rem',
          backgroundColor: 'rgba(152, 94, 109, 0.2)',
          borderRadius: '0.5rem',
          border: '1px solid var(--color-sunset)',
          color: 'var(--color-white)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Error</h2>
        <p>{error}</p>
        <div style={{ marginTop: '1rem' }}>
          <Button variant="accent" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            color: 'var(--color-white)',
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 'bold',
          }}
        >
          Your Characters
        </h1>
        <Link to="/characters/create">
          <Button
            variant="accent"
            rightIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            }
          >
            Create New
          </Button>
        </Link>
      </div>

      {characters.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--color-dark-surface)',
            borderRadius: '0.5rem',
            padding: '3rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              backgroundColor: 'var(--color-stormy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <h2
            style={{
              color: 'var(--color-white)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
          >
            No Characters Found
          </h2>
          <p style={{ color: 'var(--color-cloud)', maxWidth: '400px', margin: '0 auto' }}>
            You haven't created any characters yet. Start your adventure by creating your first
            character.
          </p>
          <Link to="/characters/create">
            <Button variant="accent">Create Your First Character</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Link
              key={character._id}
              to={`/characters/${character._id}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="hover-lift"
                style={{
                  backgroundColor: 'var(--color-dark-surface)',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  border: '1px solid var(--color-dark-border)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                <div
                  style={{
                    background: getRaceColor(character.race),
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '3.5rem',
                      height: '3.5rem',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-dark-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: 'var(--color-white)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                      overflow: 'hidden',
                    }}
                  >
                    {character.portraitUrl ? (
                      <img 
                        src={character.portraitUrl} 
                        alt={character.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      getInitial(character.name)
                    )}
                  </div>
                  <div>
                    <h3
                      style={{
                        color: 'var(--color-white)',
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {character.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          color: 'var(--color-white)',
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                        }}
                      >
                        {character.race}
                      </span>
                      <span
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          color: 'var(--color-white)',
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                        }}
                      >
                        Module Points: {character.modulePoints ? character.modulePoints.total : character.level * 10}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ color: 'var(--color-cloud)' }}>
                      {getBiographyExcerpt(character.biography)}
                    </span>
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-full"
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        color: 'var(--color-white)',
                        border: 'none',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-stormy)';
                        e.stopPropagation();
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-dark-elevated)';
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        // Navigate to character view
                        window.location.href = `/characters/${character._id}`;
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Characters;
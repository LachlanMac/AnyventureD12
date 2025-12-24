import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useCharacters } from '../hooks/useCharacters';
// TODO: Random character generation - not ready for implementation
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { charactersApi } from '../api/characters';

const Characters: React.FC = () => {
  const { data: characters, loading, error, refetch } = useCharacters();
  // TODO: Random character generation - not ready for implementation
  // const navigate = useNavigate();
  // const [isGenerating, setIsGenerating] = useState(false);

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

  // Export character to FoundryVTT format
  const exportToFoundry = async (characterId: string, characterName: string) => {
    try {
      const response = await fetch(`/api/characters/${characterId}/export-foundry`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export character');
      }

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${characterName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_foundry.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting character:', error);
      alert('Failed to export character. Please try again.');
    }
  };

  // TODO: Random character generation - not ready for implementation
  // const handleGenerateRandom = async () => {
  //   setIsGenerating(true);
  //   try {
  //     const character = await charactersApi.generateRandom();
  //     // Navigate to the newly created character
  //     navigate(`/characters/${character._id}`);
  //     refetch(); // Refresh the character list
  //   } catch (error) {
  //     console.error('Error generating random character:', error);
  //     alert('Failed to generate random character. Please try again.');
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your characters..." />;
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
          <Button variant="accent" onClick={refetch}>
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
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* TODO: Random character generation - not ready for implementation
          <Button
            variant="secondary"
            onClick={handleGenerateRandom}
            disabled={isGenerating}
            rightIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            {isGenerating ? 'Generating...' : 'Create Random'}
          </Button>
          */}
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
      </div>

      {!characters || characters.length === 0 ? (
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

                      {character.culture && (
                        <span
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            color: 'var(--color-white)',
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px',
                          }}
                        >
                          {character.culture}
                        </span>
                      )}

                      <span
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          color: 'var(--color-white)',
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                        }}
                      >
                        Module Points:{' '}
                        {character.modulePoints
                          ? character.modulePoints.total
                          : character.level * 10}
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="flex items-center justify-center w-8 h-8 rounded-full"
                        style={{
                          backgroundColor: 'var(--color-accent)',
                          color: 'var(--color-white)',
                          border: 'none',
                          transition: 'background-color 0.2s ease',
                        }}
                        title="Export to FoundryVTT"
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-accent-dark)';
                          e.stopPropagation();
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (character._id) {
                            exportToFoundry(character._id, character.name);
                          }
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
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                      </button>
                      <button
                        className="flex items-center justify-center w-8 h-8 rounded-full"
                        style={{
                          backgroundColor: 'var(--color-dark-elevated)',
                          color: 'var(--color-white)',
                          border: 'none',
                          transition: 'background-color 0.2s ease',
                        }}
                        title="View Character"
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
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Characters;

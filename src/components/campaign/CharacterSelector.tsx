import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

interface Character {
  _id: string;
  name: string;
  ancestry: {
    ancestryId: {
      name: string;
    };
  };
  characterCulture: {
    cultureId: {
      name: string;
    };
  };
  level: number;
}

interface CharacterSelectorProps {
  onCharacterSelected: (characterId: string) => void;
  onCreateCharacter: () => void;
  selectedCharacterId?: string;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  onCharacterSelected,
  onCreateCharacter,
  selectedCharacterId
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('/api/characters', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCharacters(data);
        }
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          No Characters Found
        </h3>
        <p className="text-gray-400 mb-6">
          You need to create a character to join this campaign.
        </p>
        <Button variant="accent" onClick={onCreateCharacter}>
          Create Character
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">
        Select a Character
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {characters.map((character) => (
          <div
            key={character._id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedCharacterId === character._id
                ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            style={{
              backgroundColor: selectedCharacterId === character._id 
                ? 'rgba(59, 130, 246, 0.1)' 
                : 'var(--color-dark-base)'
            }}
            onClick={() => onCharacterSelected(character._id)}
          >
            <h4 className="text-white font-semibold">{character.name}</h4>
            <p className="text-gray-400 text-sm">
              {character.ancestry.ancestryId.name} {character.characterCulture.cultureId.name}
            </p>
            <p className="text-gray-400 text-sm">
              Level {character.level}
            </p>
          </div>
        ))}
      </div>
      
      <Button variant="secondary" onClick={onCreateCharacter}>
        Create New Character Instead
      </Button>
    </div>
  );
};

export default CharacterSelector;
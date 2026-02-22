import React, { useState } from 'react';
import { Item } from '../../types/character';
import {
  fieldInputStyle,
  fieldLabelStyle,
  craftingSkillTypes,
} from './itemFormConstants';

interface ItemRecipeFieldsProps {
  item: Partial<Item>;
  onChange: (field: string, value: any) => void;
}

const ItemRecipeFields: React.FC<ItemRecipeFieldsProps> = ({ item, onChange }) => {
  const [ingredientInput, setIngredientInput] = useState('');
  const recipe = item.recipe || {};

  const handleRecipeChange = (field: string, value: any) => {
    onChange('recipe', { ...recipe, [field]: value });
  };

  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed) {
      const current = recipe.ingredients || [];
      handleRecipeChange('ingredients', [...current, trimmed]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    const current = recipe.ingredients || [];
    handleRecipeChange('ingredients', current.filter((_: string, i: number) => i !== index));
  };

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* Crafting Skill, Difficulty, Output - 3-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
        }}
      >
        <div>
          <label style={fieldLabelStyle}>Crafting Skill</label>
          <select
            value={recipe.type || ''}
            onChange={(e) => handleRecipeChange('type', e.target.value || undefined)}
            style={fieldInputStyle}
          >
            {craftingSkillTypes.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={fieldLabelStyle}>Required Check</label>
          <input
            type="number"
            value={recipe.difficulty || 0}
            onChange={(e) => handleRecipeChange('difficulty', parseInt(e.target.value) || 0)}
            min="0"
            style={fieldInputStyle}
          />
        </div>

        <div>
          <label style={fieldLabelStyle}>Output Quantity</label>
          <input
            type="number"
            value={recipe.output || 1}
            onChange={(e) => handleRecipeChange('output', parseInt(e.target.value) || 1)}
            min="1"
            style={fieldInputStyle}
          />
        </div>
      </div>

      {/* Details */}
      <div>
        <label style={fieldLabelStyle}>Details</label>
        <textarea
          value={recipe.details || ''}
          onChange={(e) => handleRecipeChange('details', e.target.value)}
          placeholder="Special requirements, notes, or instructions..."
          rows={3}
          style={{ ...fieldInputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Ingredients */}
      <div>
        <label style={fieldLabelStyle}>Ingredients</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="text"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addIngredient();
              }
            }}
            placeholder="Add an ingredient..."
            style={{ ...fieldInputStyle, flex: 1 }}
          />
          <button
            onClick={addIngredient}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-sat-purple)',
              border: 'none',
              borderRadius: '0.25rem',
              color: 'var(--color-white)',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Add
          </button>
        </div>
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {recipe.ingredients.map((ingredient: string, index: number) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--color-dark-surface)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--color-dark-border)',
                }}
              >
                <span style={{ color: 'var(--color-white)', fontSize: '0.875rem' }}>
                  {ingredient}
                </span>
                <button
                  onClick={() => removeIngredient(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-cloud)',
                    cursor: 'pointer',
                    padding: '0 0.25rem',
                    fontSize: '1.1rem',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {(!recipe.ingredients || recipe.ingredients.length === 0) && (
          <p style={{ color: 'var(--color-cloud)', fontSize: '0.8rem', margin: '0.25rem 0 0', opacity: 0.7 }}>
            No ingredients added yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default ItemRecipeFields;

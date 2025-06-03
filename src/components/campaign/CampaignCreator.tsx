import React, { useState } from 'react';
import Button from '../ui/Button';
import CampaignPictureUploader from './CampaignPictureUploader';

interface CampaignCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: () => void;
}

const CampaignCreator: React.FC<CampaignCreatorProps> = ({
  isOpen,
  onClose,
  onCampaignCreated,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startingTalents: 6,
    startingModulePoints: 0,
    playerSlotsCount: 4,
  });
  const [picture, setPicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePictureChange = (file: File | null) => {
    setPicture(file);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('startingTalents', formData.startingTalents.toString());
      submitData.append('startingModulePoints', formData.startingModulePoints.toString());
      submitData.append('playerSlotsCount', formData.playerSlotsCount.toString());

      if (picture) {
        submitData.append('picture', picture);
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create campaign');
      }

      onCampaignCreated();
      onClose();

      // Reset form
      setFormData({
        name: '',
        description: '',
        startingTalents: 6,
        startingModulePoints: 0,
        playerSlotsCount: 4,
      });
      setPicture(null);
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-gray-900 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-dark-surface)',
          border: '1px solid var(--color-dark-border)',
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Create New Campaign
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter campaign name"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Describe your campaign..."
                maxLength={1000}
              />
            </div>

            {/* Campaign Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Starting Talents
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.startingTalents}
                  onChange={(e) => handleInputChange('startingTalents', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Starting Module Points
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.startingModulePoints}
                  onChange={(e) =>
                    handleInputChange('startingModulePoints', parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Player Slots</label>
                <select
                  value={formData.playerSlotsCount}
                  onChange={(e) => handleInputChange('playerSlotsCount', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} players
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Picture Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campaign Picture (optional)
              </label>
              <CampaignPictureUploader onPictureChange={handlePictureChange} size="medium" />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={loading || !formData.name || !formData.description}
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CampaignCreator;

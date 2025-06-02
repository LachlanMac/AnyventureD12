import React, { useState } from 'react';
import Button from '../ui/Button';
import CampaignPictureUploader from './CampaignPictureUploader';

interface Campaign {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    username: string;
  };
  startingTalents: number;
  startingModulePoints: number;
  picture?: string;
  playerSlots: {
    _id: string;
    character?: {
      _id: string;
      name: string;
      userId: string;
      player: {
        _id: string;
        username: string;
      };
    };
    inviteToken?: string;
    isOpen: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface CampaignEditorProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onCampaignUpdated: (campaign: Campaign) => void;
}

const CampaignEditor: React.FC<CampaignEditorProps> = ({ 
  campaign, 
  isOpen, 
  onClose, 
  onCampaignUpdated 
}) => {
  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description,
    startingTalents: campaign.startingTalents,
    startingModulePoints: campaign.startingModulePoints
  });
  const [picture, setPicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
      
      if (picture) {
        submitData.append('picture', picture);
      }

      const response = await fetch(`/api/campaigns/${campaign._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update campaign');
      }

      const updatedCampaign = await response.json();
      onCampaignUpdated(updatedCampaign);
    } catch (err) {
      console.error('Error updating campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
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
          border: '1px solid var(--color-dark-border)'
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Edit Campaign
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  onChange={(e) => handleInputChange('startingModulePoints', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Picture Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campaign Picture
              </label>
              <CampaignPictureUploader
                currentPicture={campaign.picture}
                onPictureChange={handlePictureChange}
                size="medium"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={loading || !formData.name || !formData.description}
              >
                {loading ? 'Updating...' : 'Update Campaign'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CampaignEditor;
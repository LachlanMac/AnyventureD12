import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) {
      showError('Nickname cannot be empty');
      return;
    }

    if (nickname === user?.username) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username: nickname }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      showSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showError(error instanceof Error ? error.message : 'Failed to update profile');
      setNickname(user?.username || ''); // Reset to original value
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNickname(user?.username || '');
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="default">
          <CardBody>
            <p style={{ color: 'var(--color-cloud)', textAlign: 'center' }}>
              Please log in to view your profile.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ maxWidth: '600px' }}>
      <h1
        style={{
          color: 'var(--color-white)',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          textAlign: 'center'
        }}
      >
        Profile
      </h1>

      <Card variant="default">
        <CardHeader>
          <h2 style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 'bold' }}>
            Account Information
          </h2>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  height: '4rem',
                  width: '4rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-sat-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'var(--color-white)'
                }}
              >
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 style={{ color: 'var(--color-white)', fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>
                  {user.username}
                </h3>
                <p style={{ color: 'var(--color-cloud)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                  Logged in via Discord
                </p>
              </div>
            </div>

            {/* Nickname */}
            <div>
              <label
                style={{
                  color: 'var(--color-cloud)',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold'
                }}
              >
                Display Name
              </label>
              
              {isEditing ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter your display name"
                    maxLength={32}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={loading}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={loading}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1rem',
                      padding: '0.75rem 0'
                    }}
                  >
                    {user.username}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
              
              <p style={{ color: 'var(--color-cloud)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                This is the name that will be displayed on your homebrew content and in campaigns.
              </p>
            </div>

            {/* Account Details */}
            <div style={{ borderTop: '1px solid var(--color-dark-border)', paddingTop: '1.5rem' }}>
              <h3 style={{ color: 'var(--color-white)', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Account Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-cloud)' }}>User ID:</span>
                <span style={{ color: 'var(--color-white)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {user.id}
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Profile;
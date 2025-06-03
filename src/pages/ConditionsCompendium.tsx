import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

interface Condition {
  id: number;
  name: string;
  category: string;
  description: string;
}

const ConditionsCompendium: React.FC = () => {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        // For now, load the JSON file directly since we don't have an API endpoint
        const response = await fetch('/data/conditions/conditions.json');
        if (!response.ok) {
          throw new Error('Failed to fetch conditions');
        }
        const data = await response.json();
        setConditions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching conditions:', error);
        setLoading(false);
      }
    };

    fetchConditions();
  }, []);

  const getFilteredConditions = () => {
    let filtered = [...conditions];

    if (searchTerm) {
      filtered = filtered.filter(
        (condition) =>
          condition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          condition.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((condition) => condition.category === categoryFilter);
    }

    return filtered;
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mental':
        return 'var(--color-sat-purple)';
      case 'physical':
        return 'var(--color-sunset)';
      case 'stealth':
        return 'var(--color-stormy)';
      default:
        return 'var(--color-cloud)';
    }
  };

  const categories = ['all', ...Array.from(new Set(conditions.map((c) => c.category)))];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
          Conditions Compendium
        </h1>
      </div>

      {/* Search and filter bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search conditions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--color-dark-elevated)',
              color: 'var(--color-white)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '0.375rem',
              padding: '0.75rem 1rem',
            }}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--color-dark-elevated)',
              color: 'var(--color-white)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '0.375rem',
              padding: '0.75rem 1rem',
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conditions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredConditions().map((condition) => (
          <Card key={condition.id} variant="default" hoverEffect={true}>
            <CardHeader
              style={{
                backgroundColor: getCategoryColor(condition.category),
                opacity: 0.8,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h3
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                  }}
                >
                  {condition.name}
                </h3>
                <span
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '9999px',
                    textTransform: 'capitalize',
                  }}
                >
                  {condition.category}
                </span>
              </div>
            </CardHeader>
            <CardBody>
              <p
                style={{
                  color: 'var(--color-cloud)',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                }}
              >
                {condition.description}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      {getFilteredConditions().length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--color-cloud)',
          }}
        >
          <h3 style={{ marginBottom: '1rem' }}>No conditions found</h3>
          <p>Try adjusting your search criteria.</p>
        </div>
      )}

      <div
        style={{
          marginTop: '3rem',
          textAlign: 'center',
          color: 'var(--color-cloud)',
          fontSize: '0.875rem',
        }}
      >
        <p>
          Showing {getFilteredConditions().length} of {conditions.length} conditions
        </p>
      </div>
    </div>
  );
};

export default ConditionsCompendium;

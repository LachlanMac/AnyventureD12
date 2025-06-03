import React, { useMemo } from 'react';
import Card, { CardHeader, CardBody } from '../../ui/Card';
import { Action, Character, Ancestry, Culture } from '../../../types/character';

interface ActionsTabProps {
  character: Character;
}

const ActionsTab: React.FC<ActionsTabProps> = ({ character }) => {
  // Parse actions and reactions from all sources
  const { actions, reactions } = useMemo(() => {
    
    const allActions: Action[] = [];
    
    // Helper function to determine energy cost from data string
    const getEnergyCost = (data: string, actionType: string): number => {
      // Basic energy costs - can be refined based on data encoding
      if (actionType.includes('Daily')) return 0; // Daily abilities don't cost energy
      if (data === 'X') return 1; // Basic action
      if (data === 'Z') return 1; // Basic reaction
      if (data.startsWith('XD')) return 1; // Action with data
      if (data.startsWith('XX')) return 0; // Special/daily action
      return 1; // Default cost
    };

    // Helper function to extract action name (remove "Action : " or "Reaction : " prefix)
    const extractActionName = (fullName: string): string => {
      const prefixes = ['Daily Action : ', 'Daily Reaction : ', 'Action : ', 'Reaction : '];
      for (const prefix of prefixes) {
        if (fullName.startsWith(prefix)) {
          return fullName.substring(prefix.length);
        }
      }
      return fullName;
    };

    // Helper function to determine action type from data field
    const getActionType = (data: string, name: string): Action['type'] => {
      // Check name for daily modifiers first
      if (name.includes('Daily Action') || name.includes('Daily Reaction')) {
        if (data.startsWith('X')) return 'Daily Action';
        if (data.startsWith('Z')) return 'Daily Reaction';
      }
      
      // Standard action/reaction based on data
      if (data.startsWith('X')) return 'Action';
      if (data.startsWith('Z')) return 'Reaction';
      
      return 'Free Action';
    };

    // Helper function to check if an option is an action/reaction
    const isActionOrReaction = (data: string): boolean => {
      return data.startsWith('X') || data.startsWith('Z');
    };

    // Parse from ancestry
    const ancestryData = character.ancestry?.ancestryId as Ancestry | string | undefined;
    if (ancestryData && typeof ancestryData !== 'string' && ancestryData.options) {
      ancestryData.options.forEach((option: any) => {
        if (option.data && isActionOrReaction(option.data)) {
          const actionType = getActionType(option.data, option.name);
          allActions.push({
            name: extractActionName(option.name),
            description: option.description,
            type: actionType,
            energyCost: getEnergyCost(option.data, option.name),
            source: ancestryData.name || 'Unknown Ancestry',
            sourceType: 'ancestry',
            data: option.data
          });
        }
      });
    }

    // Parse from culture
    const cultureData = character.characterCulture?.cultureId as Culture | string | undefined;
    if (cultureData && typeof cultureData !== 'string' && cultureData.options) {
      cultureData.options.forEach((option: any) => {
        if (option.data && isActionOrReaction(option.data)) {
          const actionType = getActionType(option.data, option.name);
          allActions.push({
            name: extractActionName(option.name),
            description: option.description,
            type: actionType,
            energyCost: getEnergyCost(option.data, option.name),
            source: cultureData.name || 'Unknown Culture',
            sourceType: 'culture',
            data: option.data
          });
        }
      });
    }

    // Parse from modules
    character.modules?.forEach((module) => {
      if (module.moduleId && typeof module.moduleId !== 'string') {
        const moduleData = module.moduleId;
        
        // Check selected options for actions/reactions
        module.selectedOptions?.forEach(selectedOption => {
          const optionLocation = typeof selectedOption === 'string' ? selectedOption : selectedOption.location;
          const option = moduleData.options?.find(opt => opt.location === optionLocation);
          if (option) {
            if (option.data && isActionOrReaction(option.data)) {
              const actionType = getActionType(option.data, option.name);
              allActions.push({
                name: extractActionName(option.name),
                description: option.description,
                type: actionType,
                energyCost: getEnergyCost(option.data, option.name),
                source: moduleData.name,
                sourceType: 'module',
                data: option.data
              });
            }
          } else {
          }
        });
      }
    });

    // Split into actions and reactions
    const actions = allActions.filter(action => 
      action.type === 'Action' || action.type === 'Daily Action' || action.type === 'Free Action'
    );
    const reactions = allActions.filter(action => 
      action.type === 'Reaction' || action.type === 'Daily Reaction'
    );


    return { actions, reactions };
  }, [character]);

  // Render action/reaction card
  const renderActionCard = (action: Action) => (
    <Card key={`${action.source}-${action.name}`} variant="default">
      <CardHeader
        style={{
          backgroundColor:
            action.type === 'Action' || action.type === 'Daily Action'
              ? 'var(--color-sat-purple-faded)'
              : action.type === 'Reaction' || action.type === 'Daily Reaction'
                ? 'var(--color-sunset)'
                : 'var(--color-metal-gold)',
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
              margin: 0,
            }}
          >
            {action.name}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {action.energyCost !== undefined && action.energyCost > 0 && (
              <span
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  color: 'var(--color-white)',
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  fontWeight: 'bold',
                }}
              >
                {action.energyCost} Energy
              </span>
            )}
            <span
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: 'var(--color-white)',
                fontSize: '0.75rem',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem',
                fontWeight: 'bold',
              }}
            >
              {action.type}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <p
          style={{
            color: 'var(--color-cloud)',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            lineHeight: '1.4',
          }}
        >
          {action.description}
        </p>
        <div
          style={{
            color: 'var(--color-muted)',
            fontSize: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Source: {action.source}</span>
          <span style={{ textTransform: 'capitalize' }}>{action.sourceType}</span>
        </div>
      </CardBody>
    </Card>
  );

  const hasAnyActions = actions.length > 0 || reactions.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {!hasAnyActions ? (
        <Card variant="default">
          <CardBody>
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  color: 'var(--color-cloud)',
                }}
              >
                No actions available yet. Add modules to gain actions.
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Actions Section */}
          {actions.length > 0 && (
            <div>
              <h2
                style={{
                  color: 'var(--color-white)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  borderBottom: '2px solid var(--color-sat-purple)',
                  paddingBottom: '0.5rem',
                }}
              >
                Actions ({actions.length})
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '1rem',
                }}
              >
                {actions.map(renderActionCard)}
              </div>
            </div>
          )}

          {/* Reactions Section */}
          {reactions.length > 0 && (
            <div>
              <h2
                style={{
                  color: 'var(--color-white)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  borderBottom: '2px solid var(--color-sunset)',
                  paddingBottom: '0.5rem',
                }}
              >
                Reactions ({reactions.length})
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '1rem',
                }}
              >
                {reactions.map(renderActionCard)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActionsTab;

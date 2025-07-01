import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface WikiPage {
  id: string;
  title: string;
  path: string;
  category: string;
  order: number;
}

interface WikiStructure {
  title: string;
  pages: WikiPage[];
}

const WikiSidebar = () => {
  const [structure, setStructure] = useState<WikiStructure | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const location = useLocation();

  useEffect(() => {
    // Load wiki structure
    fetch('/wiki/structure.json')
      .then(res => res.json())
      .then(data => {
        setStructure(data);
        // Expand all categories by default
        const categories = new Set<string>(data.pages.map((p: WikiPage) => p.category));
        setExpandedCategories(categories);
      })
      .catch(err => console.error('Failed to load wiki structure:', err));
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  if (!structure) return null;

  // Group pages by category
  const pagesByCategory = structure.pages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, WikiPage[]>);

  // Sort pages within each category
  Object.values(pagesByCategory).forEach(pages => {
    pages.sort((a, b) => a.order - b.order);
  });

  // Get category order based on first page in each category
  const categoryOrder = Object.keys(pagesByCategory).sort((a, b) => {
    const aFirst = pagesByCategory[a][0];
    const bFirst = pagesByCategory[b][0];
    return (aFirst?.order || 0) - (bFirst?.order || 0);
  });

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-purple-900/20 p-4">
      <h2 className="text-xl font-bold text-purple-300 mb-4">Wiki Navigation</h2>
      
      <nav className="space-y-2">
        {categoryOrder.map(category => {
          const isExpanded = expandedCategories.has(category);
          const pages = pagesByCategory[category];
          
          return (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-700/50 transition-colors text-left"
              >
                <span className="font-semibold text-gray-200">{category}</span>
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="ml-2 mt-1 space-y-1">
                  {pages.map(page => {
                    const pagePath = `/wiki/${page.id}`;
                    const isActive = location.pathname === pagePath;
                    
                    return (
                      <Link
                        key={page.id}
                        to={pagePath}
                        className={`block px-3 py-1 rounded text-sm transition-colors ${
                          isActive
                            ? 'bg-purple-600/30 text-purple-300 border-l-2 border-purple-400'
                            : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
                        }`}
                      >
                        {page.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      <div className="mt-6 pt-6 border-t border-gray-700">
        <Link
          to="/wiki"
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          ← Back to Wiki Home
        </Link>
      </div>
    </div>
  );
};

export default WikiSidebar;
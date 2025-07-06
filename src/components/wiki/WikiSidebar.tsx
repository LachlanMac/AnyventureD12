import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { extractHeaders, MarkdownHeader } from '../../utils/markdownParser';

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
  const [pageHeaders, setPageHeaders] = useState<Record<string, MarkdownHeader[]>>({});
  const [loadingHeaders, setLoadingHeaders] = useState<Set<string>>(new Set());
  const location = useLocation();

  useEffect(() => {
    // Load wiki structure
    fetch('/wiki/structure.json')
      .then((res) => res.json())
      .then((data) => {
        setStructure(data);
        // Expand all categories by default
        const categories = new Set<string>(data.pages.map((p: WikiPage) => p.category));
        setExpandedCategories(categories);
      })
      .catch((err) => console.error('Failed to load wiki structure:', err));
  }, []);

  // Fetch headers for a specific page
  const fetchPageHeaders = async (page: WikiPage) => {
    if (pageHeaders[page.id] || loadingHeaders.has(page.id)) {
      return;
    }

    setLoadingHeaders(prev => new Set(prev).add(page.id));

    try {
      const response = await fetch(`/wiki/${page.path}`);
      const content = await response.text();
      const headers = extractHeaders(content, 3).filter(h => h.level === 2); // Get headers up to level 3, then filter for level 2 only
      
      setPageHeaders(prev => ({
        ...prev,
        [page.id]: headers
      }));
    } catch (error) {
      console.error(`Failed to fetch headers for ${page.id}:`, error);
    } finally {
      setLoadingHeaders(prev => {
        const newSet = new Set(prev);
        newSet.delete(page.id);
        return newSet;
      });
    }
  };

  // Fetch headers for all pages when structure is loaded
  useEffect(() => {
    if (structure) {
      structure.pages.forEach(page => {
        fetchPageHeaders(page);
      });
    }
  }, [structure]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
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
  const pagesByCategory = structure.pages.reduce(
    (acc, page) => {
      if (!acc[page.category]) {
        acc[page.category] = [];
      }
      acc[page.category].push(page);
      return acc;
    },
    {} as Record<string, WikiPage[]>
  );

  // Sort pages within each category
  Object.values(pagesByCategory).forEach((pages) => {
    pages.sort((a, b) => a.order - b.order);
  });

  // Define category order manually to match intended structure
  const desiredCategoryOrder = [
    'Getting Started',
    'Characters',
    'Core Mechanics',
    'Combat',
    'Magic',
    'Equipment',
    'Crafting',
    'Songs & Music'
  ];

  // Get category order, prioritizing our desired order, then any remaining categories alphabetically
  const categoryOrder = [
    ...desiredCategoryOrder.filter(cat => pagesByCategory[cat]),
    ...Object.keys(pagesByCategory).filter(cat => !desiredCategoryOrder.includes(cat)).sort()
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-purple-900/20 p-4">
      <h2 className="text-xl font-bold text-purple-300 mb-4">Wiki Navigation</h2>

      <nav className="space-y-2">
        {categoryOrder.map((category) => {
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
                  {pages.map((page) => {
                    const pagePath = `/wiki/${page.id}`;
                    const isActive = location.pathname === pagePath;
                    const headers = pageHeaders[page.id] || [];

                    return (
                      <div key={page.id}>
                        <Link
                          to={pagePath}
                          className={`block px-3 py-1 rounded text-sm transition-colors ${
                            isActive
                              ? 'bg-purple-600/30 text-purple-300 border-l-2 border-purple-400'
                              : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
                          }`}
                        >
                          {page.title}
                        </Link>
                        
                        {/* Show subsections if this is the active page */}
                        {isActive && headers.length > 0 && (
                          <div className="ml-6 mt-1 space-y-0.5">
                            {headers.map((header) => (
                              <Link
                                key={header.anchor}
                                to={`${pagePath}#${header.anchor}`}
                                className="block px-2 py-0.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                                onClick={(e) => {
                                  // Smooth scroll to anchor
                                  e.preventDefault();
                                  const element = document.getElementById(header.anchor);
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }}
                              >
                                {header.text}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
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

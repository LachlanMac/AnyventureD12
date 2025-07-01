import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, AcademicCapIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

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

const categoryIcons: Record<string, React.ReactNode> = {
  'Getting Started': <BookOpenIcon className="w-6 h-6" />,
  'Character Creation': <AcademicCapIcon className="w-6 h-6" />,
  'Core Mechanics': <SparklesIcon className="w-6 h-6" />,
  'Combat': <ShieldCheckIcon className="w-6 h-6" />,
};

const WikiHome = () => {
  const [structure, setStructure] = useState<WikiStructure | null>(null);

  useEffect(() => {
    fetch('/wiki/structure.json')
      .then(res => res.json())
      .then(data => setStructure(data))
      .catch(err => console.error('Failed to load wiki structure:', err));
  }, []);

  if (!structure) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

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

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-purple-300 mb-4">Anyventure Wiki</h1>
        <p className="text-xl text-gray-400">
          Your comprehensive guide to the Anyventure tabletop role-playing game
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {Object.entries(pagesByCategory).map(([category, pages]) => (
          <div
            key={category}
            className="bg-gray-800/30 rounded-lg border border-purple-900/20 p-6 hover:border-purple-600/40 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-purple-400">
                {categoryIcons[category] || <BookOpenIcon className="w-6 h-6" />}
              </div>
              <h2 className="text-2xl font-bold text-purple-300">{category}</h2>
            </div>
            
            <ul className="space-y-2">
              {pages.map(page => (
                <li key={page.id}>
                  <Link
                    to={`/wiki/${page.id}`}
                    className="block p-2 rounded text-gray-300 hover:bg-gray-700/30 hover:text-white transition-colors"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-purple-900/20 rounded-lg border border-purple-600/30">
        <h3 className="text-xl font-bold text-purple-300 mb-3">New to Anyventure?</h3>
        <p className="text-gray-300 mb-4">
          Start with the <Link to="/wiki/overview" className="text-purple-400 hover:text-purple-300">Overview</Link> to
          understand what makes Anyventure unique, then move on to{' '}
          <Link to="/wiki/core-concepts" className="text-purple-400 hover:text-purple-300">Core Concepts</Link> to
          learn the fundamental mechanics.
        </p>
        <Link
          to="/wiki/overview"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <BookOpenIcon className="w-5 h-5" />
          Start Reading
        </Link>
      </div>
    </div>
  );
};

export default WikiHome;
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import '../../styles/wiki.css';

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

const WikiPage = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [content, setContent] = useState<string>('');
  const [pageInfo, setPageInfo] = useState<WikiPage | null>(null);
  const [structure, setStructure] = useState<WikiStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load structure if not already loaded
        const structureRes = await fetch('/wiki/structure.json');
        const structureData = await structureRes.json();
        setStructure(structureData);

        // Find page info
        const page = structureData.pages.find((p: WikiPage) => p.id === pageId);
        if (!page) {
          setError('Page not found');
          return;
        }

        setPageInfo(page);

        // Load page content
        const contentRes = await fetch(`/wiki/${page.path}`);
        if (!contentRes.ok) {
          throw new Error('Failed to load page content');
        }
        const contentText = await contentRes.text();
        setContent(contentText);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  // Find previous and next pages
  const findAdjacentPages = () => {
    if (!structure || !pageInfo) return { prev: null, next: null };

    const currentIndex = structure.pages.findIndex((p) => p.id === pageInfo.id);
    const prev = currentIndex > 0 ? structure.pages[currentIndex - 1] : null;
    const next =
      currentIndex < structure.pages.length - 1 ? structure.pages[currentIndex + 1] : null;

    return { prev, next };
  };

  const { prev, next } = findAdjacentPages();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
        <p className="text-gray-400">{error}</p>
        <Link to="/wiki" className="mt-4 inline-block text-purple-400 hover:text-purple-300">
          ← Back to Wiki Home
        </Link>
      </div>
    );
  }

  return (
    <article className="wiki-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Custom link renderer for internal wiki links
          a: ({ href, children }) => {
            if (href?.startsWith('/wiki/')) {
              return (
                <Link
                  to={href}
                  className="internal-link"
                >
                  {children}
                </Link>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          // Override table wrapper to add overflow handling
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Navigation */}
      <div className="wiki-nav">
        {prev ? (
          <Link
            to={`/wiki/${prev.id}`}
            className="wiki-nav-link"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>{prev.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            to={`/wiki/${next.id}`}
            className="wiki-nav-link"
          >
            <span>{next.title}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </article>
  );
};

export default WikiPage;

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

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
    <article className="prose prose-invert prose-purple max-w-none">
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
                  className="text-purple-400 hover:text-purple-300 no-underline hover:underline"
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
                className="text-purple-400 hover:text-purple-300"
              >
                {children}
              </a>
            );
          },
          // Style code blocks
          pre: ({ children }) => (
            <pre className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-x-auto">
              {children}
            </pre>
          ),
          code: ({ children }) => (
            <code className="bg-gray-900/50 px-1 py-0.5 rounded text-purple-300">{children}</code>
          ),
          // Style tables
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-700 bg-gray-800/50 px-4 py-2 text-left">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border border-gray-700 px-4 py-2">{children}</td>,
          // Style headings
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-purple-300 mb-6 mt-8 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-purple-300 mb-4 mt-6">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold text-purple-300 mb-3 mt-4">{children}</h3>
          ),
          // Style lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 text-gray-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 text-gray-300">{children}</ol>
          ),
          // Style blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-purple-600 pl-4 italic text-gray-400">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Navigation */}
      <div className="mt-12 pt-8 border-t border-gray-700 flex justify-between items-center">
        {prev ? (
          <Link
            to={`/wiki/${prev.id}`}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
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
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
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

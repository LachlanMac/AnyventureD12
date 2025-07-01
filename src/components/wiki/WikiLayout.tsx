import { Outlet } from 'react-router-dom';
import WikiSidebar from './WikiSidebar';

const WikiLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <WikiSidebar />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-purple-900/20 p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default WikiLayout;

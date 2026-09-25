export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Overview</h1>
        <p className="text-gray-500 mt-2">Welcome back to your professional dashboard.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-3xl bg-[#E6E9F0] shadow-[8px_8px_16px_#c8ccd4,-8px_-8px_16px_#ffffff] transition-all">
          <h3 className="text-gray-500 text-sm font-medium">My Resources</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">24</p>
        </div>
        
        <div className="p-6 rounded-3xl bg-[#E6E9F0] shadow-[8px_8px_16px_#c8ccd4,-8px_-8px_16px_#ffffff] transition-all">
          <h3 className="text-gray-500 text-sm font-medium">Teaching Kits</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">5</p>
        </div>
        
        <div className="p-6 rounded-3xl bg-[#E6E9F0] shadow-[8px_8px_16px_#c8ccd4,-8px_-8px_16px_#ffffff] transition-all">
          <h3 className="text-gray-500 text-sm font-medium">Department Access Requests</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">2</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-12 p-8 rounded-3xl bg-[#E6E9F0] shadow-[8px_8px_16px_#c8ccd4,-8px_-8px_16px_#ffffff]">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#E6E9F0] shadow-[inset_4px_4px_8px_#c8ccd4,inset_-4px_-4px_8px_#ffffff]">
            <div>
              <p className="text-gray-800 font-medium">Machine Learning Classification Notes</p>
              <p className="text-gray-500 text-sm">Updated 2 hours ago</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">PUBLISHED</span>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#E6E9F0] shadow-[inset_4px_4px_8px_#c8ccd4,inset_-4px_-4px_8px_#ffffff]">
            <div>
              <p className="text-gray-800 font-medium">Data Structures Lab Manual</p>
              <p className="text-gray-500 text-sm">Added to Teaching Kit yesterday</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">USE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

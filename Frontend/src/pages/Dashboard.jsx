import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Dashboard() {
  const { user, groups, fetchGroups, logout } = useStore();

  useEffect(() => {
    if (user) fetchGroups();
  }, [user, fetchGroups]);

  return (
    <div className="min-h-screen">
      <header className="header">
        <div className="container dashboard-header">
          <h1 className="text-xl font-bold text-green-600">💸 Expense Splitter</h1>
          <div className="flex gap-4 items-center">
            <span className="text-gray-600">{user?.name}</span>
            <button 
              onClick={logout} 
              className="text-red-600 text-sm hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Groups</h2>
            <Link to="/groups/new" className="btn btn-primary">
              + New Group
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="text-center mt-8">
              <p className="text-gray-500 text-lg">
                No groups yet. Create your first group!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3">
              {groups.map((group) => (
                <Link
                  key={group.group_id}
                  to={`/groups/${group.group_id}`}
                  className="group-card"
                >
                  <h3>{group.name}</h3>
                  <p>{group.description}</p>
                  <p className="text-gray-500 text-sm">
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
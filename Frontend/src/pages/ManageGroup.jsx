import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function ManageGroup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentGroup, addMember, removeMember } = useStore();
  const [newMemberName, setNewMemberName] = useState('');

  if (!currentGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const handleAddMember = (e) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      addMember(newMemberName.trim());
      setNewMemberName('');
    }
  };

  const handleRemoveMember = (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      removeMember(userId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container max-w-2xl animate-fade-in">
        <div className="mb-6">
          <button 
            onClick={() => navigate(`/groups/${id}`)}
            className="text-gray-500 hover:text-primary transition-colors flex items-center gap-2"
          >
            ← Back to Group
          </button>
        </div>

        <div className="card shadow-xl border-t-4 border-t-secondary">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              ⚙️
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Group</h1>
            <p className="text-gray-500">{currentGroup.name}</p>
          </div>

          {/* Add Member Form */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                +
              </span>
              Add New Member
            </h3>
            <form onSubmit={handleAddMember} className="flex gap-3">
              <input
                type="text"
                placeholder="Enter member name"
                className="form-control flex-1"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className="btn btn-primary whitespace-nowrap px-6"
              >
                Add Member
              </button>
            </form>
          </div>

          {/* Members List */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">👥</span>
              Group Members ({currentGroup.members.length})
            </h3>
            
            <div className="space-y-3">
              {currentGroup.members.map((member) => (
                <div 
                  key={member.user_id} 
                  className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center font-bold text-primary">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-400">Member since {new Date().getFullYear()}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveMember(member.user_id)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Member"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

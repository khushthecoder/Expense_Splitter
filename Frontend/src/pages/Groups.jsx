import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Button, Input } from '../components/ui';
import { Plus, Search, Users, ArrowRight, DollarSign, CheckCircle } from 'lucide-react';
import { groupService } from '../services/api';

export default function Groups() {
    const { user, groups, fetchGroups, loading } = useStore();
    const navigate = useNavigate();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setCreateError('');

        if (!newGroupName.trim()) {
            setCreateError('Group name is required');
            return;
        }
        if (newGroupName.trim().length < 3) {
            setCreateError('Group name must be at least 3 characters');
            return;
        }

        try {
            setCreating(true);
            await groupService.create({
                name: newGroupName.trim(),
                description: newGroupDesc.trim(),
                created_by: user.user_id
            });
            setShowCreateModal(false);
            setNewGroupName('');
            setNewGroupDesc('');
            fetchGroups();
        } catch (error) {
            console.error("Failed to create group", error);
            setCreateError('Failed to create group. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Groups</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your shared expenses across groups</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus size={20} />
                    Create Group
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search groups..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Groups Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredGroups.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={32} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No groups found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Create a new group to start splitting expenses</p>
                    <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
                        Create New Group
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map(group => (
                        <Card
                            key={group.group_id}
                            className="p-6 hover:shadow-lg transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-primary font-bold text-xl">
                                    {group.name.charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={() => navigate(`/groups/${group.group_id}`)}
                                    className="bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                    View Details
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{group.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                                {group.description || 'No description'}
                            </p>

                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <Users size={16} />
                                <span>{group.members?.length || 0} members</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/groups/${group.group_id}/add-expense`)}
                                    className="gap-2"
                                >
                                    <DollarSign size={16} />
                                    Add Expense
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/groups/${group.group_id}`)}
                                    className="gap-2"
                                >
                                    <CheckCircle size={16} />
                                    Settle Up
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Group</h2>
                        {createError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                {createError}
                            </div>
                        )}
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <Input
                                label="Group Name"
                                placeholder="e.g. Trip to Goa"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                required
                            />
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary-light/20 outline-none transition-all resize-none h-24 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:focus:bg-gray-800"
                                    placeholder="What's this group for?"
                                    value={newGroupDesc}
                                    onChange={(e) => setNewGroupDesc(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1" disabled={creating}>
                                    {creating ? 'Creating...' : 'Create Group'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

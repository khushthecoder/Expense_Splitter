import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, Input } from '../components/ui';
import { UserPlus, Trash2, Mail, Search, Users, DollarSign } from 'lucide-react';
import { friendService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Friends() {
    // Use selective selectors to prevent unnecessary re-renders
    // Only subscribe to userId, not the entire user object
    const userId = useStore((state) => state.user?.user_id);
    const userName = useStore((state) => state.user?.name);

    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newFriendEmail, setNewFriendEmail] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Memoize fetchFriends to prevent recreation on every render
    const fetchFriends = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const res = await friendService.getAll(userId);
            setFriends(res.data);
        } catch (err) {
            console.error("Failed to fetch friends", err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    // Memoize handlers to prevent recreation
    const handleAddFriend = useCallback(async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!userId) return;
        try {
            await friendService.add(userId, newFriendEmail);
            setSuccess('Friend added successfully!');
            setNewFriendEmail('');
            setShowAddModal(false);
            fetchFriends();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add friend');
        }
    }, [userId, newFriendEmail, fetchFriends]);

    const handleRemoveFriend = useCallback(async (friendId) => {
        if (!window.confirm('Are you sure you want to remove this friend?')) return;

        if (!userId) return;
        try {
            await friendService.remove(userId, friendId);
            fetchFriends();
        } catch (err) {
            console.error("Failed to remove friend", err);
        }
    }, [userId, fetchFriends]);

    const handleInvite = useCallback(async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await friendService.invite({
                recipient_email: newFriendEmail,
                inviter_name: userName
            });
            setSuccess('Invitation sent successfully!');
            setNewFriendEmail('');
            setShowAddModal(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send invitation');
        }
    }, [newFriendEmail, userName]);

    // Memoize filtered friends to prevent recalculation on every render
    const filteredFriends = useMemo(() => {
        if (!userId) return [];
        return friends.filter(f => {
            const friendData = f.user_id === userId ? f.friend : f.user;
            return friendData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                friendData.email.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [friends, searchTerm, userId]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Friends</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your friends and expenses</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                    <UserPlus size={20} />
                    Add Friend
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search friends..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredFriends.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={32} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No friends found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Add friends to start splitting expenses with them</p>
                    <Button variant="secondary" onClick={() => setShowAddModal(true)}>
                        Add New Friend
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFriends.map(friendship => {
                        const friend = friendship.user_id === userId ? friendship.friend : friendship.user;
                        return (
                            <Card key={friendship.id} className="p-6 flex items-center justify-between group hover:border-primary/50 dark:hover:border-primary/50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xl">
                                        {friend.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{friend.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{friend.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/groups/null/add-expense?friend_id=${friend.user_id}`)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Add Expense"
                                    >
                                        <DollarSign size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleRemoveFriend(friend.user_id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove Friend"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add Friend Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Friend</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleAddFriend} className="space-y-4">
                            <Input
                                label="Friend's Email"
                                type="email"
                                placeholder="friend@example.com"
                                value={newFriendEmail}
                                onChange={(e) => setNewFriendEmail(e.target.value)}
                                required
                            />

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                    Add Friend
                                </Button>
                            </div>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or if they are not on Splitly</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full gap-2"
                                onClick={handleInvite}
                            >
                                <Mail size={18} />
                                Send Invitation
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

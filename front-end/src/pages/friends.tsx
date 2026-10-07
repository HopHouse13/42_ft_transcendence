import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFriends } from '../hooks/useFriends';
import { FriendList } from '../components/friends/FriendList';
import { FriendRequests } from '../components/friends/FriendRequests';
import { UserSearch } from '../components/friends/UserSearch';
import type { FriendUser } from '../types/friendTypes';

type Tab = 'friends' | 'requests' | 'add';

const Friends = (): React.ReactElement => {
  const [tab, setTab] = useState<Tab>('friends');
  const { requests, loading, error } = useFriends();
  const navigate = useNavigate();

  function handleChallenge(friend: FriendUser) {
    // La page Game lit cet état et émet l'événement socket (voir étape 7)
    navigate('/game', { state: { challengeFriendId: friend.id } });
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4">
      <h1 className="text-3xl font-bold">Friends</h1>

      <div role="tablist" className="tabs tabs-box">
        <button role="tab" className={`tab ${tab === 'friends' ? 'tab-active' : ''}`} onClick={() => setTab('friends')}>
          Friends
        </button>
        <button role="tab" className={`tab ${tab === 'requests' ? 'tab-active' : ''}`} onClick={() => setTab('requests')}>
          Requests
          {requests.received.length > 0 && (
            <span className="badge badge-primary badge-sm ml-2">{requests.received.length}</span>
          )}
        </button>
        <button role="tab" className={`tab ${tab === 'add' ? 'tab-active' : ''}`} onClick={() => setTab('add')}>
          Add
        </button>
      </div>

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}
      {loading && <span className="loading loading-spinner" />}

      {tab === 'friends' && <FriendList onChallenge={handleChallenge} />}
      {tab === 'requests' && <FriendRequests />}
      {tab === 'add' && <UserSearch />}
    </div>
  );
};

export default Friends;
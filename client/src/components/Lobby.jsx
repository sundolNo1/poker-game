import { useState } from 'react';
import { socket } from '../socket';

export default function Lobby({ error, onClearError }) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [tab, setTab] = useState('create');

  const handleCreate = () => {
    if (!name.trim()) return;
    socket.emit('create-room', { name: name.trim() });
  };

  const handleJoin = () => {
    if (!name.trim() || !joinCode.trim()) return;
    socket.emit('join-room', { name: name.trim(), roomId: joinCode.trim().toUpperCase() });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-gray-700">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">♠♥♣♦</div>
          <h1 className="text-2xl font-bold text-white">Texas Hold'em</h1>
          <p className="text-gray-400 text-sm mt-1">친구들과 함께하는 포커</p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm flex justify-between">
            <span>{error}</span>
            <button onClick={onClearError} className="ml-2 font-bold">✕</button>
          </div>
        )}

        <div className="mb-4">
          <label className="text-gray-400 text-sm block mb-1">닉네임</label>
          <input
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-green-500"
            placeholder="닉네임 입력"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (tab === 'create' ? handleCreate() : handleJoin())}
            maxLength={12}
          />
        </div>

        <div className="flex mb-4 bg-gray-900 rounded-lg p-1">
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'create' ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setTab('create')}
          >
            방 만들기
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'join' ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setTab('join')}
          >
            방 입장
          </button>
        </div>

        {tab === 'create' ? (
          <button
            className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors"
            onClick={handleCreate}
          >
            방 만들기
          </button>
        ) : (
          <div>
            <input
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-green-500 mb-3 uppercase tracking-widest"
              placeholder="방 코드 입력 (예: AB12CD)"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              maxLength={6}
            />
            <button
              className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors"
              onClick={handleJoin}
            >
              입장하기
            </button>
          </div>
        )}

        <div className="mt-4 text-center text-gray-500 text-xs">
          시작 칩: 1,000 · 블라인드: 10/20 · 최대 6명
        </div>
      </div>
    </div>
  );
}

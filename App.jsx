import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [view, setView] = useState('home');
  const [gameType, setGameType] = useState('kalakobana');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const createRoom = async () => {
    if (!playerName.trim()) {
      alert('გთხოვთ შეიყვანოთ სახელი!');
      return;
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setView('lobby');

    await supabase.from('rooms').insert([{
      code,
      host: playerName,
      game_type: gameType,
      status: 'waiting',
      players: [playerName]
    }]);
  };

  const joinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) {
      alert('შეიყვანეთ სახელი და ოთახის კოდი!');
      return;
    }

    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode.toUpperCase())
      .single();

    if (error || !data) {
      alert('ოთახი ვერ მოიძებნა!');
      return;
    }

    const updatedPlayers = [...data.players, playerName];
    await supabase
      .from('rooms')
      .update({ players: updatedPlayers })
      .eq('code', roomCode.toUpperCase());

    setView('lobby');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
        
        {view === 'home' && (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-extrabold text-yellow-400">
              90-იანების თამაშების კლუბი 🎮
            </h1>

            <input
              type="text"
              placeholder="შენი სახელი..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/30 rounded-xl text-white"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setGameType('kalakobana')}
                className={`flex-1 py-2 rounded-xl font-bold ${gameType === 'kalakobana' ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}
              >
                ქალაქობანა
              </button>
              <button
                onClick={() => setGameType('hangman')}
                className={`flex-1 py-2 rounded-xl font-bold ${gameType === 'hangman' ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}
              >
                ჩამოხრჩობანა
              </button>
            </div>

            <button
              onClick={createRoom}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl"
            >
              ოთახის შექმნა 🚀
            </button>

            <div className="flex gap-2 pt-4 border-t border-white/20">
              <input
                type="text"
                placeholder="ოთახის კოდი..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="flex-1 px-4 py-2 bg-black/40 border border-white/30 rounded-xl uppercase"
              />
              <button
                onClick={joinRoom}
                className="px-6 py-2 bg-indigo-600 font-bold rounded-xl"
              >
                შესვლა
              </button>
            </div>
          </div>
        )}

        {view === 'lobby' && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-yellow-400">ოთახის კოდი: {roomCode}</h2>
            <p className="text-gray-300">მოთამაშე: {playerName}</p>
            <button
              onClick={() => setView('home')}
              className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl"
            >
              გასვლა
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
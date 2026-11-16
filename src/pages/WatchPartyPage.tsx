import React, { useState, useEffect, useRef } from 'react';
import { Movie, Series, VideoServer } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { syncWatchPartyState } from '../services/dataService';
import { Users, Copy, Check, Send, Film, MessageCircle, Download, ShieldAlert, Sparkles, FolderDown, HardDrive } from 'lucide-react';

interface WatchPartyPageProps {
  movies: Movie[];
  series: Series[];
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  senderName: string;
  avatar: string;
  text: string;
  time: string;
}

export const WatchPartyPage: React.FC<WatchPartyPageProps> = ({ movies, series, onBack }) => {
  const { user } = useAuth();
  const { t } = useLocale();

  const allMedia = [...movies, ...series];
  const [roomCode, setRoomCode] = useState<string>('');
  const [inRoom, setInRoom] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(true);
  const [selectedMedia, setSelectedMedia] = useState<Movie | Series>(allMedia[0]);
  const [copied, setCopied] = useState<boolean>(false);

  // Synchronized playback states
  const [syncTime, setSyncTime] = useState<number>(0);
  const [syncPlaying, setSyncPlaying] = useState<boolean>(false);

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      senderName: 'CineBox Bot',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: 'Welcome to your synchronized CineBox4u Watch Party room!',
      time: 'Just now',
    },
  ]);
  const [inputMsg, setInputMsg] = useState<string>('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Participants
  const [participants, setParticipants] = useState([
    {
      name: user?.displayName || user?.email?.split('@')[0] || 'Room Host',
      avatar: user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      isHost: true,
    },
    {
      name: 'Farhan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      isHost: false,
    },
  ]);

  const handleCreateRoom = () => {
    const code = `CINE-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomCode(code);
    setIsHost(true);
    setInRoom(true);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    setIsHost(false);
    setInRoom(true);
    setParticipants((prev) => [
      ...prev,
      {
        name: user?.displayName || 'Guest Viewer',
        avatar: user?.photoURL || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        isHost: false,
      },
    ]);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}?party=${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: user?.displayName || user?.email?.split('@')[0] || 'Viewer',
      avatar: user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 100);
  };

  // Sync state with server periodically
  useEffect(() => {
    if (!inRoom || !roomCode) return;

    const interval = setInterval(async () => {
      try {
        if (isHost && user) {
          await syncWatchPartyState(
            roomCode,
            user.uid,
            user.uid,
            syncPlaying ? 'play' : 'pause',
            syncTime,
            syncPlaying
          );
        }
      } catch (err) {
        console.warn('WatchParty sync error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [inRoom, roomCode, isHost, syncTime, syncPlaying]);

  if (!inRoom) {
    return (
      <div className="min-h-screen bg-[#07080b] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col justify-center">
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            CineBox4u Live Watch Party
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Stream together with friends and family in ultra-low latency sync with integrated live chat and synchronized playback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Host a Party */}
          <div className="bg-[#101218] border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Host Cinema Night</span>
              <h3 className="text-lg font-bold text-white mt-1 mb-2">Create a New Room</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Choose a movie or web series and invite your friends with a 6-digit sync code.
              </p>

              <label className="block text-xs font-semibold text-zinc-300 mb-2">Select Content to Stream</label>
              <select
                value={selectedMedia.id}
                onChange={(e) => {
                  const m = allMedia.find((item) => item.id === e.target.value);
                  if (m) setSelectedMedia(m);
                }}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white mb-4"
              >
                {allMedia.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Create Watch Party Room
            </button>
          </div>

          {/* Join a Party */}
          <form
            onSubmit={handleJoinRoom}
            className="bg-[#101218] border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl"
          >
            <div>
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Join Existing Party</span>
              <h3 className="text-lg font-bold text-white mt-1 mb-2">Enter Room Code</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Have an invitation code from a friend? Enter it below to synchronize stream instantly.
              </p>

              <label className="block text-xs font-semibold text-zinc-300 mb-2">Room Code</label>
              <input
                type="text"
                required
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. CINE-7892"
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm font-mono text-white mb-4 uppercase tracking-widest focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-red-500" />
              Join Cinema Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080b] py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Top Bar with Room Code and Invites */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#101218] border border-zinc-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">{selectedMedia.title}</h2>
              <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-mono text-xs font-bold border border-red-500/30">
                {roomCode}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {isHost ? 'You are the Room Host (Synchronized Authority)' : 'Connected as Participant (Follows Host)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-xl flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link' : 'Copy Invite'}</span>
          </button>
          <button
            onClick={() => setInRoom(false)}
            className="px-3.5 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-xs font-bold text-red-400 rounded-xl transition"
          >
            Leave Room
          </button>
        </div>
      </div>

      {/* Main Grid: Download Showcase on Left, Chat on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Movie Visuals and Download Center */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              <img
                src={selectedMedia.backdropUrl || selectedMedia.posterUrl}
                alt={selectedMedia.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101218] via-black/40 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white mb-2 inline-block">
                    {selectedMedia.type === 'movie' ? '1080P FULL HD' : 'SERIES'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{selectedMedia.title}</h3>
                  <p className="text-xs text-zinc-300 mt-1 line-clamp-1">{selectedMedia.description}</p>
                </div>

                <button
                  onClick={() => {
                    const cleanName = selectedMedia.title.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
                    const anchor = document.createElement('a');
                    anchor.href = 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4';
                    anchor.download = `CineBox4u_${cleanName}_1080p.mp4`;
                    anchor.target = '_blank';
                    document.body.appendChild(anchor);
                    anchor.click();
                    document.body.removeChild(anchor);
                  }}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-950/80 cursor-pointer"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>১-ক্লিকে ডাউনলোড (1080p MP4)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#101218] border border-zinc-800/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {participants.map((p, i) => (
                  <img
                    key={i}
                    src={p.avatar}
                    alt={p.name}
                    className="w-8 h-8 rounded-full border-2 border-[#101218] object-cover"
                    title={p.name}
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-400 font-medium">
                {participants.length} জন ক্লাবে যুক্ত রয়েছেন
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Download Hub Active
            </div>
          </div>
        </div>

        {/* Right: Live Chat */}
        <div className="bg-[#101218] border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between h-[520px] shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <MessageCircle className="w-4 h-4 text-red-500" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Party Chat</h4>
          </div>

          {/* Messages scroll */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-2.5">
                <img src={m.avatar} alt={m.senderName} className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-zinc-300">{m.senderName}</span>
                    <span className="text-[10px] text-zinc-600">{m.time}</span>
                  </div>
                  <p className="text-zinc-400 mt-0.5 leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-zinc-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Type message to room..."
              className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

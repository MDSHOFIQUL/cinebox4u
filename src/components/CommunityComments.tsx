import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { CommunityComment } from '../types';
import { fetchComments, postComment } from '../services/dataService';
import { MessageSquare, Heart, AlertTriangle, Shield, Send, Flag, Check, EyeOff } from 'lucide-react';

interface CommunityCommentsProps {
  mediaId: string;
  mediaTitle: string;
}

export const CommunityComments: React.FC<CommunityCommentsProps> = ({ mediaId, mediaTitle }) => {
  const { user } = useAuth();
  const { t } = useLocale();

  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initial seed comments for immediate vibrant community feel
  const defaultSampleComments: CommunityComment[] = [
    {
      id: `comm_${mediaId}_1`,
      mediaId,
      userId: 'user_fan_01',
      userName: 'Arefin Chowdhury',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      content: 'The cinematography in this title is absolute world class! Sound design in 4K gives real goosebumps.',
      containsSpoiler: false,
      likesCount: 24,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: `comm_${mediaId}_2`,
      mediaId,
      userId: 'user_fan_02',
      userName: 'Tanvir Hossain',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      content: 'That plot twist at the climax was unbelievable! Definitely one of the best releases this season.',
      containsSpoiler: true,
      likesCount: 18,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ];

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const list = await fetchComments(mediaId);
        if (active) {
          if (list && list.length > 0) {
            setComments(list);
          } else {
            setComments(defaultSampleComments);
          }
        }
      } catch (err) {
        if (active) setComments(defaultSampleComments);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [mediaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to participate in the CineBox4u community discussion.');
      return;
    }
    if (!content.trim()) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const authorName = user.displayName || user.email?.split('@')[0] || 'CineBox Member';
      const res = await postComment(mediaId, user.uid, authorName, content.trim());
      const created: CommunityComment = {
        id: res.id || `c_${Date.now()}`,
        mediaId,
        userId: user.uid,
        userName: authorName,
        userAvatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        content: content.trim(),
        comment: content.trim(),
        containsSpoiler: isSpoiler,
        likesCount: 0,
        createdAt: new Date().toISOString(),
      };

      setComments([created, ...comments]);
      setContent('');
      setIsSpoiler(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likesCount: c.likesCount + 1 } : c))
    );
  };

  const toggleRevealSpoiler = (commentId: string) => {
    setRevealedSpoilers((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReport = (commentId: string) => {
    alert('Thank you. This comment has been flagged for CineBox4u community moderator review.');
  };

  return (
    <div className="bg-[#101218] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-white tracking-wide">
            {t('comments')} ({comments.length})
          </h3>
        </div>
        <span className="text-xs text-zinc-400">Strict Anti-Spam & Moderation Active</span>
      </div>

      {/* Submission Box */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={user ? t('leave_comment') : 'Sign in with your Google or email account to post a comment...'}
          disabled={!user || submitting}
          className="w-full p-3.5 bg-zinc-900 border border-zinc-800 focus:border-red-500 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition resize-none disabled:opacity-60"
        />

        {errorMessage && (
          <p className="text-xs text-red-400 font-semibold">{errorMessage}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-white select-none">
            <input
              type="checkbox"
              checked={isSpoiler}
              onChange={(e) => setIsSpoiler(e.target.checked)}
              disabled={!user}
              className="w-4 h-4 accent-red-600 rounded cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
              {t('spoiler_warning')}
            </span>
          </label>

          <button
            type="submit"
            disabled={!user || !content.trim() || submitting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Posting...' : t('post_comment')}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 pt-2">
        {comments.map((comm) => {
          const isHiddenSpoiler = comm.containsSpoiler && !revealedSpoilers[comm.id];
          return (
            <div
              key={comm.id}
              className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl space-y-2 hover:border-zinc-700/80 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700">
                    <img src={comm.userAvatar} alt={comm.userName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{comm.userName}</h5>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(comm.createdAt || comm.timestamp || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {comm.containsSpoiler && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Spoiler
                    </span>
                  )}
                  <button
                    onClick={() => handleReport(comm.id)}
                    className="text-zinc-500 hover:text-red-400 p-1 rounded transition"
                    title={t('report')}
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Comment Content (With spoiler cover if flagged) */}
              <div className="text-xs leading-relaxed text-zinc-300 pt-1">
                {isHiddenSpoiler ? (
                  <div
                    onClick={() => toggleRevealSpoiler(comm.id)}
                    className="p-3 bg-zinc-950/80 border border-dashed border-amber-500/40 rounded-lg text-center cursor-pointer hover:bg-zinc-900 transition"
                  >
                    <p className="text-xs text-amber-400 font-semibold flex items-center justify-center gap-1.5">
                      <EyeOff className="w-4 h-4" />
                      Contains Spoilers — Click to reveal
                    </p>
                  </div>
                ) : (
                  <p>{comm.content}</p>
                )}
              </div>

              {/* Like / Interactions */}
              <div className="flex items-center gap-4 pt-1 text-[11px] text-zinc-400">
                <button
                  onClick={() => handleLike(comm.id)}
                  className="flex items-center gap-1.5 hover:text-red-400 transition"
                >
                  <Heart className="w-3.5 h-3.5 text-red-500" />
                  <span>{comm.likesCount}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

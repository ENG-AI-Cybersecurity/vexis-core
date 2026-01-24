import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUp,
  MessageSquare,
  Clock,
  User,
  Tag,
  TrendingUp,
  Filter,
  Plus,
  ExternalLink,
  Flame,
  Award,
  Lock,
} from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  author: string;
  authorRep: number;
  content: string;
  points: number;
  comments: number;
  timestamp: number;
  tags: string[];
  isPinned?: boolean;
  isHot?: boolean;
}

const mockPosts: ForumPost[] = [
  {
    id: '1',
    title: '[RELEASE] ZeroDay Scanner v3.2 - CVE-2024 Detection Module',
    author: 'ph4nt0m',
    authorRep: 2847,
    content: 'New release with improved detection for recent CVEs...',
    points: 342,
    comments: 89,
    timestamp: Date.now() - 1000 * 60 * 30, // 30 min ago
    tags: ['tool', 'release', 'scanner'],
    isPinned: true,
    isHot: true,
  },
  {
    id: '2',
    title: 'Ask VX: Best practices for isolated malware analysis environments?',
    author: 'cyb3rn0va',
    authorRep: 1523,
    content: 'Looking for recommendations on setting up air-gapped analysis...',
    points: 187,
    comments: 45,
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    tags: ['question', 'malware', 'analysis'],
  },
  {
    id: '3',
    title: 'Show VX: My OSINT Framework Built on Vexis Labs',
    author: 'darktr4cer',
    authorRep: 3241,
    content: 'I built an OSINT automation framework using the Vexis API...',
    points: 256,
    comments: 67,
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    tags: ['show', 'osint', 'framework'],
    isHot: true,
  },
  {
    id: '4',
    title: 'Discussion: Ethical implications of automated vulnerability disclosure',
    author: 'ethic4l_h4ck',
    authorRep: 892,
    content: 'With the rise of AI-powered vuln scanners, we need to discuss...',
    points: 145,
    comments: 112,
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
    tags: ['discussion', 'ethics', 'disclosure'],
  },
  {
    id: '5',
    title: '[Tutorial] Advanced WSL2 Network Isolation Techniques',
    author: 'n3tw0rk_gh0st',
    authorRep: 2156,
    content: 'Step-by-step guide to creating truly isolated lab environments...',
    points: 423,
    comments: 34,
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    tags: ['tutorial', 'wsl2', 'networking'],
  },
  {
    id: '6',
    title: 'New Robin Integration: Real-time Breach Detection Pipeline',
    author: 'r0b1n_dev',
    authorRep: 4521,
    content: 'Official announcement of the new Robin API features...',
    points: 567,
    comments: 156,
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    tags: ['announcement', 'robin', 'api'],
    isPinned: true,
  },
];

type SortType = 'hot' | 'new' | 'top';

export function SecretForum() {
  const [posts, setPosts] = useState<ForumPost[]>(mockPosts);
  const [sortBy, setSortBy] = useState<SortType>('hot');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = [...new Set(posts.flatMap(p => p.tags))];

  const sortedPosts = [...posts]
    .filter(p => !selectedTag || p.tags.includes(selectedTag))
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      switch (sortBy) {
        case 'hot':
          const aScore = a.points + a.comments * 2;
          const bScore = b.points + b.comments * 2;
          return bScore - aScore;
        case 'new':
          return b.timestamp - a.timestamp;
        case 'top':
          return b.points - a.points;
        default:
          return 0;
      }
    });

  const handleUpvote = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, points: p.points + 1 } : p
    ));
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full p-4 gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center neon-border-purple">
            <Lock className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold neon-text-purple">Secret Forum</h2>
            <p className="text-sm text-muted-foreground">Gated community for Vexis operators</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors neon-border-purple">
          <Plus className="w-4 h-4" />
          <span className="font-medium">New Post</span>
        </button>
      </div>

      {/* Sort & Filter Bar */}
      <div className="flex items-center gap-4 glass-panel rounded-lg p-3">
        {/* Sort Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {([
            { id: 'hot', icon: <Flame className="w-4 h-4" />, label: 'Hot' },
            { id: 'new', icon: <Clock className="w-4 h-4" />, label: 'New' },
            { id: 'top', icon: <TrendingUp className="w-4 h-4" />, label: 'Top' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSortBy(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sortBy === tab.id
                  ? 'bg-secondary/20 text-secondary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Tags */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-1 text-xs rounded-full transition-colors flex-shrink-0 ${
                selectedTag === tag
                  ? 'bg-secondary/20 text-secondary border border-secondary/50'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {sortedPosts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-panel rounded-xl p-4 cursor-pointer transition-all hover:border-secondary/40 ${
              post.isPinned ? 'border-secondary/30 bg-secondary/5' : ''
            }`}
          >
            <div className="flex gap-4">
              {/* Vote Column */}
              <div className="flex flex-col items-center gap-1 w-12">
                <button
                  onClick={(e) => { e.stopPropagation(); handleUpvote(post.id); }}
                  className="p-1.5 rounded-lg hover:bg-secondary/20 text-muted-foreground hover:text-secondary transition-colors"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <span className={`text-sm font-bold ${
                  post.points > 300 ? 'text-secondary neon-text-purple' :
                  post.points > 100 ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {post.points}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <div className="flex items-start gap-2">
                  {post.isPinned && (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-secondary/20 text-secondary rounded">
                      Pinned
                    </span>
                  )}
                  {post.isHot && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-destructive/20 text-destructive rounded">
                      <Flame className="w-3 h-3" /> Hot
                    </span>
                  )}
                  <h3 className="font-medium text-foreground flex-1 hover:text-secondary transition-colors">
                    {post.title}
                  </h3>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="text-foreground font-medium">{post.author}</span>
                    <span className="flex items-center gap-0.5 text-accent">
                      <Award className="w-3 h-3" />
                      {post.authorRep}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(post.timestamp)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {post.comments} comments
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mt-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-muted/50 text-muted-foreground rounded"
                    >
                      <Tag className="w-2.5 h-2.5 inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground glass-panel rounded-lg p-3">
        <div className="flex items-center gap-4">
          <span>{posts.length} posts</span>
          <span>{posts.reduce((acc, p) => acc + p.comments, 0)} comments</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>127 operators online</span>
        </div>
      </div>
    </motion.div>
  );
}

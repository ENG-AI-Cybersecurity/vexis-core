import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Download, 
  Star, 
  Shield, 
  Lock,
  CheckCircle2,
  Search,
  Filter,
  Zap,
  Users,
  Clock,
} from 'lucide-react';

interface MissionPack {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  category: 'offensive' | 'defensive' | 'osint' | 'forensics';
  price: 'free' | 'pro';
  installed: boolean;
  verified: boolean;
}

const mockPacks: MissionPack[] = [
  {
    id: 'pack-001',
    name: 'Red Team Essentials',
    description: 'Complete toolkit for penetration testing including network scanners, exploit frameworks, and post-exploitation tools.',
    author: 'VexisSec',
    version: '2.3.1',
    downloads: 15420,
    rating: 4.9,
    category: 'offensive',
    price: 'free',
    installed: true,
    verified: true,
  },
  {
    id: 'pack-002',
    name: 'OSINT Master Suite',
    description: 'Advanced open-source intelligence gathering tools. Social media scrapers, domain reconnaissance, and metadata extractors.',
    author: 'IntelOps',
    version: '1.8.0',
    downloads: 8932,
    rating: 4.7,
    category: 'osint',
    price: 'pro',
    installed: false,
    verified: true,
  },
  {
    id: 'pack-003',
    name: 'Malware Analysis Lab',
    description: 'Sandboxed environment for safe malware analysis. Includes disassemblers, debuggers, and behavioral analysis tools.',
    author: 'MalwareLab',
    version: '3.1.0',
    downloads: 6721,
    rating: 4.8,
    category: 'forensics',
    price: 'pro',
    installed: false,
    verified: true,
  },
  {
    id: 'pack-004',
    name: 'Blue Team Defender',
    description: 'Defensive security toolkit. Log analyzers, intrusion detection systems, and threat hunting scripts.',
    author: 'DefenseGrid',
    version: '2.0.5',
    downloads: 12103,
    rating: 4.6,
    category: 'defensive',
    price: 'free',
    installed: true,
    verified: true,
  },
  {
    id: 'pack-005',
    name: 'CTF Challenge Pack',
    description: 'Collection of CTF challenges ranging from beginner to advanced. Perfect for practice and training.',
    author: 'HackTheFlag',
    version: '4.2.0',
    downloads: 21456,
    rating: 4.9,
    category: 'offensive',
    price: 'free',
    installed: false,
    verified: true,
  },
  {
    id: 'pack-006',
    name: 'Network Forensics Kit',
    description: 'Packet capture and analysis tools. PCAP analyzers, network flow visualization, and protocol decoders.',
    author: 'NetForensics',
    version: '1.5.2',
    downloads: 4532,
    rating: 4.5,
    category: 'forensics',
    price: 'pro',
    installed: false,
    verified: false,
  },
];

const categories = [
  { id: 'all', label: 'All Packs', icon: Package },
  { id: 'offensive', label: 'Offensive', icon: Zap },
  { id: 'defensive', label: 'Defensive', icon: Shield },
  { id: 'osint', label: 'OSINT', icon: Search },
  { id: 'forensics', label: 'Forensics', icon: Lock },
];

export function Marketplace() {
  const [packs, setPacks] = useState<MissionPack[]>(mockPacks);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPacks = packs.filter(pack => {
    const matchesCategory = selectedCategory === 'all' || pack.category === selectedCategory;
    const matchesSearch = pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pack.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInstall = (packId: string) => {
    setPacks(prev => prev.map(pack => 
      pack.id === packId ? { ...pack, installed: true } : pack
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full p-4 gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Package className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold neon-text-cyan">Marketplace</h2>
            <p className="text-sm text-muted-foreground mt-1">Mission Packs & Security Tools</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {packs.filter(p => p.installed).length} Installed
          </span>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-accent">{packs.length} Available</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mission packs..."
            className="w-full bg-muted/50 border border-border/40 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-accent/20 text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              <span className="hidden md:inline">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DRM Notice */}
      <div className="glass-panel rounded-lg p-3 flex items-center gap-3 border border-primary/30">
        <Shield className="w-5 h-5 text-primary" />
        <p className="text-xs text-muted-foreground">
          All packs are verified for security. DRM protection prevents unauthorized distribution. 
          <span className="text-primary ml-1">Zip Slip protection enabled.</span>
        </p>
      </div>

      {/* Packs Grid */}
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
        {filteredPacks.map((pack, index) => (
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-panel rounded-xl p-4 flex flex-col"
          >
            {/* Pack Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  pack.category === 'offensive' ? 'bg-destructive/20' :
                  pack.category === 'defensive' ? 'bg-primary/20' :
                  pack.category === 'osint' ? 'bg-secondary/20' : 'bg-accent/20'
                }`}>
                  <Package className={`w-5 h-5 ${
                    pack.category === 'offensive' ? 'text-destructive' :
                    pack.category === 'defensive' ? 'text-primary' :
                    pack.category === 'osint' ? 'text-secondary' : 'text-accent'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm">{pack.name}</h3>
                    {pack.verified && (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">v{pack.version}</p>
                </div>
              </div>
              {pack.price === 'pro' && (
                <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-xs rounded-full border border-secondary/30">
                  PRO
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground mb-4 flex-1 line-clamp-2">
              {pack.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />
                <span>{(pack.downloads / 1000).toFixed(1)}k</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                <span>{pack.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{pack.author}</span>
              </div>
            </div>

            {/* Install Button */}
            <button
              onClick={() => handleInstall(pack.id)}
              disabled={pack.installed}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                pack.installed
                  ? 'bg-primary/20 text-primary cursor-default'
                  : 'bg-accent/20 text-accent hover:bg-accent/30'
              }`}
            >
              {pack.installed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Installed</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Install</span>
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
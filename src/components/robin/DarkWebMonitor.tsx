import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Search, 
  AlertTriangle, 
  Shield, 
  Mail, 
  Globe, 
  Key,
  Database,
  Clock,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface BreachResult {
  id: string;
  source: string;
  date: string;
  dataTypes: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  records: number;
}

const mockBreaches: BreachResult[] = [
  {
    id: 'br-001',
    source: 'DarkMarket Forums',
    date: '2024-01-15',
    dataTypes: ['Email', 'Password Hash', 'IP Address'],
    severity: 'critical',
    records: 1,
  },
  {
    id: 'br-002',
    source: 'Leaked Database #4421',
    date: '2023-11-22',
    dataTypes: ['Email', 'Phone Number'],
    severity: 'high',
    records: 1,
  },
  {
    id: 'br-003',
    source: 'Combo List 2023',
    date: '2023-08-10',
    dataTypes: ['Email', 'Plaintext Password'],
    severity: 'critical',
    records: 2,
  },
];

export function DarkWebMonitor() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<BreachResult[] | null>(null);
  const [searchType, setSearchType] = useState<'email' | 'domain'>('email');

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setResults(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setResults(mockBreaches);
    setIsSearching(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full p-4 gap-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center neon-border-purple">
            <Eye className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold neon-text-purple">Dark Web Monitor</h2>
            <p className="text-sm text-muted-foreground mt-1">Robin Integration • Breach Detection System</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-lg border border-secondary/30">
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-xs text-secondary font-medium">Robin Active</span>
        </div>
      </div>

      {/* Search Section */}
      <div className="glass-panel-purple rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setSearchType('email')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              searchType === 'email' 
                ? 'bg-secondary/20 text-secondary border border-secondary/30' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">Email</span>
          </button>
          <button
            onClick={() => setSearchType('domain')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              searchType === 'domain' 
                ? 'bg-secondary/20 text-secondary border border-secondary/30' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">Domain</span>
          </button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={searchType === 'email' ? 'Enter email address...' : 'Enter domain name...'}
              className="w-full bg-muted/50 border border-border/40 rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSearching ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                <span>Scan Dark Web</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Searches across 10,000+ breach databases, paste sites, and dark web forums
        </p>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
              <Eye className="absolute inset-0 m-auto w-8 h-8 text-secondary" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-medium">Scanning dark web sources...</p>
              <p className="text-sm text-muted-foreground">This may take a moment</p>
            </div>
          </motion.div>
        )}

        {results && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col gap-4 overflow-auto"
          >
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-panel rounded-xl p-4 border-l-4 border-l-destructive">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span className="text-sm text-muted-foreground">Breaches Found</span>
                </div>
                <p className="text-3xl font-display font-bold text-destructive">{results.length}</p>
              </div>
              <div className="glass-panel rounded-xl p-4 border-l-4 border-l-warning">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-warning" />
                  <span className="text-sm text-muted-foreground">Total Records</span>
                </div>
                <p className="text-3xl font-display font-bold text-warning">
                  {results.reduce((acc, r) => acc + r.records, 0)}
                </p>
              </div>
              <div className="glass-panel rounded-xl p-4 border-l-4 border-l-primary">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                </div>
                <p className="text-3xl font-display font-bold text-destructive">Critical</p>
              </div>
            </div>

            {/* Breach List */}
            <div className="flex-1 space-y-3 overflow-auto">
              {results.map((breach, index) => (
                <motion.div
                  key={breach.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-panel rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        breach.severity === 'critical' ? 'bg-destructive/20' :
                        breach.severity === 'high' ? 'bg-warning/20' : 'bg-muted'
                      }`}>
                        <AlertTriangle className={`w-5 h-5 ${
                          breach.severity === 'critical' ? 'text-destructive' :
                          breach.severity === 'high' ? 'text-warning' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{breach.source}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Discovered: {breach.date}</span>
                        </div>
                      </div>
                    </div>
                    <SeverityBadge severity={breach.severity} />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {breach.dataTypes.map((type) => (
                      <span
                        key={type}
                        className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground"
                      >
                        {type === 'Password Hash' || type === 'Plaintext Password' ? (
                          <Key className="w-3 h-3 text-destructive" />
                        ) : type === 'Email' ? (
                          <Mail className="w-3 h-3 text-secondary" />
                        ) : (
                          <Database className="w-3 h-3" />
                        )}
                        {type}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">
                      {breach.records} record{breach.records > 1 ? 's' : ''} exposed
                    </span>
                    <button className="flex items-center gap-1 text-xs text-secondary hover:underline">
                      <span>View Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="glass-panel rounded-xl p-4 border border-primary/30">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Recommended Actions
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Change passwords on all affected accounts immediately</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Enable two-factor authentication where available</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Monitor accounts for suspicious activity</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {!results && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <Eye className="w-10 h-10 text-secondary/50" />
            </div>
            <div>
              <p className="text-foreground font-medium">Enter an email or domain to scan</p>
              <p className="text-sm text-muted-foreground mt-1">
                Robin will search across dark web sources for any leaked data
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SeverityBadge({ severity }: { severity: 'critical' | 'high' | 'medium' | 'low' }) {
  const config = {
    critical: { label: 'Critical', className: 'bg-destructive/20 text-destructive border-destructive/30' },
    high: { label: 'High', className: 'bg-warning/20 text-warning border-warning/30' },
    medium: { label: 'Medium', className: 'bg-accent/20 text-accent border-accent/30' },
    low: { label: 'Low', className: 'bg-muted text-muted-foreground border-border' },
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${config[severity].className}`}>
      {config[severity].label}
    </span>
  );
}
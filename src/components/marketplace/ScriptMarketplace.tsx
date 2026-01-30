import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Shield,
  Star,
  Download,
  Eye,
  Play,
  Bitcoin,
  AlertTriangle,
  CheckCircle,
  Code,
  Terminal,
  Clock,
  TrendingUp,
  Package,
  User,
  Tag,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { SecurityAsset, getAssets } from '@/lib/marketplace-db';
import { ExecutionSandbox } from './ExecutionSandbox';
import { TransactionStepper } from './TransactionStepper';

const categoryFilters = [
  { value: 'all', label: 'All Categories' },
  { value: 'reconnaissance', label: 'Reconnaissance' },
  { value: 'exploitation', label: 'Exploitation' },
  { value: 'post-exploitation', label: 'Post-Exploitation' },
  { value: 'defense', label: 'Defense' },
  { value: 'utility', label: 'Utility' },
];

export function ScriptMarketplace() {
  const [assets, setAssets] = useState<SecurityAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'downloads' | 'rating' | 'newest'>('downloads');
  const [selectedAsset, setSelectedAsset] = useState<SecurityAsset | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'ETH' | 'USDT'>('USDT');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      // Fetch real assets from IndexedDB - no mock data
      const allAssets = await getAssets();
      // Only show verified assets in marketplace
      setAssets(allAssets.filter(a => a.isVerified || a.vexisSecureBadge));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssets = assets
    .filter((asset) => {
      if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          asset.title.toLowerCase().includes(query) ||
          asset.description.toLowerCase().includes(query) ||
          asset.vendorName.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'downloads': return b.downloads - a.downloads;
        case 'rating': return b.rating - a.rating;
        case 'newest': return b.createdAt - a.createdAt;
        default: return 0;
      }
    });

  const handlePurchase = (asset: SecurityAsset) => {
    setSelectedAsset(asset);
    setShowTransaction(true);
  };

  const handleValidationComplete = (passed: boolean) => {
    if (passed) {
      toast.success('Script validated successfully!', { icon: '✓' });
    } else {
      toast.error('Validation failed - review required', { icon: '⚠️' });
    }
  };

  const getPrice = (asset: SecurityAsset) => {
    switch (selectedCurrency) {
      case 'BTC': return `₿ ${asset.priceBTC}`;
      case 'ETH': return `Ξ ${asset.priceETH}`;
      case 'USDT': return `$${asset.priceUSDT}`;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold neon-text flex items-center gap-3">
            <Package className="w-7 h-7" />
            Script Marketplace
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Verified human-logic security scripts with crypto-escrow protection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCurrency} onValueChange={(v) => setSelectedCurrency(v as 'BTC' | 'ETH' | 'USDT')}>
            <SelectTrigger className="w-32 bg-card/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC">
                <span className="flex items-center gap-2">
                  <Bitcoin className="w-4 h-4 text-[#F7931A]" />
                  BTC
                </span>
              </SelectItem>
              <SelectItem value="ETH">
                <span className="flex items-center gap-2">
                  <span className="text-[#627EEA] font-bold">Ξ</span>
                  ETH
                </span>
              </SelectItem>
              <SelectItem value="USDT">
                <span className="flex items-center gap-2">
                  <span className="text-[#26A17B] font-bold">₮</span>
                  USDT
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scripts, vendors, or keywords..."
            className="pl-10 bg-card/50 border-border/50"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 bg-card/50">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryFilters.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'downloads' | 'rating' | 'newest')}>
          <SelectTrigger className="w-40 bg-card/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="downloads">Most Downloads</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="w-4 h-4" />
          <span>{assets.length} Scripts</span>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <Shield className="w-4 h-4" />
          <span>{assets.filter(a => a.vexisSecureBadge).length} Vexis-Secure</span>
        </div>
        <div className="flex items-center gap-2 text-warning">
          <AlertTriangle className="w-4 h-4" />
          <span>{assets.filter(a => a.isFlagged).length} Flagged</span>
        </div>
      </div>

      {/* Script Grid */}
      <ScrollArea className="flex-1">
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Scripts Available</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              The marketplace is waiting for verified scripts. Visit the Vendor Forge to upload and verify your security tools.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
          <AnimatePresence mode="popLayout">
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "glass-panel border transition-all hover:border-primary/50 cursor-pointer h-full",
                  asset.vexisSecureBadge
                    ? "border-primary/30"
                    : asset.isFlagged
                    ? "border-destructive/30"
                    : "border-border/50"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                          <span className="truncate">{asset.title}</span>
                          {asset.vexisSecureBadge && (
                            <Badge className="bg-primary/20 text-primary text-[10px] shrink-0">
                              <Shield className="w-3 h-3 mr-1" />
                              Secure
                            </Badge>
                          )}
                          {asset.isFlagged && (
                            <Badge variant="destructive" className="text-[10px] shrink-0">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{asset.vendorName}</span>
                        </div>
                      </div>
                      <div className={cn(
                        "text-lg font-bold",
                        selectedCurrency === 'BTC' ? 'text-[#F7931A]' :
                        selectedCurrency === 'ETH' ? 'text-[#627EEA]' :
                        'text-[#26A17B]'
                      )}>
                        {getPrice(asset)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {asset.description}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">
                        <Tag className="w-3 h-3 mr-1" />
                        {asset.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        <Code className="w-3 h-3 mr-1" />
                        {asset.language}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px]",
                          asset.logicDensityScore >= 70 ? "border-primary/50 text-primary" :
                          asset.logicDensityScore >= 50 ? "border-warning/50 text-warning" :
                          "border-destructive/50 text-destructive"
                        )}
                      >
                        Logic: {asset.logicDensityScore}%
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {asset.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-warning" />
                          {asset.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(asset.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border/30">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          setSelectedAsset(asset);
                          setShowPreview(true);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs border-accent/50 text-accent hover:bg-accent/10"
                        onClick={() => {
                          setSelectedAsset(asset);
                          setShowSandbox(true);
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Validate
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handlePurchase(asset)}
                      >
                        <Bitcoin className="w-3 h-3 mr-1" />
                        Buy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        )}
      </ScrollArea>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden glass-panel">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              {selectedAsset?.title}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="code" className="mt-4">
            <TabsList className="grid grid-cols-2 bg-muted/30">
              <TabsTrigger value="code">Source Code</TabsTrigger>
              <TabsTrigger value="proof">Usage Proof</TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="mt-4">
              <ScrollArea className="h-[400px]">
                <pre className="p-4 bg-terminal rounded-lg text-xs font-mono text-primary overflow-x-auto">
                  {selectedAsset?.sourceCode}
                </pre>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="proof" className="mt-4">
              <ScrollArea className="h-[400px]">
                <pre className="p-4 bg-terminal rounded-lg text-xs font-mono text-primary overflow-x-auto">
                  {selectedAsset?.usageLog}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Execution Sandbox */}
      <ExecutionSandbox
        asset={selectedAsset}
        isOpen={showSandbox}
        onClose={() => setShowSandbox(false)}
        onValidationComplete={handleValidationComplete}
      />

      {/* Transaction Stepper */}
      <TransactionStepper
        asset={selectedAsset}
        currency={selectedCurrency}
        isOpen={showTransaction}
        onClose={() => setShowTransaction(false)}
        onComplete={(success) => {
          if (success) {
            toast.success('Script added to your Vexis Lab');
            loadAssets();
          }
        }}
      />
    </div>
  );
}

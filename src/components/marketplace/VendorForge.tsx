import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Code,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Terminal,
  FileCode,
  Trash2,
  Edit3,
  Eye,
  Bitcoin,
  Wallet,
  Clock,
  Star,
  Package,
  Fingerprint,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  SecurityAsset,
  saveAsset,
  getAssetsByVendor,
  deleteAsset,
  analyzeLogicDensity,
  generateSafetyReport,
} from '@/lib/marketplace-db';
import { VerificationWizard } from './VerificationWizard';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-javascript';

const VENDOR_ID = 'vendor-001'; // Mock vendor ID

const categoryOptions = [
  { value: 'reconnaissance', label: 'Reconnaissance' },
  { value: 'exploitation', label: 'Exploitation' },
  { value: 'post-exploitation', label: 'Post-Exploitation' },
  { value: 'defense', label: 'Defense' },
  { value: 'utility', label: 'Utility' },
];

const languageOptions = [
  { value: 'python', label: 'Python', ext: 'py' },
  { value: 'bash', label: 'Bash', ext: 'sh' },
  { value: 'powershell', label: 'PowerShell', ext: 'ps1' },
  { value: 'go', label: 'Go', ext: 'go' },
  { value: 'rust', label: 'Rust', ext: 'rs' },
  { value: 'javascript', label: 'JavaScript', ext: 'js' },
];

export function VendorForge() {
  const [assets, setAssets] = useState<SecurityAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingAsset, setEditingAsset] = useState<SecurityAsset | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ score: number; flags: string[] } | null>(null);
  const [showVerificationWizard, setShowVerificationWizard] = useState(false);
  const [pendingAsset, setPendingAsset] = useState<SecurityAsset | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SecurityAsset['category']>('utility');
  const [language, setLanguage] = useState<SecurityAsset['language']>('python');
  const [sourceCode, setSourceCode] = useState('');
  const [usageLog, setUsageLog] = useState('');
  const [priceBTC, setPriceBTC] = useState('0.001');
  const [priceETH, setPriceETH] = useState('0.02');
  const [priceUSDT, setPriceUSDT] = useState('50');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    const vendorAssets = await getAssetsByVendor(VENDOR_ID);
    setAssets(vendorAssets);
  };

  const handleCodeChange = useCallback((code: string) => {
    setSourceCode(code);
    if (code.length > 50) {
      const result = analyzeLogicDensity(code);
      setAnalysisResult(result);
    } else {
      setAnalysisResult(null);
    }
  }, []);

  const handleSubmit = async () => {
    if (!title || !sourceCode || !usageLog) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsUploading(true);
    
    try {
      const analysis = analyzeLogicDensity(sourceCode);
      const safetyReport = generateSafetyReport(sourceCode);
      
      const asset: SecurityAsset = {
        id: editingAsset?.id || `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        vendorId: VENDOR_ID,
        vendorName: 'CyberVendor_X',
        title,
        description,
        category,
        language,
        sourceCode,
        usageLog,
        priceBTC: parseFloat(priceBTC),
        priceETH: parseFloat(priceETH),
        priceUSDT: parseFloat(priceUSDT),
        logicDensityScore: analysis.score,
        isVerified: false,
        isFlagged: analysis.score < 50 || analysis.flags.length > 2,
        flagReason: analysis.flags.length > 0 ? analysis.flags.join('; ') : undefined,
        vexisSecureBadge: false, // Will be set by verification wizard
        safetyReport,
        downloads: editingAsset?.downloads || 0,
        rating: editingAsset?.rating || 0,
        createdAt: editingAsset?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      // Open verification wizard instead of direct save
      setPendingAsset(asset);
      setShowVerificationWizard(true);
      setIsUploading(false);
    } catch (error) {
      toast.error('Failed to prepare asset');
      setIsUploading(false);
    }
  };

  const handleVerificationComplete = async (passed: boolean, verifiedAsset: SecurityAsset) => {
    await saveAsset(verifiedAsset);
    await loadAssets();
    resetForm();
    
    if (passed) {
      toast.success('Asset verified and listed on marketplace!');
    } else {
      toast.error('Verification failed - Asset saved as draft');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('utility');
    setLanguage('python');
    setSourceCode('');
    setUsageLog('');
    setPriceBTC('0.001');
    setPriceETH('0.02');
    setPriceUSDT('50');
    setEditingAsset(null);
    setAnalysisResult(null);
  };

  const handleEdit = (asset: SecurityAsset) => {
    setEditingAsset(asset);
    setTitle(asset.title);
    setDescription(asset.description);
    setCategory(asset.category);
    setLanguage(asset.language);
    setSourceCode(asset.sourceCode);
    setUsageLog(asset.usageLog);
    setPriceBTC(asset.priceBTC.toString());
    setPriceETH(asset.priceETH.toString());
    setPriceUSDT(asset.priceUSDT.toString());
    setAnalysisResult(analyzeLogicDensity(asset.sourceCode));
  };

  const handleDelete = async (id: string) => {
    await deleteAsset(id);
    await loadAssets();
    toast.success('Asset deleted');
  };

  const getHighlightedCode = (code: string, lang: string) => {
    try {
      return Prism.highlight(code, Prism.languages[lang] || Prism.languages.javascript, lang);
    } catch {
      return code;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold neon-text flex items-center gap-3">
            <Package className="w-7 h-7" />
            Vendor Forge
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your security assets and earn crypto
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-primary/50 text-primary">
            <Wallet className="w-3 h-3 mr-1" />
            {assets.length} Assets
          </Badge>
          <Badge variant="outline" className="border-secondary/50 text-secondary">
            <Bitcoin className="w-3 h-3 mr-1" />
            Escrow Active
          </Badge>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Upload Form */}
        <Card className="glass-panel border-primary/20 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              {editingAsset ? 'Edit Asset' : 'Upload New Asset'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList className="grid grid-cols-4 bg-muted/30">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="proof">Proof</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Advanced Port Scanner"
                      className="bg-background/50 border-border/50 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase">Description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what your script does..."
                      className="bg-background/50 border-border/50 mt-1 min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Category</label>
                      <Select value={category} onValueChange={(v) => setCategory(v as SecurityAsset['category'])}>
                        <SelectTrigger className="bg-background/50 border-border/50 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Language</label>
                      <Select value={language} onValueChange={(v) => setLanguage(v as SecurityAsset['language'])}>
                        <SelectTrigger className="bg-background/50 border-border/50 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Source Code
                      </label>
                      {analysisResult && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            analysisResult.score >= 70 ? 'border-primary/50 text-primary' :
                            analysisResult.score >= 50 ? 'border-warning/50 text-warning' :
                            'border-destructive/50 text-destructive'
                          )}
                        >
                          Logic Density: {analysisResult.score}%
                        </Badge>
                      )}
                    </div>
                    <div className="relative">
                      <Textarea
                        value={sourceCode}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        placeholder={`#!/usr/bin/env ${language}\n\n# Your code here...`}
                        className="bg-terminal font-mono text-sm min-h-[300px] border-border/50"
                        style={{ tabSize: 2 }}
                      />
                    </div>
                    {analysisResult && analysisResult.flags.length > 0 && (
                      <div className="mt-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                        <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          Turing Filter Warnings
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {analysisResult.flags.map((flag, i) => (
                            <li key={i}>• {flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="proof" className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase flex items-center gap-2 mb-2">
                      <Terminal className="w-4 h-4" />
                      Usage Log ("Dirty Hands" Proof)
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Paste the terminal output showing your script in action. This proves human testing.
                    </p>
                    <Textarea
                      value={usageLog}
                      onChange={(e) => setUsageLog(e.target.value)}
                      placeholder={`$ ./script.py --target 192.168.1.1
[*] Initializing scan...
[+] Found 3 open ports
[+] 22/ssh, 80/http, 443/https
[*] Scan completed in 2.3s`}
                      className="bg-terminal font-mono text-xs min-h-[200px] border-border/50 text-primary"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/30 mb-4">
                    <div className="flex items-center gap-2 text-secondary text-sm font-medium mb-2">
                      <Shield className="w-4 h-4" />
                      Crypto-Escrow Protection
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Funds are held in escrow until the buyer's Vexis Lab confirms your script works as advertised.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                        <Bitcoin className="w-3 h-3 text-[#F7931A]" />
                        BTC
                      </label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={priceBTC}
                        onChange={(e) => setPriceBTC(e.target.value)}
                        className="bg-background/50 border-border/50 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                        <span className="text-[#627EEA]">Ξ</span>
                        ETH
                      </label>
                      <Input
                        type="number"
                        step="0.001"
                        value={priceETH}
                        onChange={(e) => setPriceETH(e.target.value)}
                        className="bg-background/50 border-border/50 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                        <span className="text-[#26A17B]">₮</span>
                        USDT
                      </label>
                      <Input
                        type="number"
                        step="1"
                        value={priceUSDT}
                        onChange={(e) => setPriceUSDT(e.target.value)}
                        className="bg-background/50 border-border/50 mt-1"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 mt-6 pb-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isUploading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-4 h-4 mr-2" />
                      {editingAsset ? 'Update & Verify' : 'Submit for Verification'}
                    </>
                  )}
                </Button>
                {editingAsset && (
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Assets List */}
        <Card className="glass-panel border-primary/20 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCode className="w-5 h-5 text-primary" />
              Your Security Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <AnimatePresence mode="popLayout">
                {assets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No assets yet. Upload your first security script!</p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    {assets.map((asset) => (
                      <motion.div
                        key={asset.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "p-4 rounded-lg border transition-all",
                          asset.vexisSecureBadge
                            ? "bg-primary/5 border-primary/30"
                            : asset.isFlagged
                            ? "bg-destructive/5 border-destructive/30"
                            : "bg-card/50 border-border/50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium truncate">{asset.title}</h3>
                              {asset.vexisSecureBadge && (
                                <Badge className="bg-primary/20 text-primary text-xs">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Vexis-Secure
                                </Badge>
                              )}
                              {asset.isFlagged && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Flagged
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {asset.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <Badge variant="outline" className="text-xs">
                                {asset.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {asset.language}
                              </Badge>
                              <span className="text-muted-foreground">
                                Logic: {asset.logicDensityScore}%
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <span className="text-[#F7931A]">₿ {asset.priceBTC}</span>
                              <span className="text-[#627EEA]">Ξ {asset.priceETH}</span>
                              <span className="text-[#26A17B]">₮ {asset.priceUSDT}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => handleEdit(asset)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(asset.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {asset.downloads} downloads
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {asset.rating.toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(asset.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Verification Wizard */}
      <VerificationWizard
        asset={pendingAsset}
        isOpen={showVerificationWizard}
        onClose={() => {
          setShowVerificationWizard(false);
          setPendingAsset(null);
        }}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
}

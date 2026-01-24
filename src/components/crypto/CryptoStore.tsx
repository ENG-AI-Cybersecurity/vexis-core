import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bitcoin,
  Wallet,
  ShoppingCart,
  Package,
  Check,
  Clock,
  Loader2,
  Shield,
  Zap,
  Star,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CryptoProduct {
  id: string;
  name: string;
  description: string;
  priceBTC: number;
  priceETH: number;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isHot?: boolean;
  features: string[];
}

type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'completed';

const products: CryptoProduct[] = [
  {
    id: '1',
    name: 'Elite Pentesting Suite',
    description: 'Advanced penetration testing toolkit with 50+ custom exploits',
    priceBTC: 0.0045,
    priceETH: 0.085,
    category: 'Tools',
    rating: 4.9,
    reviews: 234,
    inStock: true,
    isHot: true,
    features: ['Custom exploits', 'Auto-reporting', 'OPSEC focused'],
  },
  {
    id: '2',
    name: 'OSINT Master Collection',
    description: 'Complete OSINT framework with API integrations',
    priceBTC: 0.0028,
    priceETH: 0.052,
    category: 'Intel',
    rating: 4.7,
    reviews: 156,
    inStock: true,
    features: ['100+ sources', 'Real-time alerts', 'Export tools'],
  },
  {
    id: '3',
    name: 'Malware Analysis Lab Pack',
    description: 'Pre-configured REMnux environment with analysis tools',
    priceBTC: 0.0062,
    priceETH: 0.115,
    category: 'Labs',
    rating: 4.8,
    reviews: 89,
    inStock: true,
    isHot: true,
    features: ['Sandbox ready', 'Yara rules', 'IOC extraction'],
  },
  {
    id: '4',
    name: 'CTF Training Bundle',
    description: '200+ challenges across all difficulty levels',
    priceBTC: 0.0015,
    priceETH: 0.028,
    category: 'Training',
    rating: 4.6,
    reviews: 412,
    inStock: true,
    features: ['Web/Pwn/Rev', 'Walkthroughs', 'Leaderboard'],
  },
  {
    id: '5',
    name: 'Zero-Day Research Kit',
    description: 'Fuzzing framework with vulnerability templates',
    priceBTC: 0.012,
    priceETH: 0.22,
    category: 'Research',
    rating: 5.0,
    reviews: 47,
    inStock: false,
    features: ['AFL++', 'Coverage guided', 'Triage tools'],
  },
  {
    id: '6',
    name: 'Red Team Ops Manual',
    description: 'Comprehensive guide with real-world case studies',
    priceBTC: 0.0008,
    priceETH: 0.015,
    category: 'Training',
    rating: 4.9,
    reviews: 678,
    inStock: true,
    features: ['500+ pages', 'Templates', 'Updates'],
  },
];

const btcPrice = 65432; // Mock BTC price
const ethPrice = 3521; // Mock ETH price

export function CryptoStore() {
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH'>('BTC');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [cart, setCart] = useState<string[]>([]);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const cartTotal = cart.reduce((acc, id) => {
    const product = products.find(p => p.id === id);
    if (!product) return acc;
    return acc + (selectedCrypto === 'BTC' ? product.priceBTC : product.priceETH);
  }, 0);

  const handleConnectWallet = () => {
    // Mock wallet connection
    setWalletAddress('0x' + Array(40).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join(''));
    setWalletConnected(true);
    toast.success('Wallet connected!', {
      icon: '🔐',
      style: {
        background: 'hsl(220 25% 8%)',
        color: 'hsl(45 100% 55%)',
        border: '1px solid hsl(45 100% 35%)',
      },
    });
  };

  const handleAddToCart = (productId: string) => {
    if (cart.includes(productId)) {
      setCart(cart.filter(id => id !== productId));
    } else {
      setCart([...cart, productId]);
    }
  };

  const handleCheckout = async () => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setTxStatus('pending');
    await new Promise(r => setTimeout(r, 2000));
    setTxStatus('confirming');
    await new Promise(r => setTimeout(r, 3000));
    setTxStatus('completed');
    
    toast.success('Transaction completed!', {
      icon: '✅',
      style: {
        background: 'hsl(220 25% 8%)',
        color: 'hsl(120 100% 50%)',
        border: '1px solid hsl(120 100% 25%)',
      },
    });

    setTimeout(() => {
      setTxStatus('idle');
      setCart([]);
    }, 2000);
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
          <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
            <Bitcoin className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-warning">Crypto Store</h2>
            <p className="text-sm text-muted-foreground">Premium tools • BTC/ETH accepted</p>
          </div>
        </div>

        {/* Wallet & Cart */}
        <div className="flex items-center gap-3">
          {walletConnected ? (
            <div className="flex items-center gap-2 px-3 py-2 glass-panel rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-xs text-muted-foreground">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="flex items-center gap-2 px-4 py-2 bg-warning/20 text-warning rounded-lg hover:bg-warning/30 transition-colors"
            >
              <Wallet className="w-4 h-4" />
              <span className="font-medium">Connect Wallet</span>
            </button>
          )}

          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 glass-panel rounded-lg">
              <ShoppingCart className="w-4 h-4" />
              <span className="font-medium">{cart.length}</span>
            </button>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Crypto Toggle & Categories */}
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setSelectedCrypto('BTC')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedCrypto === 'BTC' ? 'bg-warning/20 text-warning' : 'text-muted-foreground'
            }`}
          >
            <Bitcoin className="w-4 h-4" />
            BTC
          </button>
          <button
            onClick={() => setSelectedCrypto('ETH')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedCrypto === 'ETH' ? 'bg-accent/20 text-accent' : 'text-muted-foreground'
            }`}
          >
            <span className="text-lg">⟠</span>
            ETH
          </button>
        </div>

        <div className="w-px h-6 bg-border" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              !selectedCategory ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedCategory === cat ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 grid grid-cols-3 gap-4 overflow-y-auto">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-panel rounded-xl p-4 flex flex-col ${
              !product.inStock ? 'opacity-60' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-muted text-muted-foreground rounded">
                  {product.category}
                </span>
                {product.isHot && (
                  <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-destructive/20 text-destructive rounded flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Hot
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-warning">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-medium">{product.rating}</span>
                <span className="text-xs text-muted-foreground">({product.reviews})</span>
              </div>
            </div>

            {/* Content */}
            <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

            {/* Features */}
            <div className="flex flex-wrap gap-1 mb-4">
              {product.features.map((feature) => (
                <span key={feature} className="px-2 py-0.5 text-[10px] bg-primary/10 text-primary rounded">
                  {feature}
                </span>
              ))}
            </div>

            <div className="mt-auto">
              {/* Price */}
              <div className="flex items-center justify-between mb-3">
                <div className={`flex items-center gap-2 text-lg font-bold ${
                  selectedCrypto === 'BTC' ? 'text-warning' : 'text-accent'
                }`}>
                  {selectedCrypto === 'BTC' ? (
                    <>
                      <Bitcoin className="w-5 h-5" />
                      {product.priceBTC}
                    </>
                  ) : (
                    <>
                      <span className="text-xl">⟠</span>
                      {product.priceETH}
                    </>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  ≈ ${((selectedCrypto === 'BTC' ? product.priceBTC * btcPrice : product.priceETH * ethPrice)).toFixed(0)}
                </span>
              </div>

              {/* Actions */}
              <button
                onClick={() => handleAddToCart(product.id)}
                disabled={!product.inStock}
                className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  !product.inStock
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : cart.includes(product.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/20 text-primary hover:bg-primary/30'
                }`}
              >
                {!product.inStock ? (
                  'Out of Stock'
                ) : cart.includes(product.id) ? (
                  <>
                    <Check className="w-4 h-4" />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Checkout Bar */}
      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-xl p-4"
        >
          {txStatus === 'idle' ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{cart.length} items in cart</div>
                <div className={`text-xl font-bold flex items-center gap-2 ${
                  selectedCrypto === 'BTC' ? 'text-warning' : 'text-accent'
                }`}>
                  {selectedCrypto === 'BTC' ? <Bitcoin className="w-5 h-5" /> : <span>⟠</span>}
                  {cartTotal.toFixed(4)} {selectedCrypto}
                  <span className="text-sm text-muted-foreground font-normal">
                    (≈ ${((selectedCrypto === 'BTC' ? cartTotal * btcPrice : cartTotal * ethPrice)).toFixed(0)})
                  </span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 neon-border"
              >
                <Shield className="w-4 h-4" />
                Secure Checkout
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <TransactionStepper status={txStatus} />
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function TransactionStepper({ status }: { status: TransactionStatus }) {
  const steps = [
    { id: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
    { id: 'confirming', label: 'Confirming', icon: <Loader2 className="w-4 h-4 animate-spin" /> },
    { id: 'completed', label: 'Completed', icon: <Check className="w-4 h-4" /> },
  ];

  const currentIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="flex items-center justify-center gap-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            index <= currentIndex
              ? 'bg-primary/20 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}>
            {step.icon}
            <span className="font-medium">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 ${
              index < currentIndex ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

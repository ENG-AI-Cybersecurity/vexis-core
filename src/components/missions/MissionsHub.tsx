import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Lock, 
  Unlock,
  Target,
  Zap,
  Shield,
  Code,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { getMissions, saveMission, completeMission, type Mission } from '@/lib/db';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SkillNode {
  id: string;
  name: string;
  description: string;
  xp: number;
  unlocked: boolean;
  completed: boolean;
  dependencies: string[];
  category: 'reconnaissance' | 'exploitation' | 'post-exploitation' | 'defense';
  position: { x: number; y: number };
}

const initialSkillTree: SkillNode[] = [
  // Reconnaissance Branch
  { id: 'nmap-basics', name: 'Nmap Basics', description: 'Learn port scanning fundamentals', xp: 100, unlocked: true, completed: true, dependencies: [], category: 'reconnaissance', position: { x: 1, y: 0 } },
  { id: 'service-enum', name: 'Service Enumeration', description: 'Identify running services', xp: 150, unlocked: true, completed: true, dependencies: ['nmap-basics'], category: 'reconnaissance', position: { x: 1, y: 1 } },
  { id: 'vuln-scan', name: 'Vulnerability Scanning', description: 'Automated vuln detection', xp: 200, unlocked: true, completed: false, dependencies: ['service-enum'], category: 'reconnaissance', position: { x: 1, y: 2 } },
  { id: 'osint', name: 'OSINT Techniques', description: 'Open source intelligence', xp: 250, unlocked: false, completed: false, dependencies: ['vuln-scan'], category: 'reconnaissance', position: { x: 1, y: 3 } },

  // Exploitation Branch
  { id: 'web-basics', name: 'Web Exploitation', description: 'Basic web vulnerabilities', xp: 150, unlocked: true, completed: true, dependencies: [], category: 'exploitation', position: { x: 2, y: 0 } },
  { id: 'sqli', name: 'SQL Injection', description: 'Database exploitation', xp: 200, unlocked: true, completed: false, dependencies: ['web-basics'], category: 'exploitation', position: { x: 2, y: 1 } },
  { id: 'xss', name: 'Cross-Site Scripting', description: 'Client-side attacks', xp: 200, unlocked: true, completed: false, dependencies: ['web-basics'], category: 'exploitation', position: { x: 2.5, y: 1.5 } },
  { id: 'rce', name: 'Remote Code Execution', description: 'Server-side exploitation', xp: 350, unlocked: false, completed: false, dependencies: ['sqli', 'xss'], category: 'exploitation', position: { x: 2, y: 2 } },
  { id: 'buffer-overflow', name: 'Buffer Overflow', description: 'Memory corruption attacks', xp: 500, unlocked: false, completed: false, dependencies: ['rce'], category: 'exploitation', position: { x: 2, y: 3 } },

  // Post-Exploitation Branch
  { id: 'priv-esc', name: 'Privilege Escalation', description: 'Gain higher privileges', xp: 250, unlocked: false, completed: false, dependencies: ['web-basics'], category: 'post-exploitation', position: { x: 3, y: 1 } },
  { id: 'persistence', name: 'Persistence', description: 'Maintain access', xp: 300, unlocked: false, completed: false, dependencies: ['priv-esc'], category: 'post-exploitation', position: { x: 3, y: 2 } },
  { id: 'lateral-move', name: 'Lateral Movement', description: 'Network pivoting', xp: 400, unlocked: false, completed: false, dependencies: ['persistence'], category: 'post-exploitation', position: { x: 3, y: 3 } },

  // Defense Branch
  { id: 'hardening', name: 'System Hardening', description: 'Secure configurations', xp: 150, unlocked: true, completed: false, dependencies: [], category: 'defense', position: { x: 4, y: 0 } },
  { id: 'ids-ips', name: 'IDS/IPS Systems', description: 'Intrusion detection', xp: 250, unlocked: false, completed: false, dependencies: ['hardening'], category: 'defense', position: { x: 4, y: 1 } },
  { id: 'incident-response', name: 'Incident Response', description: 'Handle security events', xp: 350, unlocked: false, completed: false, dependencies: ['ids-ips'], category: 'defense', position: { x: 4, y: 2 } },
];

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  reconnaissance: { bg: 'bg-accent/20', border: 'border-accent/50', text: 'text-accent' },
  exploitation: { bg: 'bg-destructive/20', border: 'border-destructive/50', text: 'text-destructive' },
  'post-exploitation': { bg: 'bg-secondary/20', border: 'border-secondary/50', text: 'text-secondary' },
  defense: { bg: 'bg-success/20', border: 'border-success/50', text: 'text-success' },
};

const categoryIcons: Record<string, React.ReactNode> = {
  reconnaissance: <Target className="w-4 h-4" />,
  exploitation: <Zap className="w-4 h-4" />,
  'post-exploitation': <Code className="w-4 h-4" />,
  defense: <Shield className="w-4 h-4" />,
};

export function MissionsHub() {
  const [skillTree, setSkillTree] = useState<SkillNode[]>(initialSkillTree);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const completedXP = skillTree.filter(n => n.completed).reduce((sum, n) => sum + n.xp, 0);
    setTotalXP(completedXP);
    setLevel(Math.floor(completedXP / 500) + 1);
  }, [skillTree]);

  const handleNodeClick = (node: SkillNode) => {
    setSelectedNode(node);
  };

  const handleStartMission = (node: SkillNode) => {
    if (!node.unlocked) return;
    
    toast.success(`Starting mission: ${node.name}`, {
      icon: '🎯',
      style: { background: '#0a0f1a', color: '#00ff41', border: '1px solid #00ff41' },
    });
  };

  const handleCompleteMission = (node: SkillNode) => {
    setSkillTree(prev => {
      const updated = prev.map(n => {
        if (n.id === node.id) {
          return { ...n, completed: true };
        }
        // Unlock nodes that depend on this one
        if (n.dependencies.includes(node.id)) {
          const allDepsComplete = n.dependencies.every(depId => 
            depId === node.id || prev.find(p => p.id === depId)?.completed
          );
          if (allDepsComplete) {
            return { ...n, unlocked: true };
          }
        }
        return n;
      });
      return updated;
    });

    toast.success(`Mission completed! +${node.xp} XP`, {
      icon: '🏆',
      style: { background: '#0a0f1a', color: '#00ff41', border: '1px solid #00ff41' },
    });

    setSelectedNode(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full p-6 overflow-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold neon-text">Missions Hub</h2>
          <p className="text-sm text-muted-foreground">Complete challenges to unlock new skills</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-3">
            <Trophy className="w-5 h-5 text-warning" />
            <div>
              <div className="text-xs text-muted-foreground">Level</div>
              <div className="font-display font-bold text-warning">{level}</div>
            </div>
          </div>
          <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-3">
            <Star className="w-5 h-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Total XP</div>
              <div className="font-display font-bold text-primary">{totalXP}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Skill Tree Visualization */}
        <div className="col-span-8 glass-panel rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            {Object.entries(categoryColors).map(([cat, colors]) => (
              <div key={cat} className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full', colors.bg, colors.border, 'border')} />
                <span className="text-xs text-muted-foreground capitalize">{cat.replace('-', ' ')}</span>
              </div>
            ))}
          </div>

          <div className="relative h-[500px]">
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {skillTree.map(node => 
                node.dependencies.map(depId => {
                  const parent = skillTree.find(n => n.id === depId);
                  if (!parent) return null;
                  
                  const x1 = parent.position.x * 180 + 60;
                  const y1 = parent.position.y * 110 + 40;
                  const x2 = node.position.x * 180 + 60;
                  const y2 = node.position.y * 110 + 40;
                  
                  return (
                    <line
                      key={`${depId}-${node.id}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={node.unlocked ? 'hsl(120, 100%, 50%)' : 'hsl(160, 30%, 25%)'}
                      strokeWidth={2}
                      strokeDasharray={node.unlocked ? undefined : '4 4'}
                      opacity={0.5}
                    />
                  );
                })
              )}
            </svg>

            {/* Skill Nodes */}
            {skillTree.map((node) => {
              const colors = categoryColors[node.category];
              return (
                <motion.button
                  key={node.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: node.position.y * 0.1 }}
                  onClick={() => handleNodeClick(node)}
                  className={cn(
                    'absolute w-28 p-3 rounded-lg border-2 transition-all',
                    colors.bg,
                    colors.border,
                    node.unlocked ? 'cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed',
                    selectedNode?.id === node.id && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  )}
                  style={{
                    left: node.position.x * 180,
                    top: node.position.y * 110,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn('w-5 h-5', colors.text)}>
                      {categoryIcons[node.category]}
                    </span>
                    {node.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : node.unlocked ? (
                      <Unlock className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-xs font-medium text-foreground truncate">{node.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">+{node.xp} XP</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Mission Details */}
        <div className="col-span-4 glass-panel rounded-lg flex flex-col">
          <div className="p-4 border-b border-border/40">
            <h3 className="font-display font-semibold">Mission Details</h3>
          </div>

          {selectedNode ? (
            <div className="p-4 flex-1 flex flex-col">
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
                categoryColors[selectedNode.category].bg,
                categoryColors[selectedNode.category].border,
                'border'
              )}>
                {categoryIcons[selectedNode.category]}
              </div>

              <h4 className="font-display font-bold text-lg mb-2">{selectedNode.name}</h4>
              <p className="text-sm text-muted-foreground mb-4">{selectedNode.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className={cn('capitalize', categoryColors[selectedNode.category].text)}>
                    {selectedNode.category.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">XP Reward</span>
                  <span className="text-primary font-display font-bold">+{selectedNode.xp}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className={cn(
                    'font-medium',
                    selectedNode.completed ? 'text-success' : selectedNode.unlocked ? 'text-warning' : 'text-muted-foreground'
                  )}>
                    {selectedNode.completed ? 'Completed' : selectedNode.unlocked ? 'Available' : 'Locked'}
                  </span>
                </div>
              </div>

              {selectedNode.dependencies.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs text-muted-foreground mb-2">Prerequisites</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.dependencies.map(depId => {
                      const dep = skillTree.find(n => n.id === depId);
                      return (
                        <div
                          key={depId}
                          className={cn(
                            'px-2 py-1 rounded text-xs',
                            dep?.completed ? 'bg-success/20 text-success' : 'bg-muted/30 text-muted-foreground'
                          )}
                        >
                          {dep?.name}
                          {dep?.completed && <CheckCircle2 className="w-3 h-3 inline ml-1" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-auto space-y-2">
                {selectedNode.completed ? (
                  <div className="flex items-center justify-center gap-2 p-3 bg-success/20 text-success rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Mission Completed</span>
                  </div>
                ) : selectedNode.unlocked ? (
                  <>
                    <button
                      onClick={() => handleStartMission(selectedNode)}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors"
                    >
                      <Target className="w-5 h-5" />
                      Start Mission
                    </button>
                    <button
                      onClick={() => handleCompleteMission(selectedNode)}
                      className="w-full flex items-center justify-center gap-2 p-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      (Dev: Mark Complete)
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2 p-3 bg-muted/30 text-muted-foreground rounded-lg">
                    <Lock className="w-5 h-5" />
                    <span className="font-medium">Complete prerequisites to unlock</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a skill node to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
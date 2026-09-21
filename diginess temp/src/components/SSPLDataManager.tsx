import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Database,
  Users,
  Calendar,
  Newspaper,
  Trophy,
  HelpCircle,
  MessageSquare,
  BarChart3,
  Save,
  X,
  Check,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type {
  SSPLTeam,
  SSPLPlayer,
  SSPLMatch,
  SSPLNews,
  SSPLFAQ,
  SSPLChatbotResponse,
} from '@/types/sspl';

interface SSPLDataManagerProps {
  className?: string;
}

const SSPLDataManager: React.FC<SSPLDataManagerProps> = ({ className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Data states for admin-managed content
  const [teams, setTeams] = useState<SSPLTeam[]>([]);
  const [players, setPlayers] = useState<SSPLPlayer[]>([]);
  const [matches, setMatches] = useState<SSPLMatch[]>([]);
  const [news, setNews] = useState<SSPLNews[]>([]);
  const [faqs, setFaqs] = useState<SSPLFAQ[]>([]);
  const [chatbotResponses, setChatbotResponses] = useState<SSPLChatbotResponse[]>([]);

  // Form states for data entry
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
  const [isChatbotDialogOpen, setIsChatbotDialogOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<any>(null);

  const { toast } = useToast();

  // Load existing data on component mount
  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      setIsLoading(true);

      // Load sample data for demonstration
      setTeams([
        {
          id: '1',
          name: 'Chennai Champions',
          city: 'Chennai',
          captain: 'Rahul Sharma',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Bangalore Blasters',
          city: 'Bangalore',
          captain: 'Vikram Singh',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      setPlayers([
        {
          id: '1',
          name: 'Rahul Sharma',
          position: 'batsman',
          team_id: '1',
          is_active: true,
          stats: {
            matches: 15,
            runs: 450,
            wickets: 0,
            centuries: 1,
            fifties: 2,
            highest_score: 120,
            best_bowling: '',
            average: 30.0,
            strike_rate: 125.5,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Vikram Singh',
          position: 'bowler',
          team_id: '2',
          is_active: true,
          stats: {
            matches: 12,
            runs: 80,
            wickets: 18,
            centuries: 0,
            fifties: 0,
            highest_score: 25,
            best_bowling: '3/15',
            average: 22.5,
            strike_rate: 85.0,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      setFaqs([
        {
          id: '1',
          question: 'How do I register for SSPL T10?',
          answer: 'You can register through our website by filling out the player registration form and completing the payment process.',
          category: 'registration',
          tags: ['registration', 'payment'],
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          question: 'What are the tournament rules?',
          answer: 'SSPL T10 follows standard T10 cricket rules with 10 overs per side. Each team consists of 11 players.',
          category: 'rules',
          tags: ['rules', 'tournament'],
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      setChatbotResponses([
        {
          id: '1',
          trigger_keywords: ['hello', 'hi', 'hey'],
          response_text: 'Hello! I\'m the SSPL assistant. How can I help you today?',
          response_type: 'text',
          category: 'greeting',
          is_active: true,
          usage_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          trigger_keywords: ['teams', 'team'],
          response_text: '🏆 Here are the SSPL teams:\n• Chennai Champions (Chennai)\n• Bangalore Blasters (Bangalore)\n\nWhich team would you like to know more about?',
          response_type: 'text',
          category: 'teams',
          is_active: true,
          usage_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    } catch (error) {
      toast({
        title: 'Data Load Error',
        description: 'Failed to load existing data. Using sample data instead.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = (dataType: string) => {
    let data: any[] = [];
    let filename = '';

    switch (dataType) {
      case 'teams':
        data = teams;
        filename = 'sspl_teams.csv';
        break;
      case 'players':
        data = players;
        filename = 'sspl_players.csv';
        break;
      case 'faqs':
        data = faqs;
        filename = 'sspl_faqs.csv';
        break;
      case 'chatbot':
        data = chatbotResponses;
        filename = 'sspl_chatbot_responses.csv';
        break;
    }

    if (data.length === 0) {
      toast({
        title: 'No Data',
        description: `No ${dataType} data available to export`,
        variant: 'destructive',
      });
      return;
    }

    // Create CSV content
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item =>
      Object.values(item).map(value =>
        typeof value === 'string' && value.includes(',') ? `"${value}"` : String(value),
      ).join(','),
    );
    const csvContent = [headers, ...rows].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Exported ${data.length} ${dataType} records to CSV`,
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Database className="w-6 h-6" />
            SSPL Admin Data Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manually manage SSPL content, FAQs, and chatbot responses
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Teams ({teams.length})
              </TabsTrigger>
              <TabsTrigger value="players" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Players ({players.length})
              </TabsTrigger>
              <TabsTrigger value="faqs" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                FAQs ({faqs.length})
              </TabsTrigger>
              <TabsTrigger value="chatbot" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chatbot ({chatbotResponses.length})
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import/Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-cricket-yellow" />
                      <div>
                        <div className="text-2xl font-bold">{teams.length}</div>
                        <div className="text-sm text-muted-foreground">Teams</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-cricket-blue" />
                      <div>
                        <div className="text-2xl font-bold">{players.length}</div>
                        <div className="text-sm text-muted-foreground">Players</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-8 h-8 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">{faqs.length}</div>
                        <div className="text-sm text-muted-foreground">FAQs</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-8 h-8 text-purple-500" />
                      <div>
                        <div className="text-2xl font-bold">{chatbotResponses.length}</div>
                        <div className="text-sm text-muted-foreground">Responses</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Database className="w-8 h-8 text-sport-orange" />
                      <div>
                        <div className="text-2xl font-bold">
                          {teams.length + players.length + faqs.length + chatbotResponses.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Items</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                      onClick={() => setIsTeamDialogOpen(true)}
                      className="h-20 flex-col gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Team
                    </Button>
                    <Button
                      onClick={() => setIsPlayerDialogOpen(true)}
                      className="h-20 flex-col gap-2"
                      variant="outline"
                    >
                      <Plus className="w-5 h-5" />
                      Add Player
                    </Button>
                    <Button
                      onClick={() => setIsFaqDialogOpen(true)}
                      className="h-20 flex-col gap-2"
                      variant="outline"
                    >
                      <Plus className="w-5 h-5" />
                      Add FAQ
                    </Button>
                    <Button
                      onClick={() => setIsChatbotDialogOpen(true)}
                      className="h-20 flex-col gap-2"
                      variant="outline"
                    >
                      <Plus className="w-5 h-5" />
                      Add Response
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Teams Management</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportData('teams')}
                    disabled={teams.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={() => setIsTeamDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg relative">
                <img src="/assets/svg/pitch-lines.svg" alt="Cricket pitch lines decoration" className="absolute inset-0 w-full h-full object-cover opacity-10" aria-hidden="true" />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Captain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>{team.city}</TableCell>
                        <TableCell>{team.captain}</TableCell>
                        <TableCell>
                          <Badge variant={team.is_active ? 'default' : 'secondary'}>
                            {team.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingItem(team);
                                setIsTeamDialogOpen(true);
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="players" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Players Management</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportData('players')}
                    disabled={players.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={() => setIsPlayerDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Player
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg relative">
                <img src="/assets/svg/pitch-lines.svg" alt="Cricket pitch lines decoration" className="absolute inset-0 w-full h-full object-cover opacity-10" aria-hidden="true" />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Matches</TableHead>
                      <TableHead>Runs</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{player.position}</Badge>
                        </TableCell>
                        <TableCell>
                          {teams.find(t => t.id === player.team_id)?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>{player.stats.matches}</TableCell>
                        <TableCell>{player.stats.runs}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="faqs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">FAQ Management</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportData('faqs')}
                    disabled={faqs.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={() => setIsFaqDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg relative">
                <img src="/assets/svg/pitch-lines.svg" alt="Cricket pitch lines decoration" className="absolute inset-0 w-full h-full object-cover opacity-10" aria-hidden="true" />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {faq.question}
                        </TableCell>
                        <TableCell>{faq.category}</TableCell>
                        <TableCell>{faq.sort_order}</TableCell>
                        <TableCell>
                          <Badge variant={faq.is_active ? 'default' : 'secondary'}>
                            {faq.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="chatbot" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Chatbot Response Management</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportData('chatbot')}
                    disabled={chatbotResponses.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={() => setIsChatbotDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Response
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg relative">
                <img src="/assets/svg/pitch-lines.svg" alt="Cricket pitch lines decoration" className="absolute inset-0 w-full h-full object-cover opacity-10" aria-hidden="true" />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keywords</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chatbotResponses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell className="max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {response.trigger_keywords.slice(0, 3).map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                            {response.trigger_keywords.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{response.trigger_keywords.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {response.response_text}
                        </TableCell>
                        <TableCell>{response.category}</TableCell>
                        <TableCell>{response.usage_count}</TableCell>
                        <TableCell>
                          <Badge variant={response.is_active ? 'default' : 'secondary'}>
                            {response.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Data Import & Export</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Import data from external sources or export current data
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Import Teams</Label>
                      <div className="flex gap-2">
                        <Input type="file" accept=".csv,.json" className="flex-1" />
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Import
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Import Players</Label>
                      <div className="flex gap-2">
                        <Input type="file" accept=".csv,.json" className="flex-1" />
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Import
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Import FAQs</Label>
                      <div className="flex gap-2">
                        <Input type="file" accept=".csv,.json" className="flex-1" />
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Import
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Export All Data</Label>
                      <Button className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Team Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Team' : 'Add New Team'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'This dialog allows administrators to edit an existing team in the SSPL T10 league. Update the team name, city, captain name, and active status as needed.' : 'This dialog allows administrators to create a new team for the SSPL T10 league. Fill in the team name, city, captain name, and set the active status.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input id="teamName" placeholder="Enter team name" />
            </div>
            <div>
              <Label htmlFor="teamCity">City</Label>
              <Input id="teamCity" placeholder="Enter city" />
            </div>
            <div>
              <Label htmlFor="teamCaptain">Captain</Label>
              <Input id="teamCaptain" placeholder="Enter captain name" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="teamActive" defaultChecked />
              <Label htmlFor="teamActive">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsTeamDialogOpen(false)}>
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Player Dialog */}
      <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
            <DialogDescription>
              This dialog allows administrators to add a new player to the SSPL roster. Provide the player's name, position, team assignment, and other relevant details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="playerName">Player Name</Label>
              <Input id="playerName" placeholder="Enter player name" />
            </div>
            <div>
              <Label htmlFor="playerPosition">Position</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batsman">Batsman</SelectItem>
                  <SelectItem value="bowler">Bowler</SelectItem>
                  <SelectItem value="all-rounder">All-rounder</SelectItem>
                  <SelectItem value="wicket-keeper">Wicket Keeper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="playerTeam">Team</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPlayerDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsPlayerDialogOpen(false)}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
            <DialogDescription>
              This dialog allows administrators to create a new frequently asked question and answer pair. Enter the question, answer, category, sort order, and activation status to help users with common inquiries.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="faqQuestion">Question</Label>
              <Input id="faqQuestion" placeholder="Enter FAQ question" />
            </div>
            <div>
              <Label htmlFor="faqAnswer">Answer</Label>
              <Textarea id="faqAnswer" placeholder="Enter FAQ answer" rows={4} />
            </div>
            <div>
              <Label htmlFor="faqCategory">Category</Label>
              <Input id="faqCategory" placeholder="Enter category (e.g., registration, rules)" />
            </div>
            <div>
              <Label htmlFor="faqOrder">Sort Order</Label>
              <Input id="faqOrder" type="number" placeholder="Enter sort order" defaultValue="1" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="faqActive" defaultChecked />
              <Label htmlFor="faqActive">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFaqDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsFaqDialogOpen(false)}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chatbot Response Dialog */}
      <Dialog open={isChatbotDialogOpen} onOpenChange={setIsChatbotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Chatbot Response</DialogTitle>
            <DialogDescription>
              This dialog allows administrators to create a new automated response for the SSPL chatbot. Define trigger keywords, response text, category, and activation status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="responseKeywords">Trigger Keywords</Label>
              <Input
                id="responseKeywords"
                placeholder="Enter keywords separated by commas (e.g., hello, hi, hey)"
              />
            </div>
            <div>
              <Label htmlFor="responseText">Response Text</Label>
              <Textarea
                id="responseText"
                placeholder="Enter chatbot response"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="responseCategory">Category</Label>
              <Input id="responseCategory" placeholder="Enter category (e.g., greeting, info)" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="responseActive" defaultChecked />
              <Label htmlFor="responseActive">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsChatbotDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsChatbotDialogOpen(false)}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SSPLDataManager;
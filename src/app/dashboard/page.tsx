'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Password, type DiaryEntry } from '@/lib/supabase';
import { 
  Shield, 
  Plus, 
  Shuffle, 
  BookOpen, 
  LogOut, 
  Lock,
  Eye,
  EyeOff,
  X,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

type View = 'vault' | 'create' | 'generate' | 'diary';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('vault');
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados para criar senha
  const [newPasswordName, setNewPasswordName] = useState('');
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [pinForSave, setPinForSave] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(false);

  // Estados para gerar senha
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatedPasswordName, setGeneratedPasswordName] = useState('');

  // Estados para diário
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [diaryOpen, setDiaryOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth');
    } else {
      setLoading(false);
      loadPasswords();
      loadDiaryEntries();
    }
  };

  const loadPasswords = async () => {
    const { data, error } = await supabase
      .from('passwords')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar senhas:', error);
    } else {
      setPasswords(data || []);
    }
  };

  const loadDiaryEntries = async () => {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao carregar diário:', error);
    } else {
      setDiaryEntries(data || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const generateRandomPassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(password);
  };

  const simulateBiometricAuth = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simula autenticação biométrica
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };

  const handleOpenVault = async () => {
    toast.info('Autenticando...');
    const authenticated = await simulateBiometricAuth();
    if (authenticated) {
      setVaultOpen(true);
      toast.success('Cofre desbloqueado!');
    }
  };

  const handleOpenDrawer = async (password: Password) => {
    toast.info('Autenticando...');
    const authenticated = await simulateBiometricAuth();
    if (authenticated) {
      setSelectedPassword(password);
      toast.success('Gaveta aberta!');
    }
  };

  const handleSavePassword = async () => {
    if (!newPasswordName || !newPasswordValue) {
      toast.error('Preencha todos os campos');
      return;
    }

    toast.info('Autenticando...');
    const authenticated = await simulateBiometricAuth();
    
    if (authenticated) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('passwords').insert({
        user_id: user.id,
        name: newPasswordName,
        password: newPasswordValue,
      });

      if (error) {
        toast.error('Erro ao salvar senha');
      } else {
        toast.success('Senha salva no cofre!');
        setNewPasswordName('');
        setNewPasswordValue('');
        setCurrentView('vault');
        loadPasswords();
      }
    }
  };

  const handleSaveGeneratedPassword = async () => {
    if (!generatedPasswordName || !generatedPassword) {
      toast.error('Preencha o nome e gere uma senha');
      return;
    }

    toast.info('Autenticando...');
    const authenticated = await simulateBiometricAuth();
    
    if (authenticated) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('passwords').insert({
        user_id: user.id,
        name: generatedPasswordName,
        password: generatedPassword,
      });

      if (error) {
        toast.error('Erro ao salvar senha');
      } else {
        toast.success('Senha salva no cofre!');
        setGeneratedPasswordName('');
        setGeneratedPassword('');
        setCurrentView('vault');
        loadPasswords();
      }
    }
  };

  const handleOpenDiary = async () => {
    toast.info('Autenticando...');
    const authenticated = await simulateBiometricAuth();
    if (authenticated) {
      setDiaryOpen(true);
      toast.success('Diário desbloqueado!');
    }
  };

  const handleSaveDiaryEntry = async () => {
    if (!diaryTitle || !diaryContent) {
      toast.error('Preencha título e conteúdo');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('diary_entries').insert({
      user_id: user.id,
      title: diaryTitle,
      content: diaryContent,
      date: diaryDate,
    });

    if (error) {
      toast.error('Erro ao salvar entrada');
    } else {
      toast.success('Entrada salva no diário!');
      setDiaryTitle('');
      setDiaryContent('');
      setDiaryDate(new Date().toISOString().split('T')[0]);
      loadDiaryEntries();
    }
  };

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success('Senha copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeletePassword = async (id: string) => {
    const { error } = await supabase.from('passwords').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao deletar senha');
    } else {
      toast.success('Senha deletada');
      loadPasswords();
      setSelectedPassword(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a3a5c]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a3a5c] relative overflow-hidden">
      {/* Padrão de circuito de fundo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-black/30 backdrop-blur-md border-r border-white/10 p-6 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <Shield className="w-10 h-10 text-yellow-500" />
            <h1 className="text-2xl font-bold text-white">GUARDIÃO</h1>
          </div>

          {/* Botões do Dashboard */}
          <div className="space-y-4 flex-1">
            <Button
              onClick={() => setCurrentView('create')}
              className={`w-full justify-start gap-3 h-14 text-base ${
                currentView === 'create'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-500/20 hover:bg-blue-500/30'
              }`}
            >
              <Plus className="w-5 h-5" />
              CRIAR NOVA SENHA
            </Button>

            <Button
              onClick={() => setCurrentView('generate')}
              className={`w-full justify-start gap-3 h-14 text-base ${
                currentView === 'generate'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-500/20 hover:bg-blue-500/30'
              }`}
            >
              <Shuffle className="w-5 h-5" />
              GERAR SENHA AUTOMÁTICA
            </Button>

            <Button
              onClick={() => {
                setCurrentView('diary');
                if (!diaryOpen) handleOpenDiary();
              }}
              className={`w-full justify-start gap-3 h-14 text-base ${
                currentView === 'diary'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-500/20 hover:bg-blue-500/30'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              DIÁRIO
            </Button>
          </div>

          {/* Botão de Logout */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3 border-red-500/50 text-red-400 hover:bg-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </Button>
        </div>

        {/* Área Principal */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* View: Vault (Cofre) */}
          {currentView === 'vault' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <button
                  onClick={handleOpenVault}
                  className="group relative"
                >
                  {/* Cofre */}
                  <div className="w-80 h-96 bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-700 rounded-3xl shadow-2xl transform transition-all duration-500 hover:scale-105 border-8 border-yellow-800/50 relative overflow-hidden">
                    {/* Detalhes do cofre */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
                    
                    {/* Fechadura */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-32 h-32 bg-yellow-900 rounded-full flex items-center justify-center shadow-inner">
                        <Lock className="w-16 h-16 text-yellow-300" />
                      </div>
                    </div>

                    {/* Dobradiças */}
                    <div className="absolute left-0 top-20 w-8 h-16 bg-yellow-900 rounded-r-lg"></div>
                    <div className="absolute left-0 bottom-20 w-8 h-16 bg-yellow-900 rounded-r-lg"></div>
                  </div>

                  <p className="mt-6 text-xl text-white font-semibold">
                    Clique para abrir o cofre
                  </p>
                  <p className="mt-2 text-blue-300">
                    {passwords.length} {passwords.length === 1 ? 'senha guardada' : 'senhas guardadas'}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* View: Criar Nova Senha */}
          {currentView === 'create' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Plus className="w-8 h-8 text-yellow-500" />
                  Criar Nova Senha
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="password-value" className="text-white text-lg mb-2 block">
                      Digite sua senha
                    </Label>
                    <Input
                      id="password-value"
                      type="password"
                      value={newPasswordValue}
                      onChange={(e) => setNewPasswordValue(e.target.value)}
                      placeholder="Digite a senha que deseja guardar"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password-name" className="text-white text-lg mb-2 block">
                      Nome da senha
                    </Label>
                    <Input
                      id="password-name"
                      value={newPasswordName}
                      onChange={(e) => setNewPasswordName(e.target.value)}
                      placeholder="Ex: Email, Netflix, Banco..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-lg"
                    />
                  </div>

                  <Button
                    onClick={handleSavePassword}
                    className="w-full h-14 text-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    Salvar no Cofre
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* View: Gerar Senha Automática */}
          {currentView === 'generate' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Shuffle className="w-8 h-8 text-yellow-500" />
                  Gerar Senha Automática
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="generated-name" className="text-white text-lg mb-2 block">
                      Nome da senha
                    </Label>
                    <Input
                      id="generated-name"
                      value={generatedPasswordName}
                      onChange={(e) => setGeneratedPasswordName(e.target.value)}
                      placeholder="Ex: Email, Netflix, Banco..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-lg"
                    />
                  </div>

                  {generatedPassword && (
                    <div>
                      <Label className="text-white text-lg mb-2 block">
                        Senha gerada
                      </Label>
                      <div className="bg-black/30 border border-white/20 rounded-lg p-4 font-mono text-yellow-400 text-lg break-all">
                        {generatedPassword}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      onClick={generateRandomPassword}
                      className="flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700"
                    >
                      <Shuffle className="w-5 h-5 mr-2" />
                      {generatedPassword ? 'Gerar Outra' : 'Gerar Senha'}
                    </Button>

                    {generatedPassword && (
                      <Button
                        onClick={handleSaveGeneratedPassword}
                        className="flex-1 h-14 text-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                      >
                        <Lock className="w-5 h-5 mr-2" />
                        Salvar no Cofre
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View: Diário */}
          {currentView === 'diary' && diaryOpen && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-yellow-500" />
                  Meu Diário Secreto
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="diary-date" className="text-white text-lg mb-2 block">
                      Data
                    </Label>
                    <Input
                      id="diary-date"
                      type="date"
                      value={diaryDate}
                      onChange={(e) => setDiaryDate(e.target.value)}
                      className="bg-white/10 border-white/20 text-white h-12 text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="diary-title" className="text-white text-lg mb-2 block">
                      Título
                    </Label>
                    <Input
                      id="diary-title"
                      value={diaryTitle}
                      onChange={(e) => setDiaryTitle(e.target.value)}
                      placeholder="Título da entrada..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="diary-content" className="text-white text-lg mb-2 block">
                      Conteúdo
                    </Label>
                    <Textarea
                      id="diary-content"
                      value={diaryContent}
                      onChange={(e) => setDiaryContent(e.target.value)}
                      placeholder="Escreva seus pensamentos..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[200px] text-lg"
                    />
                  </div>

                  <Button
                    onClick={handleSaveDiaryEntry}
                    className="w-full h-14 text-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  >
                    Salvar Entrada
                  </Button>

                  {/* Lista de entradas */}
                  {diaryEntries.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-white mb-4">Entradas Anteriores</h3>
                      <div className="space-y-4">
                        {diaryEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="bg-black/30 rounded-lg p-4 border border-white/10"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-lg font-semibold text-white">{entry.title}</h4>
                              <span className="text-sm text-blue-300">
                                {new Date(entry.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-white/80">{entry.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Cofre Aberto (Gavetas) */}
      {vaultOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-700 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-8 border-yellow-800/50 relative">
            <Button
              onClick={() => {
                setVaultOpen(false);
                setSelectedPassword(null);
              }}
              variant="ghost"
              className="absolute top-4 right-4 text-yellow-900 hover:bg-yellow-600"
            >
              <X className="w-6 h-6" />
            </Button>

            <h2 className="text-3xl font-bold text-yellow-900 mb-8 text-center">
              Cofre Aberto - Suas Senhas
            </h2>

            {passwords.length === 0 ? (
              <div className="text-center py-12">
                <Lock className="w-16 h-16 text-yellow-800 mx-auto mb-4" />
                <p className="text-xl text-yellow-900">Nenhuma senha guardada ainda</p>
                <p className="text-yellow-800 mt-2">Crie sua primeira senha usando o menu lateral</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {passwords.map((password) => (
                  <button
                    key={password.id}
                    onClick={() => handleOpenDrawer(password)}
                    className="bg-yellow-800/50 hover:bg-yellow-800/70 rounded-xl p-6 border-4 border-yellow-900/50 transition-all duration-300 hover:scale-105 relative group"
                  >
                    {/* Gaveta */}
                    <div className="text-center">
                      <div className="w-12 h-2 bg-yellow-900 rounded-full mx-auto mb-4"></div>
                      <p className="text-xl font-bold text-white">{password.name}</p>
                      <p className="text-sm text-yellow-200 mt-2">
                        {new Date(password.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    {/* Indicador de clique */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/50 rounded-full p-3">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Gaveta Aberta (Senha) */}
      {selectedPassword && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-700 rounded-2xl p-8 max-w-md w-full border-4 border-yellow-800/50">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-yellow-900">{selectedPassword.name}</h3>
              <Button
                onClick={() => setSelectedPassword(null)}
                variant="ghost"
                size="icon"
                className="text-yellow-900 hover:bg-yellow-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-yellow-900 font-semibold mb-2 block">Senha:</Label>
                <div className="bg-yellow-800/50 rounded-lg p-4 flex items-center justify-between gap-2">
                  <code className="text-white font-mono text-lg break-all flex-1">
                    {showPassword ? selectedPassword.password : '••••••••••••'}
                  </code>
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-yellow-700 flex-shrink-0"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleCopyPassword(selectedPassword.password)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button
                  onClick={() => handleDeletePassword(selectedPassword.id)}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Deletar
                </Button>
              </div>

              <p className="text-sm text-yellow-900 text-center mt-4">
                Criada em: {new Date(selectedPassword.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

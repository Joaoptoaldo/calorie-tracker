import { useEffect, useState } from 'react';
import Dashboard from './Dashboard';

const LS_USER_ID_KEY = 'user_id';

export default function ProtectedDashboard() {
  const [authed, setAuthed] = useState<boolean>(false);
  // token não é usado como gate agora (backend ainda valida X-User-Id)
  const LS_TOKEN_KEY = 'access_token';

  useEffect(() => {
    // limpeza opcional (não quebra fluxo atual)
    if (!localStorage.getItem(LS_USER_ID_KEY) && localStorage.getItem(LS_TOKEN_KEY)) {
      localStorage.removeItem(LS_TOKEN_KEY);
    }
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem(LS_USER_ID_KEY);
    setAuthed(!!userId);
  }, []);

  useEffect(() => {
    if (!authed) {
      // Forçar redirecionamento para a tela de login/cadastro
      window.location.href = '/';
    }
  }, [authed]);

  if (!authed) return null;
  return <Dashboard />;
}


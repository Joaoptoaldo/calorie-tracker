import { useEffect, useState } from 'react';
import Dashboard from './Dashboard';

const LS_USER_ID_KEY = 'user_id';

export default function ProtectedDashboard() {
  const [authed, setAuthed] = useState<boolean>(false);

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


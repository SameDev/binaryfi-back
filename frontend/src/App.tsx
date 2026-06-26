import { useState } from "react";
import type { MusicGenre } from "./types";
import { useAuth } from "./hooks/useAuth";
import { useMusicLibrary } from "./hooks/useMusicLibrary";
import { AuthScreen } from "./components/AuthScreen";
import { PreferencesScreen } from "./components/PreferencesScreen";
import { MainLayout } from "./components/MainLayout";

export default function App() {
  const { currentUser, register, login, logout } = useAuth();
  const library = useMusicLibrary(currentUser?.id ?? null);
  const [editingPreferences, setEditingPreferences] = useState(false);

  if (!currentUser) {
    return <AuthScreen onRegister={register} onLogin={login} />;
  }

  if (!library.ready) {
    return (
      <div className="boot-screen">
        <span className="spinner" />
      </div>
    );
  }

  const needsPreferences =
    library.preferences.length === 0 || editingPreferences;

  if (needsPreferences) {
    return (
      <PreferencesScreen
        userName={currentUser.name}
        initial={library.preferences}
        onConfirm={(genres: MusicGenre[]) => {
          library.savePreferences(genres);
          setEditingPreferences(false);
        }}
      />
    );
  }

  return (
    <MainLayout user={currentUser} library={library} onLogout={logout} />
  );
}

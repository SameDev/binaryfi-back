type Props = {
  userName: string;
  onToggleSidebar: () => void;
};

export function Header({ userName, onToggleSidebar }: Props) {
  const initial = userName.charAt(0).toUpperCase();
  return (
    <header className="app-header">
      <button
        type="button"
        className="menu-toggle"
        aria-label="Abrir menu"
        onClick={onToggleSidebar}
      >
        ☰
      </button>
      <div className="header-spacer" />
      <div className="header-user">
        <span className="header-greeting">Olá, {userName}</span>
        <span className="avatar">{initial}</span>
      </div>
    </header>
  );
}

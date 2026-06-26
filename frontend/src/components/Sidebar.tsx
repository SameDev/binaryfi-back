export type SectionId =
  | "search"
  | "recommendations"
  | "recent"
  | "favorites";

type Props = {
  active: SectionId;
  favoritesCount: number;
  recentCount: number;
  open: boolean;
  onNavigate: (section: SectionId) => void;
  onLogout: () => void;
};

const ITEMS: { id: SectionId; label: string; icon: string }[] = [
  { id: "search", label: "Buscar", icon: "⌕" },
  { id: "recommendations", label: "Recomendações", icon: "✧" },
  { id: "recent", label: "Últimas escutadas", icon: "↺" },
  { id: "favorites", label: "Favoritas", icon: "♥" },
];

export function Sidebar({
  active,
  favoritesCount,
  recentCount,
  open,
  onNavigate,
  onLogout,
}: Props) {
  return (
    <aside className={open ? "sidebar open" : "sidebar"}>
      <div className="brand sidebar-brand">
        <img className="brand-logo" src="/logo.png" alt="BinaryFi" />
        <span>BinaryFi</span>
      </div>

      <nav className="sidebar-nav">
        {ITEMS.map((item) => {
          const badge =
            item.id === "favorites"
              ? favoritesCount
              : item.id === "recent"
                ? recentCount
                : 0;
          return (
            <button
              key={item.id}
              type="button"
              className={active === item.id ? "nav-item active" : "nav-item"}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </button>
          );
        })}
      </nav>

      <button type="button" className="nav-item logout" onClick={onLogout}>
        <span className="nav-icon">⏻</span>
        <span>Sair</span>
      </button>
    </aside>
  );
}

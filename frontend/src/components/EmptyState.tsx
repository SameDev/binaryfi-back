type Props = {
  message: string;
  icon?: string;
};

export function EmptyState({ message, icon = "♪" }: Props) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">{icon}</span>
      <p>{message}</p>
    </div>
  );
}

interface Props {
  color: string;
  initials: string;
  size?: number;
}

export function Avatar({ color, initials, size = 49 }: Props) {
  return (
    <div
      className="avatar"
      style={{
        background: color,
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  );
}

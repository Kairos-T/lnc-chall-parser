export function Card({ children, className = '' }) {
  return <div className={`border shadow-sm rounded-xl ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

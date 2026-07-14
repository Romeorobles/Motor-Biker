function MotoSilhouette({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 220"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="80" cy="160" r="45" />
      <circle cx="310" cy="160" r="45" />
      <circle cx="80" cy="160" r="10" />
      <circle cx="310" cy="160" r="10" />
      <path d="M80 160 140 100 210 100 250 160" />
      <path d="M140 100 120 60 150 60" />
      <path d="M210 100 235 60 260 55" />
      <path d="M250 160 300 130 330 130" />
      <path d="M300 130 290 100 320 90" />
      <path d="M140 100 100 130" />
      <path d="M210 100 200 130 250 160" />
      <path d="M60 45 150 60" />
    </svg>
  )
}

export default MotoSilhouette

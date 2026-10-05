const paths = {
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Zm6 11v-8h6v8",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  reset: "M3 10a9 9 0 1 1 2 8M3 4v6h6",
  plus: "M12 5v14M5 12h14",
  check: "m5 12 4 4L19 6",
  info: "M12 11v6m0-10v.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  warning: "m12 3 10 18H2L12 3Zm0 6v5m0 3v.01",
  compare: "M5 20V10m7 10V4m7 16v-7",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-5",
} as const;

export function Icon({
  name,
  size = 20,
}: {
  name: keyof typeof paths;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

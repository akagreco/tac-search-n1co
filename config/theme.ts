export const tacTheme = {
  primary: "#10A37F",
  primaryStrong: "#0D8C6D",
  secondary: "#ECECEC",
  accent: "#10A37F",
  outline: "#4D4D4D",
  background: "#212121",
  surface: "#2F2F2F",
  surfaceElevated: "#343434",
  border: "#4D4D4D",
  text: "#ECECEC",
  muted: "#B4B4B4",
} as const;

export type TacThemeToken = keyof typeof tacTheme;

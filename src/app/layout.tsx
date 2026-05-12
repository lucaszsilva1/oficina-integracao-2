import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ELLP — Controle de Oficinas',
  description: 'Sistema de gerenciamento de oficinas do projeto ELLP / UTFPR',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

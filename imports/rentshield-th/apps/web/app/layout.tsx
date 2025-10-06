

import { TRPCProvider } from '../lib/trpc/Provider';

export const metadata = {
  title: 'RentShield TH',
  description: 'Bangkok rental finder + lease-protection platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}


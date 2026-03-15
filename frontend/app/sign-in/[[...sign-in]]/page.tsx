'use client';

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignIn 
        appearance={{
          elements: {
            rootBox: {
              width: '100%',
              maxWidth: '400px',
            },
            card: {
              boxShadow: 'none',
              border: '1px solid hsl(var(--border))',
            },
            headerTitle: {
              display: 'none',
            },
            headerSubtitle: {
              display: 'none',
            },
            socialButtonsBlockButton: {
              borderColor: 'hsl(var(--input))',
              backgroundColor: 'transparent',
            },
            dividerLine: {
              backgroundColor: 'hsl(var(--border))',
            },
            dividerText: {
              color: 'hsl(var(--muted-foreground))',
            },
            formFieldLabel: {
              color: 'hsl(var(--foreground))',
            },
            formFieldInput: {
              borderColor: 'hsl(var(--input))',
              backgroundColor: 'hsl(var(--background))',
            },
            footerAction: {
              display: 'none',
            },
          },
          variables: {
            colorPrimary: 'hsl(var(--primary))',
            colorTextOnPrimaryBackground: 'hsl(var(--primary-foreground))',
            colorBackground: 'hsl(var(--background))',
            colorInputBackground: 'hsl(var(--background))',
            colorInputText: 'hsl(var(--foreground))',
            borderRadius: 'var(--radius)',
          },
        }}
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
        redirectUrl="/dashboard"
      />
    </div>
  );
}

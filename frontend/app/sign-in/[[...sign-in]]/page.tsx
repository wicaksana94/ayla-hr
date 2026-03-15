'use client';

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignIn 
        appearance={{
          variables: {
            borderRadius: "0.5rem",
          },
        }}
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
        redirectUrl="/dashboard"
      />
    </div>
  );
}

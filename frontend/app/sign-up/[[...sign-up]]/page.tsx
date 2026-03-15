'use client';

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignUp 
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

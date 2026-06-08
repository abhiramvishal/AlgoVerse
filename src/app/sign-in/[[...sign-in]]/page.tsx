import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-zinc-900 border border-white/10 shadow-2xl rounded-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-zinc-400",
            socialButtonsBlockButton:
              "bg-zinc-800 border border-white/10 text-white hover:bg-zinc-700 transition",
            dividerLine: "bg-white/10",
            dividerText: "text-zinc-500",
            formFieldLabel: "text-zinc-300",
            formFieldInput:
              "bg-zinc-950 border border-white/10 text-white rounded-xl focus:ring-indigo-500",
            formButtonPrimary:
              "bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition",
            footerActionLink: "text-indigo-400 hover:text-indigo-300",
            identityPreviewText: "text-zinc-300",
            identityPreviewEditButton: "text-indigo-400",
          },
        }}
      />
    </div>
  );
}

import { LogoIcon } from "@/components/ui/LogoIcon";

export function MobileHeader() {
  return (
    <div className="mb-8 flex flex-col items-center text-center lg:hidden">
      <div className="gradient-aurora mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-primary/20">
        <LogoIcon className="h-7 w-7 text-white" />
      </div>
      <h1 className="gradient-text text-2xl font-bold">Lexa AI</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to continue</p>
    </div>
  );
}

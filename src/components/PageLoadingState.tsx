import { Loader } from "./Loader";

export function PageLoadingState() {
  return <div className="page-loading-state grid min-h-[calc(100dvh-9rem)] place-items-center md:min-h-72"><Loader size="lg" /></div>;
}

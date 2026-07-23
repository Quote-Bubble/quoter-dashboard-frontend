import SupportPage from "./page";

/**
 * Support has no server data of its own — everything on it is static/local
 * client state — so there's nothing to skeleton. Rendering the real page as
 * its own fallback means the "loading" state and the final state are
 * pixel-identical: nothing to swap in, nothing to feel slow.
 */
export default function SupportLoading() {
  return <SupportPage />;
}

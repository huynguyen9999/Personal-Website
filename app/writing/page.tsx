import { permanentRedirect } from "next/navigation";

export default function WritingPage() {
  return permanentRedirect("/reading");
}

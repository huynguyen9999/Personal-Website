import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminPage from "@/app/admin/page";
import { AUTH_HONEYPOT_FIELD } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";

describe("admin page gates", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.ADMIN_USER_ID;
    vi.mocked(createClient).mockReset();
  });

  it("shows setup required when Supabase config is missing", async () => {
    render(await AdminPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("SETUP REQUIRED")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Your control room is ready to connect/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign in" })).not.toBeInTheDocument();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("shows a quiet sign-in gate without owner-access copy", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_not_a_secret");
    vi.stubEnv("ADMIN_USER_ID", "1c9b420d-c7f9-4d65-a22a-1c98b25e42e8");
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getClaims: async () => ({ data: { claims: null } }),
      },
    } as never);

    render(await AdminPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByText("OWNER ACCESS")).not.toBeInTheDocument();
    expect(screen.queryByText("owner access")).not.toBeInTheDocument();
    expect(screen.queryByText(/sign in to edit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Only the owner account/)).not.toBeInTheDocument();
    expect(screen.queryByText("OWNER VERIFIED")).not.toBeInTheDocument();
    expect(document.querySelector(`input[name="${AUTH_HONEYPOT_FIELD}"]`)).not.toBeNull();
    expect(document.querySelector(".hp-field")).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps a signed-in non-owner on the login gate without revealing owner status", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_not_a_secret");
    vi.stubEnv("ADMIN_USER_ID", "1c9b420d-c7f9-4d65-a22a-1c98b25e42e8");
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getClaims: async () => ({ data: { claims: { email: "intruder@example.com", sub: "user-1" } } }),
      },
    } as never);

    render(await AdminPage({ searchParams: Promise.resolve({ error: "failed" }) }));

    expect(screen.getByText("Sign in failed.")).toBeInTheDocument();
    expect(screen.queryByText(/not authorized/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/authorized owner email/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Editorial control room.")).not.toBeInTheDocument();
  });

  it("keeps failed sign-in copy generic", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_not_a_secret");
    vi.stubEnv("ADMIN_USER_ID", "1c9b420d-c7f9-4d65-a22a-1c98b25e42e8");
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getClaims: async () => ({ data: { claims: null } }),
      },
    } as never);

    render(await AdminPage({ searchParams: Promise.resolve({ error: "failed" }) }));

    expect(screen.getByText("Sign in failed.")).toBeInTheDocument();
    expect(screen.queryByText(/unauthorized/i)).not.toBeInTheDocument();
  });
});

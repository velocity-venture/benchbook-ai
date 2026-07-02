import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCookies,
  mockCreateBrowserClient,
  mockCreateServerClient,
  mockNextResponseNext,
  mockNextResponseRedirect,
} = vi.hoisted(() => ({
  mockCookies: vi.fn(),
  mockCreateBrowserClient: vi.fn(),
  mockCreateServerClient: vi.fn(),
  mockNextResponseNext: vi.fn(),
  mockNextResponseRedirect: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: mockCreateBrowserClient,
  createServerClient: mockCreateServerClient,
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: mockNextResponseNext,
    redirect: mockNextResponseRedirect,
  },
}));

import { createClient as createBrowserSupabaseClient } from "../lib/supabase/client";
import { updateSession } from "../lib/supabase/middleware";
import { createClient as createServerSupabaseClient } from "../lib/supabase/server";

const SUPABASE_URL = "https://project.example";
const SUPABASE_ANON_KEY = "public-anon-value";

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

function restoreSupabaseEnv() {
  if (originalSupabaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  }

  if (originalSupabaseAnonKey === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseAnonKey;
  }
}

function setNeutralSupabaseEnv() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
}

function latestServerClientCookies() {
  const latestCall = mockCreateServerClient.mock.calls.at(-1);
  expect(latestCall).toBeDefined();
  return latestCall?.[2].cookies as {
    getAll: () => CookieToSet[];
    setAll: (cookiesToSet: CookieToSet[]) => void;
  };
}

function createMockResponse(request: { headers: Headers }) {
  const responseCookieSet = vi.fn();

  return {
    cookies: { set: responseCookieSet },
    headers: new Headers(request.headers),
    responseCookieSet,
  };
}

function createMockRequest(pathname = "/dashboard") {
  const requestCookies = new Map<string, string>();
  const requestCookieSet = vi.fn((name: string, value: string) => {
    requestCookies.set(name, value);
  });

  return {
    cookies: {
      getAll: vi.fn(() =>
        Array.from(requestCookies, ([name, value]) => ({ name, value }))
      ),
      set: requestCookieSet,
    },
    headers: new Headers([["x-request-id", "request-1"]]),
    nextUrl: {
      pathname,
      clone: vi.fn(() => ({
        pathname,
      })),
    },
    requestCookieSet,
  };
}

describe("Supabase client creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setNeutralSupabaseEnv();
  });

  afterEach(() => {
    restoreSupabaseEnv();
  });

  it("creates the browser client with the public Supabase env vars", () => {
    const browserClient = { kind: "browser-client" };
    mockCreateBrowserClient.mockReturnValue(browserClient);

    expect(createBrowserSupabaseClient()).toBe(browserClient);
    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
  });

  it("throws a named configuration error before creating the browser client when Supabase env is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createBrowserSupabaseClient()).toThrow(
      "Missing required environment variable(s): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    expect(mockCreateBrowserClient).not.toHaveBeenCalled();
  });

  it("treats blank Supabase env values as missing without exposing values", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "   ";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "   ";

    expect(() => createBrowserSupabaseClient()).toThrow(
      "Missing required environment variable(s): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    expect(mockCreateBrowserClient).not.toHaveBeenCalled();
  });

  it("throws a named configuration error before creating the browser client when the Supabase URL is invalid", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-url";

    expect(() => createBrowserSupabaseClient()).toThrow(
      "Invalid environment variable: NEXT_PUBLIC_SUPABASE_URL"
    );
    expect(mockCreateBrowserClient).not.toHaveBeenCalled();
  });

  it("creates the server client with public env vars and cookie getAll/setAll wiring", () => {
    const existingCookies = [{ name: "existing", value: "cookie-value" }];
    const cookieStore = {
      getAll: vi.fn(() => existingCookies),
      set: vi.fn(),
    };
    const serverClient = { kind: "server-client" };

    mockCookies.mockReturnValue(cookieStore);
    mockCreateServerClient.mockReturnValue(serverClient);

    expect(createServerSupabaseClient()).toBe(serverClient);
    expect(mockCreateServerClient).toHaveBeenCalledWith(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );

    const cookieAdapter = latestServerClientCookies();
    expect(cookieAdapter.getAll()).toBe(existingCookies);

    const cookieOptions = { path: "/", sameSite: "lax" };
    cookieAdapter.setAll([
      { name: "session", value: "session-value", options: cookieOptions },
      { name: "refresh", value: "refresh-value", options: { path: "/" } },
    ]);

    expect(cookieStore.set).toHaveBeenCalledWith(
      "session",
      "session-value",
      cookieOptions
    );
    expect(cookieStore.set).toHaveBeenCalledWith("refresh", "refresh-value", {
      path: "/",
    });
  });

  it("throws a named configuration error before reading cookies or creating the server client when Supabase env is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    expect(() => createServerSupabaseClient()).toThrow(
      "Missing required environment variable(s): NEXT_PUBLIC_SUPABASE_URL"
    );
    expect(mockCookies).not.toHaveBeenCalled();
    expect(mockCreateServerClient).not.toHaveBeenCalled();
  });

  it("does not throw when server cookie writes are unavailable", () => {
    const cookieStore = {
      getAll: vi.fn(() => []),
      set: vi.fn(() => {
        throw new Error("read-only cookies");
      }),
    };

    mockCookies.mockReturnValue(cookieStore);
    mockCreateServerClient.mockReturnValue({ kind: "server-client" });

    createServerSupabaseClient();
    const cookieAdapter = latestServerClientCookies();

    expect(() =>
      cookieAdapter.setAll([{ name: "session", value: "session-value" }])
    ).not.toThrow();
  });

  it("updates middleware request and response cookies without dropping request headers", async () => {
    const request = createMockRequest("/");
    const responseCookies: Array<ReturnType<typeof createMockResponse>> = [];
    const cookiesToSet = [
      {
        name: "session",
        value: "session-value",
        options: { path: "/", httpOnly: true },
      },
    ];

    mockNextResponseNext.mockImplementation(({ request: nextRequest }) => {
      const response = createMockResponse(nextRequest);
      responseCookies.push(response);
      return response;
    });
    mockCreateServerClient.mockImplementation((_url, _key, options) => ({
      auth: {
        getUser: vi.fn(async () => {
          options.cookies.setAll(cookiesToSet);
          return { data: { user: null } };
        }),
      },
    }));

    const response = await updateSession(request as never);

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );
    expect(request.requestCookieSet).toHaveBeenCalledWith(
      "session",
      "session-value"
    );
    expect(response.responseCookieSet).toHaveBeenCalledWith(
      "session",
      "session-value",
      { path: "/", httpOnly: true }
    );
    expect(response.headers.get("x-request-id")).toBe("request-1");
  });

  it("throws a named configuration error before creating the middleware client when Supabase env is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const request = createMockRequest("/");

    await expect(updateSession(request as never)).rejects.toThrow(
      "Missing required environment variable(s): NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    expect(mockCreateServerClient).not.toHaveBeenCalled();
  });
});

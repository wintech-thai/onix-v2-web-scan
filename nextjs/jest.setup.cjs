// Learn more: https://github.com/testing-library/jest-dom
require("@testing-library/jest-dom");

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
      query: {},
      asPath: "/",
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    const { alt, ...rest } = props;
    // eslint-disable-next-line jsx-a11y/alt-text
    return require("react").createElement("img", { alt, ...rest });
  },
}));

// Mock Next.js Link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => {
    return require("react").createElement("a", { href, ...props }, children);
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3000";
process.env.ENCRYPTION_KEY = "test-encryption-key-1234567890";
process.env.ENCRYPTION_IV = "test-iv-123456";

// Suppress console errors during tests (optional)
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock canvas-confetti for tests
jest.mock("canvas-confetti", () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve()),
}));

// Setup matchMedia mock for responsive tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import HamburgerMenu from "../HamburgerMenu";

describe("HamburgerMenu", () => {
  const defaultProps = {
    lang: "en" as const,
    currentUrl: "http://localhost:5001/verify?data=test",
  };

  beforeEach(() => {
    // Reset body overflow style before each test
    document.body.style.overflow = "";
  });

  describe("Rendering", () => {
    it("should render hamburger menu button", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");
      expect(button).toBeInTheDocument();
    });

    it("should render menu icon initially", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");
      expect(button).toBeInTheDocument();
    });

    it("should not show menu panel initially", () => {
      const { container } = render(<HamburgerMenu {...defaultProps} />);
      const panel = container.querySelector(".translate-x-full");
      expect(panel).toBeInTheDocument();
    });
  });

  describe("Menu Opening and Closing", () => {
    it("should open menu when hamburger button is clicked", () => {
      const { container } = render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");

      fireEvent.click(button);

      const panel = container.querySelector(".translate-x-0");
      expect(panel).toBeInTheDocument();
    });

    it("should show backdrop overlay when menu is open", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");

      fireEvent.click(button);

      const backdrop = screen.getByRole("generic", { hidden: true });
      expect(backdrop).toHaveClass("bg-black/50");
    });

    it("should close menu when close button (X) is clicked", async () => {
      const { container } = render(<HamburgerMenu {...defaultProps} />);
      const menuButton = screen.getByLabelText("Menu");

      fireEvent.click(menuButton);

      const closeButton = screen.getByLabelText("Close menu");
      fireEvent.click(closeButton);

      await waitFor(() => {
        const panel = container.querySelector(".translate-x-full");
        expect(panel).toBeInTheDocument();
      });
    });

    it("should close menu when backdrop is clicked", async () => {
      const { container } = render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");

      fireEvent.click(button);

      const backdrop = container.querySelector(".bg-black\\/50");
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      await waitFor(() => {
        const panel = container.querySelector(".translate-x-full");
        expect(panel).toBeInTheDocument();
      });
    });
  });

  describe("Body Scroll Prevention", () => {
    it("should prevent body scroll when menu is open", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");

      fireEvent.click(button);

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should restore body scroll when menu is closed", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");

      fireEvent.click(button);
      expect(document.body.style.overflow).toBe("hidden");

      const closeButton = screen.getByLabelText("Close menu");
      fireEvent.click(closeButton);

      expect(document.body.style.overflow).toBe("");
    });

    it("should restore body scroll on unmount", () => {
      const { unmount } = render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");

      fireEvent.click(button);
      expect(document.body.style.overflow).toBe("hidden");

      unmount();

      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("Language Selection - English", () => {
    it("should display menu title in English when lang is en", () => {
      render(<HamburgerMenu {...defaultProps} lang="en" />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      expect(screen.getByText("Menu")).toBeInTheDocument();
    });

    it("should display language label in English", () => {
      render(<HamburgerMenu {...defaultProps} lang="en" />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      expect(screen.getByText("Language")).toBeInTheDocument();
    });

    it("should highlight English option when lang is en", () => {
      render(<HamburgerMenu {...defaultProps} lang="en" />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      const englishOption = screen.getByText("English").closest("a");
      expect(englishOption).toHaveClass("bg-blue-50");
      expect(englishOption).toHaveClass("text-blue-700");
    });

    it("should show checkmark for English when selected", () => {
      render(<HamburgerMenu {...defaultProps} lang="en" />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      const englishOption = screen.getByText("English").closest("a");
      expect(englishOption?.textContent).toContain("✓");
    });

    it("should not highlight Thai option when English is selected", () => {
      render(<HamburgerMenu {...defaultProps} lang="en" />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      const thaiOption = screen.getByText("ไทย").closest("a");
      expect(thaiOption).toHaveClass("bg-gray-50");
      expect(thaiOption).not.toHaveClass("bg-blue-50");
    });
  });

  describe("Language Selection - Thai", () => {
    it("should display menu title in Thai when lang is th", () => {
      render(<HamburgerMenu {...defaultProps} lang="th" />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      expect(screen.getByText("เมนู")).toBeInTheDocument();
    });

    it("should display language label in Thai", () => {
      render(<HamburgerMenu {...defaultProps} lang="th" />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      expect(screen.getByText("ภาษา")).toBeInTheDocument();
    });

    it("should highlight Thai option when lang is th", () => {
      render(<HamburgerMenu {...defaultProps} lang="th" />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      const thaiOption = screen.getByText("ไทย").closest("a");
      expect(thaiOption).toHaveClass("bg-blue-50");
      expect(thaiOption).toHaveClass("text-blue-700");
    });

    it("should show checkmark for Thai when selected", () => {
      render(<HamburgerMenu {...defaultProps} lang="th" />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      const thaiOption = screen.getByText("ไทย").closest("a");
      expect(thaiOption?.textContent).toContain("✓");
    });
  });

  describe("Language Toggle Links", () => {
    it("should generate correct Thai language link", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      const thaiLink = screen.getByText("ไทย").closest("a");
      expect(thaiLink).toHaveAttribute(
        "href",
        expect.stringContaining("lang=th"),
      );
    });

    it("should generate correct English language link", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      const englishLink = screen.getByText("English").closest("a");
      expect(englishLink).toHaveAttribute(
        "href",
        expect.stringContaining("lang=en"),
      );
    });

    it("should preserve existing query parameters when switching language", () => {
      const propsWithParams = {
        ...defaultProps,
        currentUrl: "http://localhost:5001/verify?data=test&org=napbiotec",
      };
      render(<HamburgerMenu {...propsWithParams} />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      const thaiLink = screen.getByText("ไทย").closest("a");
      const href = thaiLink?.getAttribute("href") || "";
      expect(href).toContain("data=test");
      expect(href).toContain("org=napbiotec");
      expect(href).toContain("lang=th");
    });
  });

  describe("Privacy Policy Link", () => {
    it("should display privacy policy link in English", () => {
      render(<HamburgerMenu {...defaultProps} lang="en" />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    });

    it("should display privacy policy link in Thai", () => {
      render(<HamburgerMenu {...defaultProps} lang="th" />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      expect(screen.getByText("นโยบายความเป็นส่วนตัว")).toBeInTheDocument();
    });

    it("should have correct privacy policy URL", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      const privacyLink = screen.getByText("Privacy Policy").closest("a");
      expect(privacyLink).toHaveAttribute(
        "href",
        "https://www.please-scan.com/privacy",
      );
      expect(privacyLink).toHaveAttribute("target", "_blank");
      expect(privacyLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("Footer", () => {
    it("should display footer text in English", () => {
      render(<HamburgerMenu {...defaultProps} lang="en" />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      expect(screen.getByText("Powered by Please Scan")).toBeInTheDocument();
    });

    it("should display footer text in Thai", () => {
      render(<HamburgerMenu {...defaultProps} lang="th" />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      expect(screen.getByText("โดย Please Scan")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label for menu button", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");
      expect(button).toHaveAttribute("aria-label", "Menu");
    });

    it("should have proper ARIA label for close button", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const menuButton = screen.getByLabelText("Menu");
      fireEvent.click(menuButton);

      const closeButton = screen.getByLabelText("Close menu");
      expect(closeButton).toHaveAttribute("aria-label", "Close menu");
    });

    it("should update aria-expanded when menu opens", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");

      expect(button).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(button);

      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("should have aria-hidden on backdrop", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      const backdrop = screen.getByRole("generic", { hidden: true });
      expect(backdrop).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Edge Cases", () => {
    it("should handle malformed currentUrl gracefully", () => {
      const propsWithBadUrl = {
        ...defaultProps,
        currentUrl: "not-a-valid-url",
      };

      expect(() => {
        render(<HamburgerMenu {...propsWithBadUrl} />);
      }).not.toThrow();
    });

    it("should handle empty currentUrl", () => {
      const propsWithEmptyUrl = {
        ...defaultProps,
        currentUrl: "",
      };

      render(<HamburgerMenu {...propsWithEmptyUrl} />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      const thaiLink = screen.getByText("ไทย").closest("a");
      expect(thaiLink).toHaveAttribute("href");
    });

    it("should handle rapid open/close clicks", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");

      // Rapid clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Should still work without errors
      expect(button).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should have correct z-index for components", () => {
      const { container } = render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      const backdrop = container.querySelector(".z-40");
      const panel = container.querySelector(".z-50");

      expect(backdrop).toBeInTheDocument();
      expect(panel).toBeInTheDocument();
    });

    it("should have transition classes on panel", () => {
      const { container } = render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");
      fireEvent.click(button);

      const panel = container.querySelector(".transition-transform");
      expect(panel).toBeInTheDocument();
    });

    it("should apply hover styles to menu button", () => {
      render(<HamburgerMenu {...defaultProps} />);
      const button = screen.getByLabelText("Menu");

      expect(button).toHaveClass("hover:bg-gray-100");
    });
  });

  describe("Component Integration", () => {
    it("should close menu when language link is clicked", async () => {
      const { container } = render(<HamburgerMenu {...defaultProps} />);
      const menuButton = screen.getByLabelText("Menu");
      fireEvent.click(menuButton);

      const thaiLink = screen.getByText("ไทย");
      fireEvent.click(thaiLink);

      // Menu should start closing (check for translate-x-full class)
      await waitFor(() => {
        const panel = container.querySelector(".translate-x-full");
        expect(panel).toBeInTheDocument();
      });
    });

    it("should close menu when privacy link is clicked", async () => {
      const { container } = render(<HamburgerMenu {...defaultProps} />);
      const menuButton = screen.getByLabelText("Menu");
      fireEvent.click(menuButton);

      const privacyLink = screen.getByText("Privacy Policy");
      fireEvent.click(privacyLink);

      await waitFor(() => {
        const panel = container.querySelector(".translate-x-full");
        expect(panel).toBeInTheDocument();
      });
    });
  });
});

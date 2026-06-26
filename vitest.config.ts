import react from "@vitejs/plugin-react"
import { configDefaults, defineConfig } from "vitest/config"
import { WxtVitest } from "wxt/testing"

export default defineConfig({
  // TODO: remove any
  plugins: [WxtVitest() as any, react()],
  test: {
    exclude: [...configDefaults.exclude, "**/.claude/**", "**/repos/**"],
    environment: "node",
    globals: true,
    setupFiles: "vitest.setup.ts",
    watch: false,
    // The WXT + jsdom suite runs many files in parallel; on a loaded machine the
    // default 5s timeout produces flaky timeouts (and cascade pollution between
    // tests in the same file). Give slow-under-load tests headroom — genuine
    // hangs still fail.
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      // include: ['src/**/*.{ts,tsx}'],
      // exclude: ['src/**/*.spec.ts']
    },
  },
})

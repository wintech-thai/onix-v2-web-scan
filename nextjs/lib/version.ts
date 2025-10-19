/**
 * Version and Build Information Utilities
 * 
 * Provides Git commit ID and build information for deployment tracking.
 * Commit ID is injected at build time via environment variable.
 */

/**
 * Get Git commit ID from environment variable
 * Set during Docker build: docker build --build-arg GIT_COMMIT=$(git rev-parse --short HEAD)
 * Or during CI/CD pipeline
 * 
 * @returns Git commit ID (short hash) or 'unknown' if not set
 */
export function getGitCommitId(): string {
  // Check for build-time environment variable (injected during Docker build)
  if (process.env.NEXT_PUBLIC_GIT_COMMIT) {
    return process.env.NEXT_PUBLIC_GIT_COMMIT;
  }

  // Check for runtime environment variable (injected by Kubernetes)
  if (process.env.GIT_COMMIT) {
    return process.env.GIT_COMMIT;
  }

  return 'unknown';
}

/**
 * Get build timestamp
 * @returns Build timestamp or current time if not set
 */
export function getBuildTimestamp(): string {
  return process.env.NEXT_PUBLIC_BUILD_TIMESTAMP || new Date().toISOString();
}

/**
 * Get application version from package.json
 * @returns Version string (e.g., '2.0.0')
 */
export function getAppVersion(): string {
  return process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0';
}

/**
 * Get full version info for logging and health checks
 * @returns Object with version, commit, build time
 */
export function getVersionInfo() {
  return {
    version: getAppVersion(),
    commit: getGitCommitId(),
    buildTime: getBuildTimestamp(),
    nodeEnv: process.env.NODE_ENV || 'development',
  };
}

/**
 * Log version information on application startup
 * Call this in middleware or root layout
 */
export function logVersionInfo() {
  const info = getVersionInfo();
  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 ONIX v2 Web Scan - Application Started');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📦 Version:    ${info.version}`);
  console.log(`🔖 Commit ID:  ${info.commit}`);
  console.log(`🕐 Build Time: ${info.buildTime}`);
  console.log(`🌍 Environment: ${info.nodeEnv}`);
  console.log('═══════════════════════════════════════════════════');
}

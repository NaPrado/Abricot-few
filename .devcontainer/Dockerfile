FROM node:22-bookworm-slim

# Minimal OS tools — git for VCS, ca-certificates for TLS verification of package downloads
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       git \
       ca-certificates \
       wget \
       curl \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack and pin pnpm so the image is reproducible.
# Upgrade this pin deliberately — never let it float.
RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

# Tell pnpm where its content-addressable store lives.
# This path is backed by the "abricot-pnpm-store" Docker volume declared in
# devcontainer.json, so it persists across container rebuilds without ever
# touching the Windows filesystem (and therefore the host AV scanner).
ENV PNPM_STORE_DIR=/pnpm-store

WORKDIR /workspace

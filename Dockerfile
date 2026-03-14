# Build stage
FROM rust:1.75-bookworm AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y pkg-config libssl-dev

# Copy source
COPY backend/src ./src
COPY backend/Cargo.toml ./Cargo.toml
COPY backend/Cargo.lock ./Cargo.lock

# Build release binary
RUN cargo build --release

# Final stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/ayla-hr-backend .

ENV PORT=8080

EXPOSE 8080

CMD ["./ayla-hr-backend"]

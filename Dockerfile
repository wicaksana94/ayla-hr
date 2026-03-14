FROM rust:1.75-bookworm

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y pkg-config libssl-dev

# Copy Cargo files
COPY backend/Cargo.toml backend/Cargo.lock ./
COPY backend/src ./src

# Build dependencies first (cache layer)
RUN cargo build --release

# Build the app
RUN cargo build --release --bin ayla-hr-backend

# Final stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=0 /app/target/release/ayla-hr-backend .

ENV PORT=8080

EXPOSE 8080

CMD ["./ayla-hr-backend"]

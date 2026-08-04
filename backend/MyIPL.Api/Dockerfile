# --- Build stage ---------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first (cached unless the csproj changes).
COPY MyIPL.Api.csproj ./
RUN dotnet restore

# Copy the rest and publish a trimmed, framework-dependent build.
COPY . ./
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# --- Runtime stage -------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# curl powers the compose healthcheck (and is handy for debugging).
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish ./

ENV ASPNETCORE_ENVIRONMENT=Production
# Default listen port for Docker / local containers. Railway overrides via $PORT
# (Program.cs binds Kestrel to PORT when set).
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "MyIPL.Api.dll"]

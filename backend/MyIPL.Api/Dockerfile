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
COPY --from=build /app/publish ./

ENV ASPNETCORE_ENVIRONMENT=Production
# Railway overrides this with its own $PORT, which Program.cs binds to.
EXPOSE 8080

ENTRYPOINT ["dotnet", "MyIPL.Api.dll"]

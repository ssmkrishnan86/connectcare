# ============================================================
# Stage 1: Build React 19 Frontend
# ============================================================
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ============================================================
# Stage 2: Build ASP.NET Core 10 Web API
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS backend-build
WORKDIR /app

# Copy project files for efficient layer caching
COPY backend/src/ConnectedCare.Domain/ConnectedCare.Domain.csproj backend/src/ConnectedCare.Domain/
COPY backend/src/ConnectedCare.Application/ConnectedCare.Application.csproj backend/src/ConnectedCare.Application/
COPY backend/src/ConnectedCare.Infrastructure/ConnectedCare.Infrastructure.csproj backend/src/ConnectedCare.Infrastructure/
COPY backend/src/ConnectedCare.Api/ConnectedCare.Api.csproj backend/src/ConnectedCare.Api/

RUN dotnet restore backend/src/ConnectedCare.Api/ConnectedCare.Api.csproj

# Copy full backend source and publish
COPY backend/ backend/
RUN dotnet publish backend/src/ConnectedCare.Api/ConnectedCare.Api.csproj -c Release -o /app/publish

# Copy React frontend build output into API wwwroot for SPA hosting
COPY --from=frontend-build /app/frontend/dist /app/publish/wwwroot

# ============================================================
# Stage 3: Production Runtime
# ============================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app

COPY --from=backend-build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_HTTP_PORTS=8080
ENV DOTNET_USE_POLLING_FILE_WATCHER=true
ENV ASPNETCORE_USE_POLLING_FILE_WATCHER=true
EXPOSE 8080

ENTRYPOINT ["dotnet", "ConnectedCare.Api.dll"]

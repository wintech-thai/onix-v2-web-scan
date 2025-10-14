# -------------------------------
# Stage 1: Build
# -------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# copy csproj & restore dependencies
COPY *.csproj ./
RUN dotnet restore

# copy rest of the app
COPY . ./

# build the app
RUN dotnet publish -c Release -o out

# -------------------------------
# Stage 2: Runtime
# -------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# copy published files from build stage
COPY --from=build /app/out ./

# expose port
EXPOSE 5000

# set environment variable to listen on 0.0.0.0
ENV DOTNET_URLS=http://0.0.0.0:5000

# start the app
ENTRYPOINT ["dotnet", "onix-v2-web-scan.dll"]

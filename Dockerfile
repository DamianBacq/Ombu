# Imagen única: compila el frontend y lo sirve desde el servidor .NET
FROM node:22-alpine AS frontend
WORKDIR /src/ombu.client
COPY ombu.client/package*.json ./
RUN npm ci
COPY ombu.client/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend
WORKDIR /src
COPY Ombu.Entidades/ Ombu.Entidades/
COPY Ombu.Datos/ Ombu.Datos/
COPY Ombu.Negocio/ Ombu.Negocio/
COPY Ombu.Server/ Ombu.Server/
# El esproj solo sirve para Visual Studio: se saca la referencia para compilar en Docker
RUN sed -i '/ombu.client.esproj/,/<\/ProjectReference>/d' Ombu.Server/Ombu.Server.csproj
RUN dotnet publish Ombu.Server/Ombu.Server.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=backend /app ./
COPY --from=frontend /src/ombu.client/dist ./wwwroot
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Ombu.Server.dll"]

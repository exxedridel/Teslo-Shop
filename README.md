<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>


# TesloDB API

1. Clonar proyecto
2. Instalar node modules, ejecutar:
```
npm install
```
3. Duplicar archivo ```.env.template``` para generar el ```.env```

4. Levantar la base de datos, ejecutar:
```
docker-compose up -d
```
5. Levantar entorno de desarrollo, ejecutar:
```
npm run start:dev
```
6. Ejecutar petición Seed:
```
http://localhost:3000/api/seed
```
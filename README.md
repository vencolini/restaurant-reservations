# Restaurant Reservations demo app

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.6.

To run the project in Docker container follow the instructions

Hint - Since it's a restaurant reservations app, for the demo it was assumed that it should look good on mobile, because most of the people will grab their smartphone to make such reservation.

## Prerequisits

1. Docker installed on your machine. You can download from [HERE](https://www.docker.com/products/docker-desktop/ "HERE")

## Installation

1. Start Docker.
2. Clone this repo to your machine.
3. Open terminal in the project root folder where Dockerfile is located.
4. Run the following command to build the Docker image.
`docker build -t kreservations .`
5. Then run the following command to start the docker container.
`docker run -p 4200:4200 -p 3000:3000 kreservations`


## Runing the application

Open in the broweser`http://localhost:4200/`.

Also json-server is automatically started at `http://localhost:3000/` to serve the Mock API. You can access it in the browser to see the mock API routes and response data.

Enjoy! :)

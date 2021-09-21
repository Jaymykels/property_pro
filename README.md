## Description

A simple property service that sends an email and calls a webhook when a property is published

## Installation

```bash
# install dependencies
$ yarn

# create .env file and update the environment variables
$ cp .env.example .env
```

## Running the app

```bash
# start mongodb and redis for development
$ docker-compose up -d

# create dummy user
$ yarn seed:user

# start the application in development mode
$ yarn start
```

## Usage

Send a post request to ```http://localhost:3000/property``` with this payload
```json
{
  "user_id": "",
  "name": "",
  "address": "",
  "type": "flat",
  "description": "",
  "image_url": "",
  "total_rooms": "3 bdrm",
  "occupancy_type": "single",
  "rent_amount": "$1200",
  "rent_frequency": "monthly"
}
```

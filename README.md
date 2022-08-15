# ReplikaJS
A Discord bot for Replika, written in JavaScript

## Features

* Sending and receiving messages, with typing notifications.
* Sending and receiving pictures.
* Displaying Replika's status and mood.
* Message voting via Discord reactions.
* Custom Replika avatars!
* Completely automated registration via DMs, either using username and password or authentication tokens.
* "Message remembered" notifications.
* Making two Replikas talk to each other.

## Usage

## Installation

### Heroku

The repository is set up to integrate automatically with Heroku, just create a new app and enable GitHub integration.

### Database

You'll need a PostgreSQL database with the following schema:

```
TABLE settings

user_id        CHAR(24) NOT NULL  PRIMARY KEY,
auth_token     UUID     NOT NULL,
device_id      UUID     NOT NULL,
timestamp_hash UUID     NOT NULL,
bot_id         CHAR(24) NOT NULL,
chat_id        CHAR(24) NOT NULL,
guild_id       BIGINT   NOT NULL,
name           VARCHAR(64),
avatar         TEXT,
prefix         SMALLINT DEFAULT 0
```
Contained in the `database/` directory there's a utility script for creating said database. Beware this will delete the existing table!

### Environment variables

The following environment variables are required:

* `CLIENT_ID`: Your bot's client ID.
* `DATABASE_URL`: The URL of your PostgreSQL database.
* `TOKEN`: Your discord bot's token.


# B-CARE Tool App

This is the B-CARE Tool App for Econometrica. 

## Requirements & Installation

Node.js
Postgresql

Follow instructions for connect-pg
	- Install pgTap into the database
	- psql -d bcare -f ~/Software/pgstap/sql/pgtap.sql
	- psql -d bcare -f ./node_mdoules/connect_pg/lib/session_install.sql
	- select correct_web()_

## Database Operations
>promote database
heroku pg:promote  HEROKU_POSTGRESQL_RED_URL

### Dump local database
> pg_dump -Fc --no-acl --no-owner -h localhost  bcare > bcare.dump

and copy it to an S3 public bucket
https://console.aws.amazon.com/s3/home?region=us-west-2


### Dump remote database
$ heroku pgbackups:capture
$ curl -o latest.dump `heroku pgbackups:url`


### Restore heroku database
[problem is with the web schema...]
> heroku pgbackups:restore DATABASE 'https://s3.amazonaws.com/econometrica/bcare/bcare.dump'

### Set environment variables
> heroku config:set NEW_RELIC_LICENSE_KEY=
> heroku config:set SENDGRID_USER=
> heroku config:set SENDGRID_KEY=
> heroku config:set TWILIO_ACCOUNT_SID=
> heroku config:set TWILIO_AUTH_TOKEN=
> heroku config:set SLIDESHARE_API_KEY=
> heroku config:set SLIDESHARE_API_SECRET=
> heroku config:set WISTIA_API_PASSWORD=
> heroku config:set ANALYTICS_SECRET=

> git push heroku master

Pat Cappelaere	Vightel		pat@cappelaere.com

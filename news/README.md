## Setup

```
npm install
cp sample.env .env
```

Add the keys from the Ghost Admin interface

## Usage

### Generating Mailing list for Authors

```
node get-user-emails.js
```

## Database migration from Ghost to Strapi

1. Install npm packages and prepare `.env` file for this script

```
npm install
cp sample.env .env
```

2. Get the admin key from the Ghost server that you want to pull the data from

    1. Go to the Ghost admin site
    2. Go to `Settings > Integrations > 11ty`
    3. Copy the admin API key and the API URL
    4. Set them to `NEWS_API_ADMIN_KEY` and `NEWS_API_URL` in the `.env` file

3. Generate an API token in the Strapi server that you want to write the data into

    1. Go to the Strapi admin panel
    2. Go to `Settings > API Tokens > Create new API token`
    3. Set these values:
        - Name: any
        - Token duration: any
        - Token type: Full access
    4. Click `Save`
    5. Copy the generated token
    6. Set it to `STRAPI_ACCESS_TOKEN` in the `.env` file

4. Set `STRAPI_API_URL` to the API root, such as `http://localhost:1337/api` if you are running the Strapi app locally

5. In the environment variables **for the Strapi app**, set `DATA_MIGRATION=true`  
    **Make sure to change it back to `false` when you are done with the data migration.**

6. Run the script:

```
node strapi-migration.js
```

*If you see errors saying `Invalid relations`, it is likely there are mismatches between the IDs in the json files in `data` directory and the Strapi database. Try emptying the Strapi database and running the script again.

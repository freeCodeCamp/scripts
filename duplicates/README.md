# Duplicate Account Information Tool

This is a tool to help identify instances of duplicate emails or usernames.

## Generating Reports

NOTE: These queries, while indexed, can still be operationally heavy and should NOT be run against the production database. Instead, run them against a separate cluster (you can create a new cluster and restore a production snapshot).

### Duplicate Emails

`npm run get-emails` will generate a list of all emails which have more than one database entry associated with them. The list will include the `_id` values for the matching documents. The report will be stored in `/results/dupe-emails.csv`.

### Duplicate Usernames

`npm run get-usernames` will generate a list of all usernames which have more than one database entry associated with them. The list will include the `_id` values for the matching documents. The report will be stored in `/results/dupe-usernames.csv`.

## Merging Entries

You cannot merge duplicate username entries automatically - these need to be reviewed manually.

To merge duplicate email entries, run `npm run merge`. This will go through the list of emails in `dupe-emails.csv`, pull down the documents matching the `_id` values, and attempt to merge them.

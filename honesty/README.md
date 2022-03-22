# Database Query Tool

This is a local tool for running some specific database queries to identify dishonest project submissions.

## Getting Certified Users

THIS IS A HEAVY QUERY!!!! You should never run this on the production database. Instead, spin up another MongoDB cluster with the same configuration as production, restore a production snapshot to that new cluster, and run the queries against it. This will ensure that we do not negatively impact our live website.

To get a list of certified users, run `node -r dotenv/config prod/query.js`. This will compile a list of users who have completed each certification, and their submissions for that certification, and write them to `.csv` files for each certification in the `logs` directory.

## Identifying Unusual Submissions

We have a _lot_ of certified campers, and the majority of them are legitimate projects. Rather than manually reviewing each certification submission, run `node prod/flagEntries.js <filename>`. This will run some Regex against the submitted links, and generate filtered lists in the `flagged` directory. These lists will include the database ID and the reason for the flag (based on which condition was not met). Currently, it will flag:

- If all five submissions are from a freeCodeCamp user account (i.e. GitHub or Codepen)
- If all five submissions are from separate user accounts
- If any of the submissions do not have an identifiable username
- If all five submitted links are the same

## Generating an Audit List

Once you have a list of flagged IDs, you can run `node prod/generateAuditList.js <filename>` to convert the list of IDs and reasons into a list of IDs and project submissions.

## Auditing the List

Running `node prod/audit.js <filename>` will start the auditing tool. This will walk you line by line through the list of submissions for the given cert, prompting you to flag or approve each one. Flagged entries will be saved in the `reviewed` directory - This is the final step for verification. Anything you flag here will be marked as `isCheater` in the next step.

## Updating the Database

Finally, running `node -r dotenv/config prod/markCheater.js` will compile the multiple lists of IDs into a single Set and query the database for each one, marking it as `isCheater` if it is found. Once this is done, the camper will no longer be able to view their certification.

## Extra tools

There are a couple of extra tools in this repo.

### Filtering out flagged submissions

When you audit a certification and have the `reviewed` list, you can run `node prod/filter.js <filename>` on the next certification you want to look at. This will generate a new list of the flagged IDs, but with the reviewed IDs filtered out (no need to look at the same camper if they've already been identified as dishonest). Copy the results from the `filtered` directory and overwrite the file in the `audited` directory to apply the new list.

### Duplicate Emails

Running `node -r dotenv/config prod/emails.js` will query the database and return a list of email addresses that are associated with more than one database record.

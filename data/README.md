## What Is This?

This directory contains database snapshots for various points throughout a tutorial. Likely each snapshot will correspond to an individual lesson. Snapshots should be named so that it's easy to figure out what lesson they correspond with.

Example:

`lesson-6.sql.gz`

## How To

From the root directory of your repository:

`mysqldump -q --opt --add-drop-table {DATABASE_NAME} | gzip > docroot/lesson-6.sql.gz`

#Sample Learner Text (replace the above)

## What Is This?

This directory contains database snapshots to create a demo site for this tutorial. Each snapshot corresponds to an individual lesson. Snapshots are named to that it's easy to figure out what lesson they correspond with.

Example:

`06-seriesname.sql.gz`

The Drupal code needed for the demo site is located in the /docroot directory.

To use this demo site code, you will need to install it on a web server. You can do this on a local development environment, or any web server you have access to. For more information about using these demo files, please see complete documentation at https://drupalize.me/SOMEURL.

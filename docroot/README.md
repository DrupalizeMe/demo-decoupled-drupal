## What Is This?

This directory should contain Drupal, and all the code that makes up the site used in a tutorial.

## Getting Started

Ready to start a new series? Copy Drupal's code into this directory and make a first commit.

From the root of this repository:

````
drush dl drupal
cp -R drupal-7.31/. docroot/.
rm -r drupal-7.31
git add -A .
git commit -m "Initial commit of Drupal"
````

#Sample Learner Text (replace the above)

## What Is This?

This directory contains Drupal and all the code that makes up the site used in this tutorial. The database is stored in the /data directory.

To use this demo site code, you will need to install it on a web server. You can do this on a local development environment, or any web server you have access to. For more information about using these demo files, please see complete documentation at https://drupalize.me/SOMEURL.
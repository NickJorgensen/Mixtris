Mixtris
=======
Mixtris is a simple Node.js application that lets you rediscover your favorite music by systematically walking you through your music collection.  As you progress from one song to the next, a simple up or down rating system refines and focuses your collection into separate mixes.  Easily control which mixes you want to hear more of, i.e. only play songs you think are amazing, or just find and play songs that you haven’t heard in a while.


Important Info
------
Mixtris is not a music sharing or hosting application and is designed to be used on a single workstation with a web browser.  Mixtris uses blocking, synchronous code throughout and also uses a  persisted JSON model database that is not designed to handle unfathomably large music collections.

Recent Changes
------
Our overall implementation has been simplified and streamlined.  Namely we have decided to remove Node Webkit, Mixtris now runs solely as a Node.js express app.  In the future we plan on updating Mixtris more regularly and this new application design will be simpler to maintain.

Some improvements include music management.  Managing your collection is all done via file management.  For example, if you want to remove any music from your mix, just remove or delete the files from your ./app/public/allMusicFolder, then, whenever you run $ node web.js, Mixtris will automatically re-scan and clean up any removed files or add any new ones.

Unfortunately our removal of Node Webkit means we will no longer be offering any prebuilt binary installation packages.  Users will need to install Node.js before running Mixtris.  If you have any concerns about this approach please contact us so we can address them.


Installation
=======
Run using Node.js
------
 1. Download and install Node.js and npm.
 2. Clone or download Mixtris repo.
 3. Open up a cmd prompt and cd. into your Mixtris folder.
 4. Type: $ npm install.
 5. Add any music you want to hear to your app/public/allMusicFolder.
 6. Run with Node.js - $ node web.js.
 7. Open up a browser and go to your localhost:8080 address.


Getting Started
=======
When you first start Mixtris with the $ node web.js command, any music files and folder information you placed into the ./app/public/allMusicFolder will be scanned and added to a json file - app/public/musicCatalogFolder/catalogs/catalog.json.

Mixtris is all about finding music and sounds you want to hear in your own library.  Mixtris will randomly play through your entire music platform, bad music and good.  If you like a song, click the up arrow and it will be added to the "good" mix, click the up arrow again and it will be added to the "amazing" mix.

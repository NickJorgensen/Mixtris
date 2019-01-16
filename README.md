

Major Changes

After a long hiatus we have decided to revisit Mixtris.  Version 1.0 has been updated to the latest libraries and our overall implementation has been simplified and streamlined.  Namely we have decided to remove Node Webkit, Mixtris now runs solely as a good old fashioned Node.js express app.  In the future we plan on updating Mixtris more regularly and this new application design will be much more flexible and easier to develop.

Some improvements include music management.  Our users can now simply drag and drop their music files into the /public/allMusicFolder.  Managing your collection is all done through your os’s file system.  For example, if you want to remove any music from your mix, just remove the files from your /public/allMusicFolder, then, whenever you run $ node web.js, Mixtris will automatically scan and clean up any removed files or add any newly added ones as well.

Unfortunately our removal of Node Webkit means we will no longer be offering any prebuilt binary installation packages so users will be required to install Node.js before running Mixtris.  If you have any concerns about this approach please contact us so we can address them.




Mixtris
=======

Mixtris is simple Node.js application that lets you rediscover your favorite music by systematically walking you through your music collection.  As you progress from one song to the next, a simple up or down rating system refines and focuses your collection into separate mixes.  Easily control which mixes you want to hear more of, i.e. only play songs you think are amazing, or just find and play songs that you haven’t heard in a while.




Installation
=======

###Run with Node.js
------


 1. Download and install Node.js and npm.
 2. Clone or download Mixtris repo.
 3. Open up a cmd prompt and cd. into your Mixtris folder.
 4. Type: $ npm install
 5. Add any music you want to hear to your /public/allMusicFolder.
 6. Run with Node.js - $ node web.js
 7. Open up a browser and go to your localhost:8080 address

Uninstall
=======
To remove the application just delete the Mixtris folder - the one cloned from github.


Getting Started
=======
When you first start Mixtris with the $ node web.js command, any music files and folder information you placed into the ./public/allMusicFolder will be scanned and added to a json file - /public/musicCatalogFolder/catalogs/catalog.json.

Mixtris is all about finding music you want to hear in your own library.  Mixtris will randomly play through your entire music platform, bad music and good.  If you like a song, click the Up arrow and it will be added to the "good" mix, click the up arrow again and it will be added to the "amazing" mix.  Once you rate some music and play through a portion of your library you can toggle these different mixes on and off.  If one of these mixes is on, only the tracks contained in this mix will be played.









Mixtris
=======

Mixtris is simple desktop application that lets you rediscover your favorite music by systematically walking you through your entire music collection.  As you progress from one song to the next, a simple up or down rating system refines and focuses your collection into separate mixes.  Easily control which mixes you want to hear more of, i.e. only play songs you think are amazing, or just find and play songs that you haven’t heard in a while.  

Mixtris can be installed on any reasonably newish Windows or OSX operating system.  Mixtris doesn’t import any music files, just select any existing music folder or folders containing you music and Mixtris will scan the folder and find any music files it can play.  The music player/mixer can be run on any html5 enabled browser that is connected to the same local area network your Mixtris host computer runs on.   

Installation
=======

###Pre-Built Install
------

#####Windows
 1. Download installer [Mixtris_Win_Setup.exe](https://s3.amazonaws.com/mixtris_release/Mixtris_Win_Setup.exe)
 2. Double click the your downloaded “Mixtris_Win_Setup.exe” and follow the instructions.
 3. Launch Mixtris by double clicking your installed Mixtris.exe or Mixtris desktop shortcut.

####OSX

 1. Download installer [Mixtris_OSX_Setup.zip](https://s3.amazonaws.com/mixtris_release/Mixtris_OSX_Setup.zip)
 2. Double click your downloaded "Mixtris_OSX_Setup.zip" file. 
 3. Drag the unzipped Mixtris folder into your application folder or wherever you wish to install it.
 4. Launch Mixtris by double clicking "Mixtris.app" contained in your Mixtris folder, or if extensions are hidden, the one just named "Mixtris".

###Build Your Own With Node-Webkit
------

#####Windows

 1. Download and install Node.js and npm.
 2. Clone or download Mixtris repo.
 3. Open up a cmd prompt and cd into your Mixtris folder.
 4. Type:
    `npm install`
 5. Zip up the following 4 folders and files - node_modules, public, package.json, main.html
 6. Name the zipped file app.nw
 7. Download Node-Webkit “win32” Prebuilt binary at [Node-Webkit](https://github.com/rogerwang/node-webkit).
 8. Unzip the Node-Webkit win32 package and move the contents into the Mixtris folder.  Make sure you move all the contents, they are needed to run Mixtris
 8. Open up a cmd prompt and cd into your Mixtris folder.
 9. In the cmd prompt type: `copy /b nw.exe+app.nw Mixtris.exe`
 10. A file called "Mixtris.exe" should now appear…  Just double click "Mixtris.exe" to start Mixtris.

#####OSX

 1. Download and install Node.js and npm.
 2. Clone or download Mixtris repo.
 3. Open up a Terminal prompt and cd into your Mixtris folder.
 4. Type: `npm install`
 5. Download Node-Webkit “Mac” Prebuilt binary at [Node-Webkit](https://github.com/rogerwang/node-webkit).
 6. Unzip the Node-Webkit Mac package and move the contents into the Mixtris folder.  Make sure you move all the contents, they are all needed to run Mixtris.
 7. Open up a terminal prompt and cd into your Mixtris folder.
 8. In the cmd prompt type: `zip -r ./${PWD##*/}.nw *`  A file called Mixtris.nw will be created.
 9. Rename the file "node-webkit.app" to "Mixtris.app" … Finally, double click "Mixtris.app" to start Mixtris.


Uninstall
=======
To remove the application you can just delete the folder where it is installed or if you installed it with the windows .exe installer, just double click unins000.exe in the installed program folder.  Either way works.

Mixtris Application Data, including your Mixtris ratings, can be backed up or removed manually.
* In WINDOWS, you can find this folder under [user\_acount\_name]/AppData/Local/Mixtris.  
* In OSX it is located in the usually hidden, user specific “Library” folder, NOT the system “Library” folder, to open it, type: `~/Library/Mixtris` in Go to open the folder.   
* Your Mixtris file info is saved in "mixtrisFiles" folder.


Getting Started
=======

1. Start Mixtris by double clicking on Mixtris.exe or Mixtris.app.
2. When Mixtris opens you will be greeted by a mostly empty window.  You haven't added any Mixis so lets add one.
  * Click the **+ New** button and select a folder you would like to mix.  For instance, you could select your 'Music' folder in your Itunes Library.
  * Your music files will not be imported or altered by Mixtris.  Mixtris finds their location so it can play them later.  However, If there location changes, or the directories they reside in change, they will be rescanned as new songs. 
  * A new mix should now appear.  This might take a few seconds depending on the size of your library.
3. Next lets open the Controller/Player window.  This is where we rate music up or down and control our mix playback.
  * Below the "Mixtris" logo you should see a web address that looks something like http://10.0.1.4:8085.
  * If you don't see this address than you might not be on an appropriate local area network that supports Mixtris...Sorry.
  * If there is an address than click on it and your default browser should open up asking you to 'Please confirm this connection on Mixtris.'  
  * Go back to your the Mixtris app window you just left and click OK to confirm this device.  You should only need to do this once in a while.
  * Now go back to the browser and you should see that a controller has appeared.
4. Click 'Play Here' in the upper left hand corner and music should begin playing.  Thats it, your good to go!

Additional info
  * Mixtris is all about finding music YOU want to hear..  If you like a song click the Up arrow and it will be added to the "good" mix, click the up arrow again and it will be added to the "amazing" mix.  Once you rate some music and play through a portion of your library you can toggle these different mixes on and off.  If they are on then the music contained in these mixes will be played back for you.









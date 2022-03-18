#Artistic Cooperation Between Smartphones (ACooBS)#

##Goal##
We created an app which allows multiple users to connect to a room via their smartphone or tablet, then lets them draw on a canvas with balls that leave colorful trails and move between the users' screens.

##Functionality##
Our app presents users with a space to type in or randomly generate a room id. Once users have joined rooms, they are presented with a blank canvas. Their swipes generate balls, with the velocity depending on the direction and speed of the swipe. The balls are generated with a random color and they leave a trail; this results in many colorful lines across the screens. If a ball runs into the left side of any user’s screen, it will emerge coming from the right side of another user’s screen, and vice versa. When there are more than 4 users, a ball running into the top of the screen will emerge from the top of another user’s screen.

##How to run##
###Intalling the requirements###
In a terminal window, run "npm i"

###Setting up the server###
In src/screens/Canvas.js, change "10.0.0.53" to your computer's IP address (you can find this in your network settings). Save the change.
Open a terminal window. (Navigate to our project's directory.) Run "node server.js". It should print "Server is up and running on Port 9000".
###Connecting the devices###
On every mobile device that you want to run the app on, install the app Expo Go. This app will download our code onto your mobile device.
Open another terminal window. (Navigate to our project's directory.) Run "expo start". You should see a QR code appear. Scan this QR code with each mobile device; this will automatically launch our app via Expo Go.

TaskWall
========
TaskWall is a To Do management application.

[https://taskwalls.appspot.com/](https://taskwalls.appspot.com/)


Requirements
------------
for users

- modern browsers (such as Chrome, Safari, Firefox, IE 9+)

for developers

- Google App Engine Java SDK
- JDK 6+
- Eclipse 4+
- Gradle IDE plugin


Architecture
------------
Client side:

- HTML 5
- jQuery
- jQuery UI (drag and drop)
- Knockout.js v2
- Twitter Bootstrap v2

Server side:

- Google App Engine Java
- Slim3
- Google Tasks API
- OAuth 2.0


How to set up the project
-------------------------
Run the Gradle task 'eclipse' to prepare below:
- APT factory library (slim3-gen)
- webapp libraries

In Eclipse, click [Run As]-[Gradle Build...] and choose task 'eclipse' there.


How to start the development server
-----------------------------------
Use /DevAppServer.launch to start server.
It requires App Engine SDK is placed at ${workspace_loc}/appengine-java-sdk-1.x.x


How to deploy
-------------
Run the Gradle task 'deploy'
It requires App Engine SDK is placed at ../appengine-java-sdk-1.x.x

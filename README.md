[![logo](https://raw.githubusercontent.com/leon196/CookiePartyInvitro/master/CookiePartyBanner.png)](https://2019.cookie.paris/)
[Live demo](http://shaderland.com/CookieParty/) & [Cookie Party 2019](https://2019.cookie.paris/)  

### Made with:  
[TWGL.js](https://twgljs.org/) + [glsl fast gaussian blur](https://github.com/Jam3/glsl-fast-gaussian-blur) + [Blender](http://blender.org/)  

### Setup the development environment:  
You'll need Blender 2.79 with the addons [blender-html5-animations](https://github.com/KoltesDigital/blender-html5-animations) and [websocket-server-for-blender](https://github.com/KoltesDigital/websocket-server-for-blender).  
Then open a terminal and type:  
```
npm i -s http-server  
npm i -s chokidar-socket-emitter  
npm i  
npm run dev  
```
```
i bet there is a better way to use node.js but i'm rushing this and koltes is not here to help with tooling
```  
![screenshot](https://raw.githubusercontent.com/leon196/CookiePartyInvitro/master/Screenshot.PNG)

[Websocket-Server-for-Blender](https://github.com/KoltesDigital/websocket-server-for-blender) sends timeline to WebGL via WebSockets.  
[HTML5-Animations](https://github.com/KoltesDigital/blender-html5-animations) exports keys frames animation as a json.  

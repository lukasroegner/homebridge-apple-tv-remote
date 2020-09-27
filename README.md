# homebridge-apple-tv-remote

**IMPORTANT**: This plugin is still in development and hasn't reached a stable state. It is recommended to install it in a separate Homebridge instance. Take a look at the issue [#46](https://github.com/lukasroegner/homebridge-apple-tv-remote/issues/46) to check the current state of bugfix.

## About

Plugin for controlling Apple TVs in homebridge. Each Apple TV can be turned on/off via a switch. 
Additionally, a play/pause switch is exposed to HomeKit.

Supported models are:
* Apple TV HD (Apple TV 4)
* Apple TV 4K


The plugin also supports exporting the on/off switch as a TV accessory (you have to add the TV accessory manually to HomeKit, as it is exposed as external accessory).

## Generate credentials for Apple TVs

Before installing the plugin, credentials must be created for each Apple TV. 

You can install the package `node-appletv-x` that contains a command line tool to create the credentials for each Apple TV you want to use:

```
npm install -g node-appletv-x
```

After the installation is completed, use the `appletv pair` command to scan for your Apple TVs in the local network and generate credentials for each of them. 

```appletv pair
% appletv pair        
✔ Connecting to Living Room
✔ Initiating Pairing
? Enter the 4-digit pin that's currently being displayed on Living Room 4679
✔ Completing Pairing
Credentials: 77346115-ED48-46A8-A288-<snip>
```
Copy the response *after* the word Credentials: and paste it into the Config.json, like this. The response is very long - make sure to get all of it. 
The rest of it is shown as `<snip>` in this example. Be sure to not include the word Credentials in the config file:
```
 {
   "platform": "AppleTvPlatform",
   "devices": [
      {
         "name": "Living Room",
         "credentials": "77346115-ED48-46A8-A288-<snip>"
      }
   ]
},
``` 

## Installation

Please install the plugin with the following command:

```
npm install -g homebridge-apple-tv-remote
```

## Configuration

```json
{
    "platforms": [
        {
            "platform": "AppleTvPlatform",
            "devices": [
                {
                    "name": "<UNIQUE-NAME>",
                    "credentials": "<CREDENTIALS>",
                    "isOnOffSwitchEnabled": false,
                    "onOffSwitchName": "<CUSTOM-NAME>",
                    "isOnOffTvEnabled": false,
                    "onOffTvName": "<CUSTOM-NAME>",
                    "isPlayPauseSwitchEnabled": false,
                    "playPauseSwitchName": "<CUSTOM-NAME>",
                    "commandSwitches": [
                        {
                            "name": "<UNIQUE-SWITCH-NAME>",
                            "commands": [...]
                        }
                    ]
                }
            ],
            "isApiEnabled": false,
            "apiPort": 40304,
            "apiToken": "<YOUR-TOKEN>"
        }
    ]
}
```

**devices**: Array of all your Apple TV devices that the plugin should expose.

**name**: A unique name for the device. This helps you to differentiate the entries in the devices array and is used in the API.

**credentials**: The credentials string that has been generated with the `appletv` command.

**isOnOffSwitchEnabled**: If set to true, a switch is exposed for changing on/off of the Apple TV. Defaults to `false`.

**onOffSwitchName** (optional): Can be used to set the initial name that is displayed in the Home app. Useful for plugins like `homebridge-alexa`, where changing the name in the Home app is not propagated back to homebridge.

**isOnOffTvEnabled**: If set to true, a TV accessory is exposed for changing on/off of the Apple TV. Defaults to `false`.

**onOffTvName** (optional): The name of the TV that is displayed in the Home app.

**isPlayPauseSwitchEnabled**: If set to true, a switch is exposed for changing the play state. Defaults to `false`.

**playPauseSwitchName** (optional): Can be used to set the initial name that is displayed in the Home app. Useful for plugins like `homebridge-alexa`, where changing the name in the Home app is not propagated back to homebridge.

**commandSwitches** (optional): You can provide a list of switches that should be additionally exposed to HomeKit. Those switches are "stateless" and execute the configured commands.

**name**: The name of the command switch. Make sure to use a **unique** name for the switch (it can be renamed in the Home app afterwards).

**commands**: The commands that should be executed when the switch is enabled. See **API** for the commands syntax.

**isApiEnabled** (optional): Enables an HTTP API for controlling devices. Defaults to `false`. See **API** for more information.

**apiPort** (optional): The port that the API (if enabled) runs on. Defaults to `40304`, please change this setting of the port is already in use.

**apiToken** (optional): The token that has to be included in each request of the API. Is required if the API is enabled and has no default value.

## API

This plugin also provides an HTTP API to control some features of the Apple TVs. It has been created so that you can further automate the system with HomeKit shortcuts. Starting with iOS 13, you can use shortcuts for HomeKit automation.

If the API is enabled, it can be reached at the specified port on the host of this plugin. 
```
http://<YOUR-HOST-IP-ADDRESS>:<apiPort>
```

The token has to be specified as value of the `Authorization` header on each request:
```
Authorization: <YOUR-TOKEN>
```

### API - Get State

Use the `/<UNIQUE-NAME>` endpoint to get the state of an Apple TV. The HTTP method has to be `GET`:
```
http://<YOUR-HOST-IP-ADDRESS>:<apiPort>/<UNIQUE-NAME>
```

The response body will be JSON:

```
{
    "isOn": true|false,
    "isPlaying": true|false
}
```

### API - Send Commands

Use the `/<UNIQUE-NAME>` endpoint to send commands to an Apple TV. The HTTP method has to be `POST`:
```
http://<YOUR-HOST-IP-ADDRESS>:<apiPort>/<UNIQUE-NAME>
```

The body of the request has to be JSON in the following format:

```
{
    "isOn": true|false,
    "isPlaying": true|false,
    "commands": [
        {
            "key": "<COMMAND1>",
            "longPress": false
        },
        {
            "wait": <MILLISECONDS-TO-WAIT>
        },
        {
            "key": "<COMMAND3>",
            "longPress": false
        }
    ]
}
```

All properties to be set are optional (e.g. you can only send `isOn` as property).

Each command string can be any of following keys:

* `up`
* `down`
* `left`
* `right`
* `menu`
* `topmenu`
* `home`
* `play`
* `pause`
* `stop`
* `next`
* `previous`
* `suspend`
* `wake`
* `volumeup`
* `volumedown`
* `select`

Commands are executed sequentially. Use `wait` to wait before sending the next command.

### API - Send Commands (Simple)

There is a simple endpoint for legacy clients that do not support POST requests:
* Use the `/<UNIQUE-NAME>/set` endpoint to send commands to an Apple TV.
* The HTTP method has to be `GET`.
* The token has to be added as a query parameter named `token`

Switch the Apple TV on or off (`<VALUE>` has to be `true` or `false`):
```
http://<YOUR-HOST-IP-ADDRESS>:<apiPort>/<UNIQUE-NAME>/set?isOn=<VALUE>&token=<TOKEN>
```

Play/pause the Apple TV (`<VALUE>` has to be `true` or `false`):
```
http://<YOUR-HOST-IP-ADDRESS>:<apiPort>/<UNIQUE-NAME>/set?isPlaying=<VALUE>&token=<TOKEN>
```

Send a single command to the Apple TV (`<VALUE>` has to be one of the supported keys):
```
http://<YOUR-HOST-IP-ADDRESS>:<apiPort>/<UNIQUE-NAME>/set?longPressKey=<VALUE>&token=<TOKEN>
http://<YOUR-HOST-IP-ADDRESS>:<apiPort>/<UNIQUE-NAME>/set?pressKey=<VALUE>&token=<TOKEN>
```

# Special Thanks

Special thanks to stickpin who updated and fixed the original `node-appletv` package.

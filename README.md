# ozw-mqtt

## Configuration

Configuration options:

* --usbport (default: /dev/ttyACM0)
* --broker (default: mqtt://localhost)
* -c --config

```
./start.js --usbport /dev/ttyACM7 --broker mqtt://test.mosquitto.org
```

If config.json exists or config file is set with --config values will be loaded from this file

Commandline arguments will override config file, which in turn overrides default values

## Events

### Driver events

* 'zwave/message', 'driver ready'
* 'zwave/message', 'driver failed'
* 'zwave/message', 'scan complete'

Events are avaliable on following topics:

### zwave/value
Value updates from nodes

Example:
```
{
  info: 'value updated',
  node: 7
  label: 'Temperature',
  value: 24.5,
}
```

### zwave/message

Info messages, could be used to log information in app, to file or console.

Example:
```
Adding node: 7
```

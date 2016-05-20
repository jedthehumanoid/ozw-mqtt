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

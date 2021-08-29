M3U File with Replay Support for TV7 from Init7
===============================================

This is an inofficial M3U File to support Replay TV with TV7 on Kodi using the Simple IPTV PVR Client.

![replay-demo](./images/replay-demo.png)


# Configuration in the Simple IPTV PVR Client

* Install the PVR IPTV Simple Client in Kodi.
* Use the URL https://bit.ly/3Dwd606 as M3u playlist URL.

![general](./images/general.png)

* Use the URL https://goo.gl/rNBpPG from [mathewmeconry's EPG Data](https://github.com/mathewmeconry/TV7_EPG_Data)

![general](./images/epg.png)

* Configure Catch up
  * Enable catchup
  * catchup window `7 days`
  * catchup correct `2.0 hours`
  * include channels `with catchup mode`

![general](./images/catchup.png)

# Known caveats
* timing isn't perfect: Since the EPG usually is not 100% accurate the show might not immediately start when you'd expect.

# Generating the files with docker

    docker run -it --rm -v DESTINATION:/app/output nicam/tv7-kodi-replay "m3u-generator"
    docker run -it --rm -v DESTINATION:/app/output nicam/tv7-kodi-replay "epg-generator"


The file `TV7-replay.m3u` has been created.
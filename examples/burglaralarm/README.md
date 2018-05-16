An example on how to use node-red-contrib-norelite for other rule based tasks than controlling lights and switches.

# Information
- Tested on v2.4.2
- Simulates sensor inputs with inject nodes

# Features
- Shell (home mode) and full protection
- If alarm is in shell mode it will activate the alarm whenever a magnet sensor is triggered
- If alarm is in full mode:
    - Give home owner 5 mins to exit the house
    - Play a warning on Sonos media system after 3 mins when alarm is set into full mode that soon it will be active
    - When entering the house from the laundry door give 30s to deactivate the alarm and play a warning on Sonos
    - If alarm is triggered an SMS is sent to the home owner through Twilio and a warning is looping on Sonos

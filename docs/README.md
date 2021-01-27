# node-red-contrib-norelite [![npm version](https://badge.fury.io/js/node-red-contrib-norelite.svg)](https://badge.fury.io/js/node-red-contrib-norelite)

Try to implement this scenario through automation rules in Home Assistant:


*I want the lights on if it is starting to get dark and it is Sun-Thu (workday the day after) between 6-22:30 OR Fri-Sat between 6-23. I also want the lights to be on if it is really dark and the TV is on. But if the TV is turned off I want the lights to stay on for another 15 mins. And if I wake up and need to go to the restroom during the night I want the lights to turn on for 10 mins.*

So in summary:
- It is starting to get dark outside, keep lights on for min 30 mins to avoid frequent switch on/off actions AND
    - Day is Fri-Sat
        - Time is 06:00 - 23:00
    - OR Day is Sun-Mon
        - Time is 06:00 - 22:30
- OR it is really dark outside AND
    - The TV is on
    - OR The TV is turned off but keep the lights on for another 15 mins
    - OR Motion is detected in the house and keep the lights on for 10 mins

It will probably take some work to build automation scripts in Home Assistant to accomplish but in Node-RED fairly simple to implement using node-red-contrib-norelite as illustrated below.

![Illustrative example](sample-scenario.png "Illustrative Example")
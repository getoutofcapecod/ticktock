let LIFE_EXPECTANCY_DATA={USA:{male:76.1,female:81.1},GBR:{male:79.4,female:83.1},CAN:{male:79.9,female:84.1},AUS:{male:80.9,female:85},JPN:{male:81.6,female:87.5}};export async function fetchLifeExpectancy(e,a){if(!e||!a)throw Error("Country and gender must be provided");return LIFE_EXPECTANCY_DATA[e][a]}
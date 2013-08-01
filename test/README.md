# openbadges-bakery-service tests

## Latest Travis Build

[![Build Status](https://travis-ci.org/mozilla/openbadges-bakery-service.png)](https://travis-ci.org/mozilla/openbadges-bakery-service)

## Manual Smoke Testing

Wherever the bakery service has been deployed, 

1. 0.5 round trip
    1. bake the URL `<host>/examples/test-0.5.json`
    2. verify that the screen says **Your Baked Badge**
    3. save the badge displayed on the screen
    4. unbake the saved badge
    5. verify that the screen says **Your Unbaked Badge**
2. 1.0 round trip
    1. bake the URL `<host>/examples/test-1.0.json`
    2. verify that the screen says **Your Baked Badge**
    3. save the badge displayed on the screen
    4. unbake the saved badge
    5. verify that the screen says **Your Unbaked Badge**
3. API round trip
    1. go to `<host>/bake?assertion=<host>/examples/test-1.0.json`
    2. save the file presented for download
    3. unbake the saved badge
    4. verify that the screen says **Your Unbaked Badge**
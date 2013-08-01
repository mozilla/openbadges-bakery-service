# openbadges-bakery-service tests

## Latest Travis Build

[![Build Status](https://travis-ci.org/mozilla/openbadges-bakery-service.png)](https://travis-ci.org/mozilla/openbadges-bakery-service)

## Manual Smoke Testing

Wherever the bakery service has been deployed, 

1. 0.5 round trip
  1. bake the URL `<host>/examples/test-0.5.json`
  1. verify that the screen says **Your Baked Badge**
  1. save the badge displayed on the screen
  1. unbake the saved badge
  1. verify that the screen says **Your Unbaked Badge**
1. 1.0 round trip
  1. bake the URL `<host>/examples/test-1.0.json`
  1. verify that the screen says **Your Baked Badge**
  1. save the badge displayed on the screen
  1. unbake the saved badge
  1. verify that the screen says **Your Unbaked Badge**
1. API round trip
  1. go to `<host>/bake?assertion=<host>/examples/test-1.0.json`
  1. save the file presented for download
  1. unbake the saved badge
  1. verify that the screen says **Your Unbaked Badge**
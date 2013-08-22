#!/bin/sh

cd docs && doctasia -t beauty -m config.json
cd .. && plato -r --jshint .jshintrc -d docs/docs_out/report -t "Arkhaios photo gallery" -x *.json lib

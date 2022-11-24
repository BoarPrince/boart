# 1. Sync Backends Vehicle

tags: env-all, sb-11, sb-11-5, masterdata-sync

## 1.1. Add a Vehicle

tags: sb-11-5.1

* Test description

   |action     |value                        |
   |-----------|-----------------------------|
   |description|Add a vehicle to a carrier   |
   |           |* Vehicle must exist in Fleet|
   |           |* Vehicle must exist in Fuel |
   |priority   |high                         |

* request admin bearer

* add company and carrier, cascaded

* queues bind "fleet-error, vehicle"

* add vehicle

* queues check "fleet-error, vehicle"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "", driver: "", vehicle: "${store:response-vehicle}"

## 1.2. Update a Vehicle

tags: sb-11-5.2

* Test description

   |action     |value                        |
   |-----------|-----------------------------|
   |description|Update a vehicle to a carrier|
   |           |* Vehicle must exist in Fleet|
   |           |* Vehicle must exist in Fuel |
   |priority   |high                         |

* request admin bearer

* add company and carrier, cascaded

* queues bind "fleet-error, vehicle"

* add vehicle

* queues check "fleet-error, vehicle"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "", driver: "", vehicle: "${store:response-vehicle}"

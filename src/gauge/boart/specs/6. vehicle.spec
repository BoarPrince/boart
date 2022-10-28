# 1. Vehicle - MasterData

tags: vehicle, env-all, master-data


## 1.1. Add Vehicle

tags: add-vehicle, md-6.1

* Test description

   |action     |value           |
   |-----------|----------------|
   |description|Adding a vehicle|
   |priority   |high            |

* add company and carrier

* Rest call

   |action                |value                      |
   |----------------------|---------------------------|
   |method:post           |/api/vehicle               |
   |payload               |<file:request-vehicle.json>|
   |description           |Add a new vehicle          |
   |expected:header#status|200                        |
   |store                 |response-vehicle           |

* Rest call

   |action                |value                                       |
   |----------------------|--------------------------------------------|
   |method:get            |/api/vehicle/carrier/${store:response-ca.id}|
   |description           |Find added vehicle by plate                 |
   |query#searchString    |${store:response-vehicle.plate}             |
   |expected:header#status|200                                         |
   |expected:count#content|1                                           |
   |expected#content[0].id|${store:response-vehicle.id}                |

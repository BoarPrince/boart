# 1. DriverAssignment - MasterData

tags: env-all, master-data, masterdata, md-25, driver-assignment, driverAssignment, v2

## 1.1. Check Version 1 triggered notification

tags: md-25.1, event

* Test description

   |action     |value                                                          |
   |-----------|---------------------------------------------------------------|
   |description|Trigger changes on Version 1 User and check event notificatioin|
   |priority   |high                                                           |

* request admin bearer

* add company and carrier

* add vehicle

* add driver only, email: "${generate:s:tpl:user.email}"

* RabbitMQ bind

   |action     |value                       |
   |-----------|----------------------------|
   |exchange   |driverassignment            |
   |queue      |test.md.v1.driverAssignment |
   |description|Bind vehicle version 1 queue|
   |group      |Bind Queues                 |

* RabbitMQ bind

   |action     |value                                |
   |-----------|-------------------------------------|
   |exchange   |masterdata                           |
   |queue      |test.md.v2.driverAssignment          |
   |description|Bind driverAssignment version 2 queue|
   |group      |Bind Queues                          |

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* assign driver and vehicle

* RabbitMQ consume, continue

   |action     |value                                          |
   |-----------|-----------------------------------------------|
   |queue      |test.md.v1.driverAssignment                    |
   |group      |Check Queues (CREATE)                          |
   |description|CREATE V1: DriverAssignment Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                          |
   |----------------------------------|-----------------------------------------------|
   |queue                             |test.md.v2.driverAssignment                    |
   |group                             |Check Queues (CREATE)                          |
   |description                       |CREATE V2: DriverAssignment Event must be fired|
   |expected:header#headers.eventClass|DriverAssignment                               |
   |expected:header#headers.eventType |CREATE                                         |
   |expected#vehicleId                |${store:response-vehicle.id}                   |
   |expected#driverId                 |${store:response-driver.id}                    |

@@@@@  @@@@@@ @      @@@@@@ @@@@@ @@@@@@
@    @ @      @      @        @   @
@    @ @@@@@  @      @@@@@    @   @@@@@
@    @ @      @      @        @   @
@    @ @      @      @        @   @
@@@@@  @@@@@@ @@@@@@ @@@@@@   @   @@@@@@


* Rest call

   |action                |value                                              |
   |----------------------|---------------------------------------------------|
   |method:delete         |/api/assignment/driver/${store:response-vehicle.id}|
   |description           |Remove Assignment between vehicle and driver       |
   |group                 |Check Queues (DELETE)                              |
   |expected:header#status|202                                                |

* RabbitMQ consume, continue

   |action     |value                                          |
   |-----------|-----------------------------------------------|
   |queue      |test.md.v1.driverAssignment                    |
   |group      |Check Queues (DELETE)                          |
   |description|DELETE V1: DriverAssignment Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                          |
   |----------------------------------|-----------------------------------------------|
   |queue                             |test.md.v2.driverAssignment                    |
   |group                             |Check Queues (DELETE)                          |
   |description                       |DELETE V2: DriverAssignment Event must be fired|
   |expected:header#headers.eventClass|DriverAssignment                               |
   |expected:header#headers.eventType |UPDATE                                         |
   |expected#vehicleId                |${store:response-vehicle.id}                   |
   |expected#driverId                 |${store:response-driver.id}                    |

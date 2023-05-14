# 1. Vehicle - MasterData

tags: env-all, master-data, masterdata, md-24, user, v2

## 1.1. Check Version 1 triggered notification

tags: md-24.1, event

* Test description

   |action     |value                                                          |
   |-----------|---------------------------------------------------------------|
   |description|Trigger changes on Version 1 User and check event notificatioin|
   |priority   |high                                                           |

* request admin bearer

* add company and carrier

* RabbitMQ bind

   |action     |value                       |
   |-----------|----------------------------|
   |exchange   |vehicle                     |
   |queue      |test.md.v1.vehicle          |
   |description|Bind vehicle version 1 queue|
   |group      |Bind Queues                 |

* RabbitMQ bind

   |action     |value                       |
   |-----------|----------------------------|
   |exchange   |masterdata                  |
   |queue      |test.md.v2.vehicle          |
   |description|Bind vehicle version 2 queue|
   |group      |Bind Queues                 |

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* add vehicle

* RabbitMQ consume, continue

   |action     |value                                 |
   |-----------|--------------------------------------|
   |queue      |test.md.v1.vehicle                    |
   |group      |Check Queues (CREATE)                 |
   |description|CREATE V1: Vehicle Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                 |
   |----------------------------------|--------------------------------------|
   |queue                             |test.md.v2.vehicle                    |
   |group                             |Check Queues (CREATE)                 |
   |description                       |CREATE V2: Vehcile Event must be fired|
   |expected:header#headers.eventClass|Vehicle                               |
   |expected:header#headers.eventType |CREATE                                |
   |expected#id                       |${store:response-vehicle.id}          |
   |expected#companyId                |${store:response-co.id}               |

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@
@    @ @    @ @    @  @  @    @   @
@    @ @    @ @    @ @    @   @   @@@@@
@    @ @@@@@  @    @ @@@@@@   @   @
@    @ @      @    @ @    @   @   @
 @@@@  @      @@@@@  @    @   @   @@@@@@

* Rest call

   |action                |value                                    |
   |----------------------|-----------------------------------------|
   |method:put            |/api/vehicle/${store:response-vehicle.id}|
   |description           |Update the Vehicle                       |
   |group                 |Check Queues (UPDATE)                    |
   |payload               |${store:response-vehicle}                |
   |expected:header#status|200                                      |

* RabbitMQ consume, continue

   |action     |value                                 |
   |-----------|--------------------------------------|
   |queue      |test.md.v1.vehicle                    |
   |group      |Check Queues (UPDATE)                 |
   |description|UPDATE V1: Vehicle Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                 |
   |----------------------------------|--------------------------------------|
   |queue                             |test.md.v2.vehicle                    |
   |group                             |Check Queues (UPDATE)                 |
   |description                       |UPDATE V2: Vehicle Event must be fired|
   |expected:header#headers.eventClass|Vehicle                               |
   |expected:header#headers.eventType |UPDATE                                |
   |expected#id                       |${store:response-vehicle.id}          |
   |expected#plate                    |${store:response-vehicle.plate}       |
   |expected#companyId                |${store:response-co.id}               |

@@@@@  @@@@@@ @      @@@@@@ @@@@@ @@@@@@
@    @ @      @      @        @   @
@    @ @@@@@  @      @@@@@    @   @@@@@
@    @ @      @      @        @   @
@    @ @      @      @        @   @
@@@@@  @@@@@@ @@@@@@ @@@@@@   @   @@@@@@

* Rest call

   |action                |value                                    |
   |----------------------|-----------------------------------------|
   |method:delete         |/api/vehicle/${store:response-vehicle.id}|
   |description           |Delete the Vehicle                       |
   |group                 |Check Queues (DELETE)                    |
   |expected:header#status|204                                      |

* RabbitMQ consume, continue

   |action     |value                                 |
   |-----------|--------------------------------------|
   |queue      |test.md.v1.vehicle                    |
   |group      |Check Queues (DELETE)                 |
   |description|DELETE V1: Vehicle Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                 |
   |----------------------------------|--------------------------------------|
   |queue                             |test.md.v2.vehicle                    |
   |group                             |Check Queues (DELETE)                 |
   |description                       |DELETE V2: Vehicle Event must be fired|
   |expected:header#headers.eventClass|Vehicle                               |
   |expected:header#headers.eventType |DELETE                                |
   |expected#id                       |${store:response-vehicle.id}          |

## 1.2. Add Vehicle

tags: md-24.2, event

* Test description

   |action     |value                      |
   |-----------|---------------------------|
   |description|Creates a Version 2 Vehicle|
   |priority   |high                       |

* request admin bearer

* add company and carrier

* Rest call

   |action                |value                  |
   |----------------------|-----------------------|
   |method:post           |/api/v2/vehicle        |
   |description           |Add a Vehicle          |
   |payload#plate         |${generate:char:10}    |
   |payload#cardLimit     |${generate:random:4}   |
   |payload#companyId     |${store:response-co.id}|
   |expected:header#status|200                    |

## 1.3. Retrieve Vehicle

tags: md-24.3, event

* Test description

   |action     |value            |
   |-----------|-----------------|
   |description|Getting a vehicle|
   |priority   |high             |

* request admin bearer

* add company and carrier

* add v2.vehicle

* Rest call

   |action                |value                                       |
   |----------------------|--------------------------------------------|
   |method:get            |/api/v2/vehicle/${store:response-vehicle.id}|
   |description           |Get a Vehicle                               |
   |expected:header#status|200                                         |
   |expected#companyId    |${store:response-co.id}                     |

## 1.4. Delete Vehicle

tags: md-24.4, event

* Test description

   |action     |value           |
   |-----------|----------------|
   |description|Delete a vehicle|
   |priority   |high            |

* request admin bearer

* add company and carrier

* add v2.vehicle

* Rest call

   |action                |value                                       |
   |----------------------|--------------------------------------------|
   |method:delete         |/api/v2/vehicle/${store:response-vehicle.id}|
   |description           |Delete Vehicle                              |
   |expected:header#status|204                                         |

* Rest call

   |action                |value                                       |
   |----------------------|--------------------------------------------|
   |method:get            |/api/v2/vehicle/${store:response-vehicle.id}|
   |description           |Get a Vehicle                               |
   |expected:header#status|404                                         |

## 1.5. Retrieve all Vehicles

tags: md-24.5, event

* Test description

   |action     |value              |
   |-----------|-------------------|
   |description|Getting all vehicle|
   |priority   |high               |

* request admin bearer

* Rest call

   |action                        |value          |
   |------------------------------|---------------|
   |method:get                    |/api/v2/vehicle|
   |description                   |Get a Vehicle  |
   |expected:header#status        |200            |
   |expected:greater#totalElements|100            |

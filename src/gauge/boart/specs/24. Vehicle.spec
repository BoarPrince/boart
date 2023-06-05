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

## 1.6. Check Events

tags: md-24.6, event

* Test description

   |action     |value                     |
   |-----------|--------------------------|
   |description|Check events for a vehicle|
   |           |* create                  |
   |           |* update                  |
   |           |* delete                  |
   |priority   |high                      |

* request admin bearer

* add company and carrier

* Data manage

   |action      |value                  |
   |------------|-----------------------|
   |in#id       |${generate:uuid}       |
   |in#plate    |${generate:char:10}    |
   |in#cardLimit|${generate:random:4}   |
   |in#companyId|${store:response-co.id}|
   |store       |payload-vehicle        |

* RabbitMQ bind

   |action     |value                             |
   |-----------|----------------------------------|
   |exchange   |masterdata                        |
   |queue      |test.md                           |
   |description|Bind masterdata/vehicle crud event|

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* RabbitMQ publish

   |action           |value                                   |
   |-----------------|----------------------------------------|
   |description      |CREATE: Publish onboarding event manualy|
   |group            |Check Queues (CREATE)                   |
   |exchange         |masterdata.update                       |
   |routing          |vehicle                                 |
   |payload          |${store:payload-vehicle}                |
   |header#eventClass|Vehicle                                 |
   |header#eventType |Create                                  |

* RabbitMQ consume, continue

   |action                            |value                              |
   |----------------------------------|-----------------------------------|
   |queue                             |test.md                            |
   |description                       |CREATE: Vehicle Event must be fired|
   |group                             |Check Queues (CREATE)              |
   |expected:header#headers.eventClass|Vehicle                            |
   |expected:header#headers.eventType |CREATE                             |

* Rest call

   |action                |value                                      |
   |----------------------|-------------------------------------------|
   |method:get            |/api/v2/vehicle/${store:payload-vehicle#id}|
   |description           |CREATE: Read the Vehicle                   |
   |group                 |Check Queues (CREATE)                      |
   |expected:header#status|200                                        |

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@
@    @ @    @ @    @  @  @    @   @
@    @ @    @ @    @ @    @   @   @@@@@
@    @ @@@@@  @    @ @@@@@@   @   @
@    @ @      @    @ @    @   @   @
 @@@@  @      @@@@@  @    @   @   @@@@@@

* RabbitMQ publish

   |action           |value                                           |
   |-----------------|------------------------------------------------|
   |description      |UPDATE: Publish onboarding updated event manualy|
   |group            |Check Queues (UPDATE)                           |
   |exchange         |masterdata.update                               |
   |routing          |vehicle                                         |
   |payload          |${store:payload-vehicle}                        |
   |payload#plate    |${store:plate:=${generate:random:4}}            |
   |header#eventClass|Vehicle                                         |
   |header#eventType |Update                                          |

* RabbitMQ consume, continue

   |action                            |value                              |
   |----------------------------------|-----------------------------------|
   |queue                             |test.md                            |
   |description                       |UPDATE: Vehicle Event must be fired|
   |group                             |Check Queues (UPDATE)              |
   |expected:header#headers.eventClass|Vehicle                            |
   |expected:header#headers.eventType |UPDATE                             |
   |expected#plate                    |${store:plate}                     |

* Rest call

   |action                |value                                      |
   |----------------------|-------------------------------------------|
   |method:get            |/api/v2/vehicle/${store:payload-vehicle#id}|
   |description           |UPDATE: Read the Vehicle                   |
   |group                 |Check Queues (UPDATE)                      |
   |expected:header#status|200                                        |
   |expected#plate        |${store:plate}                             |

@@@@@  @@@@@@ @      @@@@@@ @@@@@ @@@@@@
@    @ @      @      @        @   @
@    @ @@@@@  @      @@@@@    @   @@@@@
@    @ @      @      @        @   @
@    @ @      @      @        @   @
@@@@@  @@@@@@ @@@@@@ @@@@@@   @   @@@@@@

* RabbitMQ publish

   |action           |value                                           |
   |-----------------|------------------------------------------------|
   |description      |DELETE: Publish onboarding updated event manualy|
   |group            |Check Queues (DELETE)                           |
   |exchange         |masterdata.update                               |
   |routing          |vehicle                                         |
   |payload#id       |${store:payload-vehicle#id}                     |
   |header#eventClass|Vehicle                                         |
   |header#eventType |Delete                                          |

* RabbitMQ consume, continue

   |action                            |value                              |
   |----------------------------------|-----------------------------------|
   |queue                             |test.md                            |
   |description                       |DELETE: Vehicle Event must be fired|
   |group                             |Check Queues (DELETE)              |
   |expected:header#headers.eventClass|Vehicle                            |
   |expected:header#headers.eventType |DELETE                             |
   |expected#id                       |${store:payload-vehicle#id}        |

* Rest call

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:get            |/api/v2/vehicle/${store:payload-vehicle#id}         |
   |description           |DELETE: Read the Vehicle, but it must be deleted now|
   |group                 |Check Queues (DELETE)                               |
   |expected:header#status|404                                                 |

## 1.7. Check Event Consuming Error

tags: md-24.7, event

* Test description

   |action     |value                                             |
   |-----------|--------------------------------------------------|
   |description|Errors must be processed by the death letter queue|
   |priority   |high                                              |

* RabbitMQ bind

   |action     |value                             |
   |-----------|----------------------------------|
   |exchange   |masterdata.error                  |
   |queue      |test.md.error                     |
   |description|Bind masterdata death letter queue|

* RabbitMQ publish

   |action           |value                                            |
   |-----------------|-------------------------------------------------|
   |description      |Publish deletion without id updated event manualy|
   |exchange         |masterdata.update                                |
   |routing          |vehicle                                          |
   |payload#-id-     |xxxxx                                            |
   |header#eventClass|Vehicle                                          |
   |header#eventType |Delete                                           |

* RabbitMQ consume, continue

   |action       |value                           |
   |-------------|--------------------------------|
   |queue        |test.md.error                   |
   |description  |Death letter Event must be fired|
   |expected#-id-|xxxxx                           |

# 1. User - MasterData

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

# 1. Driver - MasterData

tags: env-all, master-data, masterdata, md-22, driver, v2

## 1.1. Check Version 1 triggered notification

tags: md-22.1, event

* Test description

   |action     |value                                                            |
   |-----------|-----------------------------------------------------------------|
   |description|Trigger changes on Version 1 Driver and check event notificatioin|
   |priority   |high                                                             |

* request admin bearer

* add company and carrier

* add user

* RabbitMQ bind

   |action     |value                      |
   |-----------|---------------------------|
   |exchange   |driver                     |
   |queue      |test.md.v1.driver          |
   |description|Bind driver version 1 queue|
   |group      |Bind Queues                |

* RabbitMQ bind

   |action     |value                      |
   |-----------|---------------------------|
   |exchange   |masterdata                 |
   |queue      |test.md.v2.driver          |
   |description|Bind driver version 2 queue|
   |group      |Bind Queues                |

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* add driver only, email: "${store:response-user.email}"

* RabbitMQ consume, continue

   |action     |value                                |
   |-----------|-------------------------------------|
   |queue      |test.md.v1.driver                    |
   |group      |Check Queues (CREATE)                |
   |description|CREATE V1: Driver Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                  |
   |----------------------------------|---------------------------------------|
   |queue                             |test.md.v2.driver                      |
   |group                             |Check Queues (CREATE)                  |
   |description                       |CREATE V2: Driver Event must be fired  |
   |expected:header#headers.eventClass|Driver                                 |
   |expected:header#headers.eventType |CREATE                                 |
   |expected#id                       |${store:response-driver.id}            |
   |expected#cardLimit                |${store:response-driver.cardLimit}     |
   |expected#emmployeeNumber          |${store:response-driver.employeeNumber}|
   |expected#companyId                |${store:response-co.id}                |
   |expected#userId                   |${store:response-user.id}              |

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@
@    @ @    @ @    @  @  @    @   @
@    @ @    @ @    @ @    @   @   @@@@@
@    @ @@@@@  @    @ @@@@@@   @   @
@    @ @      @    @ @    @   @   @
 @@@@  @      @@@@@  @    @   @   @@@@@@

* Rest call

   |action                |value                                  |
   |----------------------|---------------------------------------|
   |method:put            |/api/driver/${store:response-driver.id}|
   |description           |Update the Driver                      |
   |group                 |Check Queues (UPDATE)                  |
   |payload               |${store:response-driver}               |
   |expected:header#status|200                                    |

* RabbitMQ consume, continue

   |action     |value                                |
   |-----------|-------------------------------------|
   |queue      |test.md.v1.driver                    |
   |group      |Check Queues (UPDATE)                |
   |description|UPDATE V1: Driver Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                  |
   |----------------------------------|---------------------------------------|
   |queue                             |test.md.v2.driver                      |
   |group                             |Check Queues (UPDATE)                  |
   |description                       |UPDATE V2: Driver Event must be fired  |
   |expected:header#headers.eventClass|Driver                                 |
   |expected:header#headers.eventType |UPDATE                                 |
   |expected#id                       |${store:response-driver.id}            |
   |expected#cardLimit                |${store:response-driver.cardLimit}     |
   |expected#emmployeeNumber          |${store:response-driver.employeeNumber}|
   |expected#companyId                |${store:response-co.id}                |
   |expected#userId                   |${store:response-user.id}              |

@@@@@  @@@@@@ @      @@@@@@ @@@@@ @@@@@@
@    @ @      @      @        @   @
@    @ @@@@@  @      @@@@@    @   @@@@@
@    @ @      @      @        @   @
@    @ @      @      @        @   @
@@@@@  @@@@@@ @@@@@@ @@@@@@   @   @@@@@@

* Rest call

   |action                |value                                  |
   |----------------------|---------------------------------------|
   |method:delete         |/api/driver/${store:response-driver.id}|
   |group                 |Check Queues (DELETE)                  |
   |description           |Delete the Driver                      |
   |expected:header#status|204                                    |

* RabbitMQ consume, continue

   |action     |value                                |
   |-----------|-------------------------------------|
   |queue      |test.md.v1.driver                    |
   |group      |Check Queues (DELETE)                |
   |description|DELETE V1: Driver Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                |
   |----------------------------------|-------------------------------------|
   |queue                             |test.md.v2.driver                    |
   |group                             |Check Queues (DELETE)                |
   |description                       |DELETE V2: Driver Event must be fired|
   |expected:header#headers.eventClass|Driver                               |
   |expected:header#headers.eventType |DELETE                               |
   |expected#id                       |${store:response-driver.id}          |

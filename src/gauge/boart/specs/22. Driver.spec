# 1. Driver - MasterData

tags: env-all, master-data, masterdata, md-22, driver, v2

* request admin bearer

## 1.1. Check Version 1 triggered notification

tags: md-22.1, event

* Test description

   |action     |value                                                            |
   |-----------|-----------------------------------------------------------------|
   |description|Trigger changes on Version 1 Driver and check event notificatioin|
   |priority   |high                                                             |

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
   |expected#employeeNumber           |${store:response-driver.employeeNumber}|
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
   |expected#employeeNumber           |${store:response-driver.employeeNumber}|
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

## 1.2. Retrieve Driver

tags: md-22.2

* Test description

   |action     |value           |
   |-----------|----------------|
   |description|Getting a driver|
   |priority   |high            |

* add company and carrier

* add user
* add driver only, email: "${store:response-user.email}"

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:get            |/api/v2/driver/${store:response-driver.id}|
   |description           |Get a Driver                              |
   |expected:header#status|200                                       |
   |expected#companyId    |${store:response-co.id}                   |
   |expected#userId       |${store:response-user.id}                 |
   |expected#cardLimit    |${store:response-driver.cardLimit}        |

## 1.3. Retrieve Drivers (admin)

tags: md-22.3

* Test description

   |action     |value                                 |
   |-----------|--------------------------------------|
   |description|Getting all Drivers with admin account|
   |priority   |high                                  |

* add company and carrier

* Rest call

   |action                        |value                  |
   |------------------------------|-----------------------|
   |method:get                    |/api/v2/driver         |
   |description                   |Get all Drivers (admin)|
   |expected:header#status        |200                    |
   |expected:greater#totalElements|100                    |

## 1.4. Retrieve Drivers (admin, search)

tags: md-22.4

* Test description

   |action     |value                                            |
   |-----------|-------------------------------------------------|
   |description|Getting Driver with admin account by searchString|
   |priority   |high                                             |

* add company and carrier

* add user
* add driver only, email: "${store:response-user.email}"

* Rest call

   |action                |value                       |
   |----------------------|----------------------------|
   |method:get            |/api/v2/driver              |
   |query#searchString    |${store:response-user.email}|
   |description           |Get Driver with search      |
   |expected:header#status|200                         |
   |expected#totalElements|1                           |

## 1.5. Retrieve Drivers of specific company

tags: md-22.5

* Test description

   |action     |value                                      |
   |-----------|-------------------------------------------|
   |description|Getting all Drivers from a specific company|
   |priority   |high                                       |

* add company and carrier

* add user
* add driver only, email: "${store:response-user.email}"

* add user
* add driver only, email: "${store:response-user.email}"

* Rest call

   |action                |value                                                          |
   |----------------------|---------------------------------------------------------------|
   |method:get            |/api/v2/driver/company/${store:response-co.id}                 |
   |description           |Get all Drivers from Company (${store:response-co.companyName})|
   |expected:header#status|200                                                            |
   |expected#totalElements|2                                                              |

## 1.6 Create a new Driver

tags: md-22.6

* Test description

   |action     |value              |
   |-----------|-------------------|
   |description|Create a new Driver|
   |priority   |high               |

* add company and carrier
* add user

* Rest call

   |action                |value                    |
   |----------------------|-------------------------|
   |method:post           |/api/v2/driver           |
   |description           |Creates a new Driver     |
   |payload#cardLimit     |555                      |
   |payload#employeeNumber|${generate:char:50}      |
   |payload#companyId     |${store:response-co.id}  |
   |payload#userId        |${store:response-user.id}|
   |expected:header#status|200                      |

## 1.7 Update a Driver

tags: md-22.7

* Test description

   |action     |value           |
   |-----------|----------------|
   |description|Update an Driver|
   |priority   |high            |

* add company and carrier
* add user
* add driver, cascaded

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:put            |/api/v2/driver/${store:response-driver.id}|
   |description           |Updates the Driver                        |
   |payload#cardLimit     |555                                       |
   |payload#employeeNumber|${generate:char:50}                       |
   |payload#companyId     |${store:response-co.id}                   |
   |payload#userId        |${store:response-user.id}                 |
   |expected:header#status|200                                       |

## 1.8. Check Events

tags: md-22.8, event

* Test description

   |action     |value                    |
   |-----------|-------------------------|
   |description|Check events for a driver|
   |           |* create                 |
   |           |* update                 |
   |           |* delete                 |
   |priority   |high                     |

* add company and carrier

* add user

* Data manage

   |action           |value                    |
   |-----------------|-------------------------|
   |in#id            |${generate:uuid}         |
   |in#cardLimit     |555                      |
   |in#employeeNumber|${generate:char:50}      |
   |in#companyId     |${store:response-co.id}  |
   |in#userId        |${store:response-user.id}|
   |store            |payload-driver           |

* RabbitMQ bind

   |action     |value                            |
   |-----------|---------------------------------|
   |exchange   |masterdata                       |
   |queue      |test.md                          |
   |description|Bind masterdata/driver crud event|

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* RabbitMQ publish

   |action           |value                               |
   |-----------------|------------------------------------|
   |description      |CREATE: Publish Driver event manualy|
   |group            |Check Queues (CREATE)               |
   |exchange         |masterdata.update                   |
   |routing          |driver                              |
   |payload          |${store:payload-driver}             |
   |header#eventClass|Driver                              |
   |header#eventType |CREATE                              |

* RabbitMQ consume, continue

   |action                            |value                             |
   |----------------------------------|----------------------------------|
   |queue                             |test.md                           |
   |description                       |CREATE: Driver Event must be fired|
   |group                             |Check Queues (CREATE)             |
   |expected:header#headers.eventClass|Driver                            |
   |expected:header#headers.eventType |CREATE                            |

* Rest call

   |action                |value                                    |
   |----------------------|-----------------------------------------|
   |method:get            |/api/v2/driver/${store:payload-driver#id}|
   |description           |CREATE: Read the Driver                  |
   |group                 |Check Queues (CREATE)                    |
   |expected:header#status|200                                      |

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@
@    @ @    @ @    @  @  @    @   @
@    @ @    @ @    @ @    @   @   @@@@@
@    @ @@@@@  @    @ @@@@@@   @   @
@    @ @      @    @ @    @   @   @
 @@@@  @      @@@@@  @    @   @   @@@@@@

* RabbitMQ publish

   |action           |value                                       |
   |-----------------|--------------------------------------------|
   |description      |UPDATE: Publish Driver updated event manualy|
   |group            |Check Queues (UPDATE)                       |
   |exchange         |masterdata.update                           |
   |routing          |driver                                      |
   |payload          |${store:payload-driver}                     |
   |payload#cardLimit|444                                         |
   |header#eventClass|Driver                                      |
   |header#eventType |Update                                      |

* RabbitMQ consume, continue

   |action                            |value                             |
   |----------------------------------|----------------------------------|
   |queue                             |test.md                           |
   |description                       |UPDATE: Driver Event must be fired|
   |group                             |Check Queues (UPDATE)             |
   |expected:header#headers.eventClass|Driver                            |
   |expected:header#headers.eventType |UPDATE                            |
   |expected#cardLimit                |444                               |

* Rest call

   |action                |value                                    |
   |----------------------|-----------------------------------------|
   |method:get            |/api/v2/driver/${store:payload-driver#id}|
   |description           |UPDATE: Read the Driver                  |
   |group                 |Check Queues (UPDATE)                    |
   |expected:header#status|200                                      |
   |expected#cardLimit    |444                                      |

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
   |routing          |driver                                          |
   |payload#id       |${store:payload-driver#id}                      |
   |header#eventClass|Driver                                          |
   |header#eventType |Delete                                          |

* RabbitMQ consume, continue

   |action                            |value                             |
   |----------------------------------|----------------------------------|
   |queue                             |test.md                           |
   |description                       |DELETE: Driver Event must be fired|
   |group                             |Check Queues (DELETE)             |
   |expected:header#headers.eventClass|Driver                            |
   |expected:header#headers.eventType |DELETE                            |
   |expected#id                       |${store:payload-driver#id}        |

* Rest call

   |action                |value                                              |
   |----------------------|---------------------------------------------------|
   |method:get            |/api/v2/driver/${store:payload-driver#id}          |
   |description           |DELETE: Read the Driver, but it must be deleted now|
   |group                 |Check Queues (DELETE)                              |
   |expected:header#status|404                                                |

## 1.9. Check Event Consuming Error

tags: md-22.9, event

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
   |routing          |driver                                           |
   |payload#-id-     |xxxxx                                            |
   |header#eventClass|Driver                                           |
   |header#eventType |Delete                                           |

* RabbitMQ consume, continue

   |action       |value                           |
   |-------------|--------------------------------|
   |queue        |test.md.error                   |
   |description  |Death letter Event must be fired|
   |expected#-id-|xxxxx                           |

## 1.10. Delete Driver

tags: md-22.10, event

* Test description

   |action     |value          |
   |-----------|---------------|
   |description|Delete a driver|
   |priority   |high           |

* add company and carrier

* add user
* add driver, cascaded

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:delete         |/api/v2/driver/${store:response-driver.id}|
   |description           |Delete Driver                             |
   |expected:header#status|204                                       |

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:get            |/api/v2/driver/${store:response-driver.id}|
   |description           |Get a Driver                              |
   |expected:header#status|404                                       |

## 1.11. Retrieve Drivers without any parameters

tags: md-22.11

* Test description

   |action     |value                                                        |
   |-----------|-------------------------------------------------------------|
   |description|It must be possible to retrieve Drivers without any parameter|
   |priority   |high                                                         |

* Rest call

   |action                |value                                 |
   |----------------------|--------------------------------------|
   |method:get            |/api/v2/driver                        |
   |query#page            |0                                     |
   |query#size            |20                                    |
   |description           |Search assigned Vehicle (all vehicles)|
   |expected:header#status|200                                   |
   |expected#totalElements|1                                     |

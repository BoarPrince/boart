# 1. Address - MasterData

tags: env-all, master-data, masterdata, md-27, address, v2

## 1.1. Add an Address

tags: md-27.1

* Test description

   |action     |value                      |
   |-----------|---------------------------|
   |description|Creates a Version 2 Address|
   |priority   |high                       |

* add company

* Rest call

   |action                |value                                |
   |----------------------|-------------------------------------|
   |method:post           |/api/v2/address                      |
   |description           |Creates an Address with random values|
   |payload#companyId     |${store:response-co.id}              |
   |payload#type          |${generate:char:10}                  |
   |payload#street        |${generate:fake:address:street}      |
   |payload#city          |${generate:fake:address:city}        |
   |payload#zipCode       |${generate:random:10}                |
   |payload#countryCode   |${generate:fake:address:countryCode} |
   |payload#addition      |${generate:char:100}                 |
   |expected:header#status|200                                  |

## 1.2. Retrieve an Address

tags: md-27.2

* Test description

   |action     |value             |
   |-----------|------------------|
   |description|Getting an address|
   |priority   |high              |

* request admin bearer

* add company and carrier

* add v2.address

* Rest call

   |action                |value                                  |
   |----------------------|---------------------------------------|
   |method:get            |/api/v2/address/${store:response-ad.id}|
   |description           |Get an Address                         |
   |expected:header#status|200                                    |
   |expected#id           |${store:response-ad.id}                |
   |expected#type         |${store:response-ad.type}              |
   |expected#street       |${store:response-ad.street}            |
   |expected#city         |${store:response-ad.city}              |
   |expected#countryCode  |${store:response-ad.countryCode}       |
   |expected#companyId    |${store:response-co.id}                |

## 1.3. Delete Address

tags: md-27.3

* Test description

   |action     |value         |
   |-----------|--------------|
   |description|Add an address|
   |priority   |high          |

* request admin bearer

* add company and carrier

* add v2.address

* Rest call

   |action                |value                                  |
   |----------------------|---------------------------------------|
   |method:delete         |/api/v2/address/${store:response-ad.id}|
   |description           |Delete Address                         |
   |expected:header#status|204                                    |

* Rest call

   |action                |value                                  |
   |----------------------|---------------------------------------|
   |method:get            |/api/v2/address/${store:response-ad.id}|
   |description           |Try to get the deleted Address         |
   |expected:header#status|404                                    |

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

## 1.8. Retrieve Company with associated Address

tags: md-27.8

* Test description

   |action     |value                                  |
   |-----------|---------------------------------------|
   |description|Getting Company with associated address|
   |priority   |high                                   |

* request admin bearer

* add company and carrier

* add v2.address
* add v2.address

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:get            |/api/v2/company/${store:response-co.id}   |
   |description           |Retrieve Company with associated Addresses|
   |expected:header#status|200                                       |

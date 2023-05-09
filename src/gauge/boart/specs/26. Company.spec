# 1. Company - MasterData

tags: env-all, master-data, masterdata, md-26, company, v2

## 1.1. Check Version 1 triggered notification

tags: md-26.1, event

* Test description

   |action     |value                                                            |
   |-----------|-----------------------------------------------------------------|
   |description|Trigger changes on Version 1 Company and check event notification|
   |priority   |high                                                             |

* request admin bearer

* add company

* RabbitMQ bind

   |action     |value                       |
   |-----------|----------------------------|
   |exchange   |carrier                     |
   |queue      |test.md.v1.company          |
   |description|Bind carrier version 1 queue|
   |group      |Bind Queues                 |

* RabbitMQ bind

   |action     |value                       |
   |-----------|----------------------------|
   |exchange   |company                     |
   |queue      |test.md.v1.company          |
   |description|Bind carrier version 1 queue|
   |group      |Bind Queues                 |

* RabbitMQ bind

   |action     |value                       |
   |-----------|----------------------------|
   |exchange   |masterdata                  |
   |queue      |test.md.v2.company          |
   |description|Bind company version 2 queue|
   |group      |Bind Queues                 |

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* add carrier

* RabbitMQ consume, continue

   |action     |value                                 |
   |-----------|--------------------------------------|
   |queue      |test.md.v1.company                    |
   |group      |Check Queues (CREATE)                 |
   |description|CREATE V1: Company Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                   |
   |----------------------------------|----------------------------------------|
   |queue                             |test.md.v2.company                      |
   |group                             |Check Queues (CREATE)                   |
   |description                       |CREATE V2: Company Event must be fired  |
   |expected:header#headers.eventClass|Company                                 |
   |expected:header#headers.eventType |CREATE                                  |
   |expected#id                       |${store:response-co.id}                 |
   |expected#referenceId              |${store:response-co.jitPayId}           |
   |expected#bankAccount.iban         |${store:response-co.bankDetails[0].iban}|

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@     @@@@    @@   @@@@@  @@@@@  @ @@@@@@ @@@@@
@    @ @    @ @    @  @  @    @   @         @    @  @  @  @    @ @    @ @ @      @    @
@    @ @    @ @    @ @    @   @   @@@@@     @      @    @ @    @ @    @ @ @@@@@  @    @
@    @ @@@@@  @    @ @@@@@@   @   @         @      @@@@@@ @@@@@  @@@@@  @ @      @@@@@
@    @ @      @    @ @    @   @   @         @    @ @    @ @   @  @   @  @ @      @   @
 @@@@  @      @@@@@  @    @   @   @@@@@@     @@@@  @    @ @    @ @    @ @ @@@@@@ @    @

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:put            |/api/carrier/${store:response-ca.id}|
   |description           |Update the Carrier                  |
   |group                 |Check Queues (UPDATE Carrier)       |
   |payload               |${store:response-ca}                |
   |expected:header#status|200                                 |

* RabbitMQ consume, continue

   |action     |value                                 |
   |-----------|--------------------------------------|
   |queue      |test.md.v1.company                    |
   |group      |Check Queues (UPDATE Carrier)         |
   |description|UPDATE V1: Company Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                 |
   |----------------------------------|--------------------------------------|
   |queue                             |test.md.v2.company                    |
   |group                             |Check Queues (UPDATE Carrier)         |
   |description                       |UPDATE V2: Company Event must be fired|
   |expected:header#headers.eventClass|Company                               |
   |expected:header#headers.eventType |UPDATE                                |
   |expected#id                       |${store:response-co.id}               |

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@     @@@@   @@@@  @    @ @@@@@    @@   @    @ @   @
@    @ @    @ @    @  @  @    @   @         @    @ @    @ @@  @@ @    @  @  @  @@   @  @ @
@    @ @    @ @    @ @    @   @   @@@@@     @      @    @ @ @@ @ @    @ @    @ @ @  @   @
@    @ @@@@@  @    @ @@@@@@   @   @         @      @    @ @    @ @@@@@  @@@@@@ @  @ @   @
@    @ @      @    @ @    @   @   @         @    @ @    @ @    @ @      @    @ @   @@   @
 @@@@  @      @@@@@  @    @   @   @@@@@@     @@@@   @@@@  @    @ @      @    @ @    @   @

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:put            |/api/company/${store:response-co.id}|
   |description           |Update the Company                  |
   |group                 |Check Queues (UPDATE Company)       |
   |payload               |${store:response-co}                |
   |payload#carriers[0]   |${store:response-ca}                |
   |expected:header#status|200                                 |

* RabbitMQ consume, continue

   |action     |value                                 |
   |-----------|--------------------------------------|
   |queue      |test.md.v1.company                    |
   |group      |Check Queues (UPDATE Company)         |
   |description|UPDATE V1: Company Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                 |
   |----------------------------------|--------------------------------------|
   |queue                             |test.md.v2.company                    |
   |group                             |Check Queues (UPDATE Company)         |
   |description                       |UPDATE V2: Company Event must be fired|
   |expected:header#headers.eventClass|Company                               |
   |expected:header#headers.eventType |UPDATE                                |
   |expected#id                       |${store:response-co.id}               |

@@@@@  @@@@@@ @      @@@@@@ @@@@@ @@@@@@
@    @ @      @      @        @   @
@    @ @@@@@  @      @@@@@    @   @@@@@
@    @ @      @      @        @   @
@    @ @      @      @        @   @
@@@@@  @@@@@@ @@@@@@ @@@@@@   @   @@@@@@

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:delete         |/api/company/${store:response-co.id}|
   |description           |Delete the Company                  |
   |group                 |Check Queues (Delete Company)       |
   |expected:header#status|204                                 |

* RabbitMQ consume, continue

   |action     |value                                 |
   |-----------|--------------------------------------|
   |queue      |test.md.v1.company                    |
   |group      |Check Queues (DELETE Company)         |
   |description|DELETE V1: Company Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                 |
   |----------------------------------|--------------------------------------|
   |queue                             |test.md.v2.company                    |
   |group                             |Check Queues (DELETE Company)         |
   |description                       |DELETE V2: Company Event must be fired|
   |expected:header#headers.eventClass|Company                               |
   |expected:header#headers.eventType |DELETE                                |
   |expected#id                       |${store:response-co.id}               |

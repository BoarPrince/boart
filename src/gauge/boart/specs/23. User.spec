# 1. User - MasterData

tags: env-all, master-data, masterdata, md-23, user, v2

## 1.1. Check Version 1 triggered notification

tags: md-23.1, event

* Test description

   |action     |value                                                          |
   |-----------|---------------------------------------------------------------|
   |description|Trigger changes on Version 1 User and check event notificatioin|
   |priority   |high                                                           |

* request admin bearer

* add company and carrier

* RabbitMQ bind

   |action     |value                      |
   |-----------|---------------------------|
   |exchange   |user                       |
   |queue      |test.md.v1.user            |
   |description|Bind driver version 1 queue|
   |group      |Bind Queues                |

* RabbitMQ bind

   |action     |value                    |
   |-----------|-------------------------|
   |exchange   |masterdata               |
   |queue      |test.md.v2.user          |
   |description|Bind user version 2 queue|
   |group      |Bind Queues              |

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* add user

* RabbitMQ consume, continue

   |action     |value                              |
   |-----------|-----------------------------------|
   |queue      |test.md.v1.user                    |
   |group      |Check Queues (CREATE)              |
   |description|CREATE V1: User Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                              |
   |----------------------------------|-----------------------------------|
   |queue                             |test.md.v2.user                    |
   |group                             |Check Queues (CREATE)              |
   |description                       |CREATE V2: User Event must be fired|
   |expected:header#headers.eventClass|User                               |
   |expected:header#headers.eventType |CREATE                             |
   |expected#id                       |${store:response-user.id}          |
   |expected#companyId                |${store:response-co.id}            |

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@
@    @ @    @ @    @  @  @    @   @
@    @ @    @ @    @ @    @   @   @@@@@
@    @ @@@@@  @    @ @@@@@@   @   @
@    @ @      @    @ @    @   @   @
 @@@@  @      @@@@@  @    @   @   @@@@@@

* Rest call

   |action                |value                              |
   |----------------------|-----------------------------------|
   |method:put            |/api/user/${store:response-user.id}|
   |description           |Update the User                    |
   |group                 |Check Queues (UPDATE)              |
   |payload               |${store:response-user}             |
   |expected:header#status|200                                |

* RabbitMQ consume, continue

   |action     |value                              |
   |-----------|-----------------------------------|
   |queue      |test.md.v1.user                    |
   |group      |Check Queues (UPDATE)              |
   |description|UPDATE V1: User Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                              |
   |----------------------------------|-----------------------------------|
   |queue                             |test.md.v2.user                    |
   |group                             |Check Queues (UPDATE)              |
   |description                       |UPDATE V2: User Event must be fired|
   |expected:header#headers.eventClass|User                               |
   |expected:header#headers.eventType |UPDATE                             |
   |expected#id                       |${store:response-user.id}          |
   |expected#email                    |${store:response-user.email}       |
   |expected#companyId                |${store:response-co.id}            |

@@@@@  @@@@@@ @      @@@@@@ @@@@@ @@@@@@
@    @ @      @      @        @   @
@    @ @@@@@  @      @@@@@    @   @@@@@
@    @ @      @      @        @   @
@    @ @      @      @        @   @
@@@@@  @@@@@@ @@@@@@ @@@@@@   @   @@@@@@

* Rest call

   |action                |value                              |
   |----------------------|-----------------------------------|
   |method:delete         |/api/user/${store:response-user.id}|
   |description           |Delete the User                    |
   |group                 |Check Queues (DELETE)              |
   |expected:header#status|204                                |

* RabbitMQ consume, continue

   |action     |value                              |
   |-----------|-----------------------------------|
   |queue      |test.md.v1.user                    |
   |group      |Check Queues (DELETE)              |
   |description|DELETE V1: User Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                              |
   |----------------------------------|-----------------------------------|
   |queue                             |test.md.v2.user                    |
   |group                             |Check Queues (DELETE)              |
   |description                       |DELETE V2: User Event must be fired|
   |expected:header#headers.eventClass|User                               |
   |expected:header#headers.eventType |DELETE                             |
   |expected#id                       |${store:response-user.id}          |

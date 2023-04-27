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

* add driver only, email: "${generate:t:fake:internet:email}"

* RabbitMQ consume, continue

   |action     |value                     |
   |-----------|--------------------------|
   |queue      |test.md.v1.driver         |
   |group      |Check Queues              |
   |description|Driver Event must be fired|

* RabbitMQ consume, continue

   |action                            |value                                       |
   |----------------------------------|--------------------------------------------|
   |queue                             |test.md.v2.driver                           |
   |description                       |CREATE: Driver Version 2 Event must be fired|
   |expected:header#headers.eventClass|Driver                                      |
   |expected:header#headers.eventType |CREATE                                      |

# 1. Driver - MasterData

tags: env-all, master-data, md-4

## 1.1. Add a Driver

tags: md-4.1

* Test description

   |action     |value                  |
   |-----------|-----------------------|
   |description|Add a driver to company|
   |priority   |high                   |

* request admin bearer

* add company, response: "co-response"

* add carrier, companyId: "${store:co-response.id}", response: "ca-response"

* RabbitMQ bind

   |action     |value            |
   |-----------|-----------------|
   |exchange   |driver           |
   |queue      |test.md.driver   |
   |description|Bind driver queue|
   |group      |Bind Queues      |

* Rest call

   |action                |value                                   |
   |----------------------|----------------------------------------|
   |method:post           |/api/driver                             |
   |description           |Add a Driver (including a cascaded User)|
   |payload               |<file:request-driver.json>              |
   |expected:header#status|200                                     |

* RabbitMQ consume, continue

   |action     |value                     |
   |-----------|--------------------------|
   |queue      |test.md.driver            |
   |group      |Check Queues              |
   |description|Driver Event must be fired|


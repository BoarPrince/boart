# 1. Driver - MasterData

tags: env-all, master-data, md-4

## 1.1. Add a Driver

tags: md-4.1

* Test description

   |action     |value                  |
   |-----------|-----------------------|
   |description|Add a driver to company|
   |priority   |high                   |

* add company and carrier

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
   |payload               |<file:request-driver-only.json>         |
   |expected:header#status|200                                     |

* RabbitMQ consume, continue

   |action     |value                     |
   |-----------|--------------------------|
   |queue      |test.md.driver            |
   |group      |Check Queues              |
   |description|Driver Event must be fired|

## 1.2. Delete a Driver and check if event payload is correct

tags: md-4.2, delete-event

* Test description

   |action     |value                                                         |
   |-----------|--------------------------------------------------------------|
   |description|Deleting a Driver                                             |
   |           |Response and Event payload must still contain the Phonenumbers|
   |priority   |high                                                          |

* add company and carrier

* add user

* add driver

* queues bind "driver"

* Rest call

   |action                |value                                  |
   |----------------------|---------------------------------------|
   |method:delete         |/api/driver/${store:response-driver.id}|
   |description           |Delete the Driver again                |
   |expected:header#status|204                                    |

* queues check "driver"

* Data manage

   |action                     |value                                              |
   |---------------------------|---------------------------------------------------|
   |in                         |${store:event-driver}                              |
   |description                |Driver event for deleting must contain phonenumbers|
   |group                      |Check Queues                                       |
   |expected#eventType         |DELETE                                             |
   |expected:count#phoneNumbers|1                                                  |

## 1.3. Assign and Unassign Driver-Vehicle

tags: md-4.3

* Test description

   |action     |value                                          |
   |-----------|-----------------------------------------------|
   |description|Assign and Unassign a driver vehicle assignment|
   |ticket     |MD-203                                         |
   |priority   |high                                           |

* add company and carrier

* add user

* add driver

* Rest call

   |action                |value                                  |
   |----------------------|---------------------------------------|
   |method:get            |/api/driver/${store:response-driver.id}|
   |description           |Get created Driver                     |
   |expected:header#status|200                                    |

* Rest call

   |action                |value                                           |
   |----------------------|------------------------------------------------|
   |method:get            |/api/driver/carrier/${store:response-carrier.id}|
   |description           |Get all Drivers                                 |
   |expected:header#status|200                                             |
   |expected:count#content|1                                               |

* add vehicle

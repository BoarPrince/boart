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

  add first driver
* add driver

  add a second driver
* add driver

  read the second created driver
* Rest call

   |action                |value                                  |
   |----------------------|---------------------------------------|
   |method:get            |/api/driver/${store:response-driver.id}|
   |description           |Get created Driver                     |
   |expected:header#status|200                                    |

  read all drivers associated to the carrier
* Rest call

   |action                |value                                           |
   |----------------------|------------------------------------------------|
   |method:get            |/api/driver/carrier/${store:response-carrier.id}|
   |description           |Get all Drivers of the carrier                  |
   |expected:header#status|200                                             |
   |expected:count#content|2                                               |

* add vehicle

  assign the vehicle to the second driver
* Rest call

   |action                |value                                                                                  |
   |----------------------|---------------------------------------------------------------------------------------|
   |method:put            |/api/assignment/vehicle/${store:response-vehicle.id}/driver/${store:response-driver.id}|
   |description           |Assign vehicle to the driver                                                           |
   |expected:header#status|202                                                                                    |

  driver must be associated with the vehicle
* Rest call

   |action                |value                                  |
   |----------------------|---------------------------------------|
   |method:get            |/api/driver/${store:response-driver.id}|
   |description           |Get Driver with associated Vehicle     |
   |expected:header#status|200                                    |
   |expected#vehicleId    |${store:response-vehicle.id}           |


  drivers list of the carrier must still have 2 drivers
* Rest call

   |action                |value                                                |
   |----------------------|-----------------------------------------------------|
   |method:get            |/api/driver/carrier/${store:response-carrier.id}     |
   |description           |Get all Drivers of the carrier (must still 2 drivers)|
   |expected:header#status|200                                                  |
   |expected:count#content|2                                                    |

  Remove driver assignment again
* Rest call

   |action                |value                                              |
   |----------------------|---------------------------------------------------|
   |method:delete         |/api/assignment/driver/${store:response-vehicle.id}|
   |description           |Remove Driver / Vehicle Assignment again           |
   |expected:header#status|202                                                |

  driver shall not more have an associated vehicle
* Rest call

   |action                   |value                                  |
   |-------------------------|---------------------------------------|
   |method:get               |/api/driver/${store:response-driver.id}|
   |description              |Get Driver with associated Vehicle     |
   |expected:header#status   |200                                    |
   |expected:empty#vehicleId?|${store:response-vehicle.id}           |

  drivers list of the carrier must still have 2 drivers
* Rest call

   |action                |value                                                |
   |----------------------|-----------------------------------------------------|
   |method:get            |/api/driver/carrier/${store:response-carrier.id}     |
   |description           |Get all Drivers of the carrier (must still 2 drivers)|
   |expected:header#status|200                                                  |
   |expected:count#content|2                                                    |

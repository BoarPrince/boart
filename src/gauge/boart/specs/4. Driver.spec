# 1. Driver - MasterData

tags: env-all, master-data, md-4, masterdata

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

* add driver, cascaded

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
* add driver, cascaded

  add a second driver
* add driver, cascaded

  read the second created driver
* Rest call

   |action                |value                                  |
   |----------------------|---------------------------------------|
   |method:get            |/api/driver/${store:response-driver.id}|
   |description           |Get created Driver                     |
   |expected:header#status|200                                    |

  read all drivers associated to the carrier
* Rest call

   |action                |value                                      |
   |----------------------|-------------------------------------------|
   |method:get            |/api/driver/carrier/${store:response-ca.id}|
   |description           |Get all Drivers of the carrier             |
   |expected:header#status|200                                        |
   |expected:count#content|2                                          |

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
   |method:get            |/api/driver/carrier/${store:response-ca.id}          |
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
   |method:get            |/api/driver/carrier/${store:response-ca.id}          |
   |description           |Get all Drivers of the carrier (must still 2 drivers)|
   |expected:header#status|200                                                  |
   |expected:count#content|2                                                    |

## 1.4. E-Mail must be defined when creating a driver (error when not)

tags: md-4.4

* Test description

   |action     |value                                        |
   |-----------|---------------------------------------------|
   |description|Add a driver to company                      |
   |           |Must throw an error when email is not defined|
   |priority   |high                                         |

* add company and carrier

* Rest call

   |action                |value                                                                           |
   |----------------------|--------------------------------------------------------------------------------|
   |method:post           |/api/driver                                                                     |
   |description           |Add a Driver (Email not defined)                                                |
   |payload               |<file:request-driver-only.json>                                                 |
   |payload#email         |undefined                                                                       |
   |payload#firstname     |undefined                                                                       |
   |payload#lastname      |undefined                                                                       |
   |expected:header#status|406                                                                             |
   |--expected#description|{firstname=must not be null, email=must not be null, lastname=must not be null},|


## 1.5. E-Mail must be defined when creating a driver

tags: md-4.5

* Test description

   |action     |value                  |
   |-----------|-----------------------|
   |description|Add a driver to company|
   |priority   |high                   |

* add company and carrier

* Rest call

   |action                |value                          |
   |----------------------|-------------------------------|
   |method:post           |/api/driver                    |
   |description           |Add a Driver (Email is defined)|
   |payload               |<file:request-driver-only.json>|
   |expected:header#status|200                            |

## 1.6. E-Mail of driver must be empty when creating the driver in cascaded user event

tags: md-4.6

* Test description

   |action     |value                       |
   |-----------|----------------------------|
   |description|Add a user/driver to company|
   |priority   |high                        |

* add company and carrier

* Rest call

   |action                |value                                              |
   |----------------------|---------------------------------------------------|
   |method:post           |/api/user                                          |
   |description           |Add a User/Driver (Email for driver is not defined)|
   |payload               |<file:request-user.json>                           |
   |payload#driver        |<file:request-driver.json>                         |
   |expected:header#status|200                                                |

## 1.7. E-Mail of driver must be empty when creating the driver in cascaded user event (error when defined)

tags: md-4.7

* Test description

   |action     |value                                    |
   |-----------|-----------------------------------------|
   |description|Add a user/driver to company             |
   |           |Must throw an error when email is defined|
   |priority   |high                                     |

* add company and carrier

* Rest call

   |action                         |value                                          |
   |-------------------------------|-----------------------------------------------|
   |method:post                    |/api/user                                      |
   |description                    |Add a User/Driver (Email for driver is defined)|
   |payload                        |<file:request-user.json>                       |
   |payload#driver                 |<file:request-driver-only.json>                |
   |expected:header#status         |200                                            |
   |--expected:contains#description|driver.firstname=must be null                  |
   |--expected:contains#description|driver.email=must be null                      |
   |--expected:contains#description|driver.lastname=must be null                   |

## 1.8. E-Mail of driver must be empty when creating the driver in cascaded carrier event

tags: md-4.8

* Test description

   |action     |value                                           |
   |-----------|------------------------------------------------|
   |description|Add a carrier (including user/driver) to company|
   |priority   |high                                            |

* request admin bearer

* add company, response: "request-co"

* Rest call

   |action                           |value                                                                  |
   |---------------------------------|-----------------------------------------------------------------------|
   |method:post                      |/api/carrier                                                           |
   |description                      |Add a Carrier (including User/Driver) (Email for driver is not defined)|
   |payload                          |<file:request-carrier.json>                                            |
   |payload#companyId                |${store:request-co.id}                                                 |
   |payload#users[0]                 |<file:request-user.json>                                               |
   |payload#users[0].carrierIds[0]   |${context:payload.id}                                                  |
   |payload#users[0].driver          |<file:request-driver.json>                                             |
   |payload#users[0].driver.carrierId|${context:payload.id}                                                  |
   |expected:header#status           |200                                                                    |

## 1.9. E-Mail of driver must be empty when creating the driver in cascaded carrier event (error when defined)

tags: md-4.9

* Test description

   |action     |value                                           |
   |-----------|------------------------------------------------|
   |description|Add a carrier (including user/driver) to company|
   |           |Must throw an error when email is defined       |
   |priority   |high                                            |

* request admin bearer

* add company

* Rest call

   |action                           |value                                          |
   |---------------------------------|-----------------------------------------------|
   |method:post                      |/api/carrier                                   |
   |description                      |Add a User/Driver (Email for driver is defined)|
   |payload                          |<file:request-carrier.json>                    |
   |payload#companyId                |${store:response-co.id}                        |
   |payload#users[0]                 |<file:request-user.json>                       |
   |payload#users[0].carrierIds[0]   |${context:payload.id}                          |
   |payload#users[0].driver          |<file:request-driver-only.json>                |
   |payload#users[0].driver.carrierId|${context:payload.id}                          |
   |expected:header#status           |200                                            |
   |--expected:header#status         |400                                            |
   |--expected:contains#description  |driver.firstname=must be null                  |
   |--expected:contains#description  |driver.email=must be null                      |
   |--expected:contains#description  |driver.lastname=must be null                   |

## 1.10. Add Driver cascaded without carrierId

tags: md-4.10, MD-220

* Test description

   |action     |value                                                                |
   |-----------|---------------------------------------------------------------------|
   |description|Driver inside a carrier cascade does not need to define the carrierId|
   |ticket     |MD-220                                                               |
   |priority   |medium                                                               |

* request admin bearer

* add company

* Rest call

   |action                           |value                                                  |
   |---------------------------------|-------------------------------------------------------|
   |method:post                      |/api/carrier                                           |
   |description                      |Add a User/Driver (carrierId for Driver is not defined)|
   |payload                          |<file:request-carrier.json>                            |
   |payload#companyId                |${store:response-co.id}                                |
   |payload#users[0]                 |<file:request-user.json>                               |
   |payload#users[0].carrierIds[0]   |${context:payload.companyId}                           |
   |payload#users[0].driver          |<file:request-driver-only.json>                        |
   |payload#users[0].driver.carrierId|undefined                                              |
   |expected:header#status           |200                                                    |

## 1.11. Cascaded Driver event must contain E-Mail

tags: md-4.11

* Test description

   |action     |value                                                          |
   |-----------|---------------------------------------------------------------|
   |description|Cascaded Driver Event must contain an email for user and driver|
   |priority   |high                                                           |

* add company and carrier

* queues bind "driver, user"

* Rest call

   |action                |value                                              |
   |----------------------|---------------------------------------------------|
   |method:post           |/api/user                                          |
   |description           |Add a User/Driver (Email for driver is not defined)|
   |payload               |<file:request-user.json>                           |
   |payload#driver        |<file:request-driver.json>                         |
   |expected:header#status|200                                                |

* queues check "driver, user"

* Data manage

   |action                      |value                                     |
   |----------------------------|------------------------------------------|
   |in                          |${store:event-driver}                     |
   |description                 |Driver event must contain all informations|
   |group                       |Check Queues                              |
   |expected:empty:not#lastname |                                          |
   |expected:empty:not#firstname|                                          |
   |expected:empty:not#email    |                                          |

* Data manage

   |action                             |value                                          |
   |-----------------------------------|-----------------------------------------------|
   |in                                 |${store:event-user}                            |
   |description                        |User/Driver event must contain all informations|
   |group                              |Check Queues                                   |
   |expected:empty:not#lastname        |                                               |
   |expected:empty:not#firstname       |                                               |
   |expected:empty:not#email           |                                               |
   |expected:empty:not#driver.lastname |                                               |
   |expected:empty:not#driver.firstname|                                               |
   |expected:empty:not#driver.email    |                                               |
   |expected#driver.lastname           |${store:event-user.lastname}                   |
   |expected#driver.firstname          |${store:event-user.firstname}                  |
   |expected#driver.email              |${store:event-user.email}                      |

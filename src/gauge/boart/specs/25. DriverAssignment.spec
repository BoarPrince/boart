# 1. DriverAssignment - MasterData

tags: env-all, master-data, masterdata, md-25, driver-assignment, driverAssignment, v2

## 1.1. Check Version 1 triggered notification

tags: md-25.1, event

* Test description

   | action      | value                                                           |
   |-------------|-----------------------------------------------------------------|
   | description | Trigger changes on Version 1 User and check event notificatioin |
   | priority    | high                                                            |

* request admin bearer

* add company and carrier

* add vehicle

* add driver only, email: "${generate:s:tpl:user.email}"

* RabbitMQ bind

   | action      | value                        |
   |-------------|------------------------------|
   | exchange    | driverassignment             |
   | queue       | test.md.v1.driverAssignment  |
   | description | Bind vehicle version 1 queue |
   | group       | Bind Queues                  |

* RabbitMQ bind

   | action      | value                                 |
   |-------------|---------------------------------------|
   | exchange    | masterdata                            |
   | queue       | test.md.v2.driverAssignment           |
   | description | Bind driverAssignment version 2 queue |
   | group       | Bind Queues                           |

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* assign v2.driver and vehicle

* RabbitMQ consume, continue

   | action      | value                                           |
   |-------------|-------------------------------------------------|
   | queue       | test.md.v1.driverAssignment                     |
   | group       | Check Queues (CREATE)                           |
   | description | CREATE V1: DriverAssignment Event must be fired |

* RabbitMQ consume, continue

   | action                             | value                                           |
   |------------------------------------|-------------------------------------------------|
   | queue                              | test.md.v2.driverAssignment                     |
   | group                              | Check Queues (CREATE)                           |
   | description                        | CREATE V2: DriverAssignment Event must be fired |
   | expected:header#headers.eventClass | DriverAssignment                                |
   | expected:header#headers.eventType  | CREATE                                          |
   | expected#vehicleId                 | ${store:response-vehicle.id}                    |
   | expected#driverId                  | ${store:response-driver.id}                     |

@@@@@  @@@@@@ @      @@@@@@ @@@@@ @@@@@@
@    @ @      @      @        @   @
@    @ @@@@@  @      @@@@@    @   @@@@@
@    @ @      @      @        @   @
@    @ @      @      @        @   @
@@@@@  @@@@@@ @@@@@@ @@@@@@   @   @@@@@@


* Rest call

   | action                 | value                                               |
   |------------------------|-----------------------------------------------------|
   | method:delete          | /api/assignment/driver/${store:response-vehicle.id} |
   | description            | Remove Assignment between vehicle and driver        |
   | group                  | Check Queues (DELETE)                               |
   | expected:header#status | 202                                                 |

* RabbitMQ consume, continue

   | action      | value                                           |
   |-------------|-------------------------------------------------|
   | queue       | test.md.v1.driverAssignment                     |
   | group       | Check Queues (DELETE)                           |
   | description | DELETE V1: DriverAssignment Event must be fired |

* RabbitMQ consume, continue

   | action                             | value                                           |
   |------------------------------------|-------------------------------------------------|
   | queue                              | test.md.v2.driverAssignment                     |
   | group                              | Check Queues (DELETE)                           |
   | description                        | DELETE V2: DriverAssignment Event must be fired |
   | expected:header#headers.eventClass | DriverAssignment                                |
   | expected:header#headers.eventType  | UPDATE                                          |
   | expected#vehicleId                 | ${store:response-vehicle.id}                    |
   | expected#driverId                  | ${store:response-driver.id}                     |

## 1.2. Retrieve DriverAssignment

tags: md-25.2

* Test description

   | action      | value                       |
   |-------------|-----------------------------|
   | description | Getting a driver assignment |
   | priority    | high                        |

* request admin bearer

* add company and carrier

* add user
* add driver only, email: "${store:response-user.email}"

* add vehicle

* assign v2.driver and vehicle

* Rest call

   | action                     | value                                                    |
   |----------------------------|----------------------------------------------------------|
   | method:get                 | /api/v2/driverAssignment/${store:response-assignment#id} |
   | description                | Gets a DriverAssignment                                  |
   | expected:header#status     | 200                                                      |
   | expected#vehicleId         | ${store:response-vehicle.id}                             |
   | expected#driverId          | ${store:response-driver.id}                              |
   | expected#validTo           | 2099-12-31T23:00:00.000+00:00                            |
   | expected:greater#validFrom | ${generate:date.iso}                                     |

## 1.3. Retrieve DriverAssignments (paged, admin)

tags: md-25.3

* Test description

   | action      | value                                            |
   |-------------|--------------------------------------------------|
   | description | Getting all DriverAssignments with admin account |
   | priority    | high                                             |

* request admin bearer

* Rest call

   | action                         | value                             |
   |--------------------------------|-----------------------------------|
   | method:get                     | /api/v2/driverAssignment          |
   | description                    | Get all DriverAssignments (admin) |
   | expected:header#status         | 200                               |
   | expected:greater#totalElements | 100                               |

## 1.4. Retrieve DriverAssignments (paged, search, admin)

tags: md-25.4

* Test description

   | action      | value                                                       |
   |-------------|-------------------------------------------------------------|
   | description | Getting DriverAssignment with admin account by searchString |
   | priority    | high                                                        |

* request admin bearer

* add company and carrier

* add user
* add driver only, email: "${store:response-user.email}"
* add vehicle
* assign v2.driver and vehicle

* Rest call

   | action                 | value                                           |
   |------------------------|-------------------------------------------------|
   | method:get             | /api/v2/driverAssignment                        |
   | query#searchString     | ${store:response-user.email}                    |
   | description            | Get DriverAssignment with search (driver email) |
   | expected:header#status | 200                                             |
   | expected#totalElements | 1                                               |

## 1.5. Retrieve DriverAssignments of specific company

tags: md-25.5

* Test description

   | action      | value                                                 |
   |-------------|-------------------------------------------------------|
   | description | Getting all DriverAssignments from a specific company |
   | priority    | high                                                  |

* request admin bearer

* add company and carrier

* add user
* add driver only, email: "${store:response-user.email}"
* add vehicle
* assign v2.driver and vehicle
  
* add user
* add driver only, email: "${store:response-user.email}"
* add vehicle
* assign v2.driver and vehicle

* Rest call

   | action                 | value                                                    |
   |------------------------|----------------------------------------------------------|
   | method:get             | /api/v2/driverAssignment/company/${store:response-co.id} |
   | description            | Getting all driverassgnments of one company              |
   | expected:header#status | 200                                                      |
   | expected#totalElements | 2                                                        |

## 1.6 Create a new DriverAssignment

tags: md-25.6

* Test description

   | action      | value                         |
   |-------------|-------------------------------|
   | description | Create a new DriverAssignment |
   | priority    | high                          |

* request admin bearer

* add company and carrier

* add user
* add driver only, email: "${store:response-user.email}"

* add vehicle

* Rest call

   | action                 | value                          |
   |------------------------|--------------------------------|
   | method:post            | /api/v2/driverAssignment       |
   | description            | Creates a new DriverAssignment |
   | payload#vehicleId      | ${store:response-vehicle.id}   |
   | payload#driverId       | ${store:response-driver.id}    |
   | expected:header#status | 200                            |

## 1.7 Delete a DriverAssignment

tags: md-25.7

* Test description

   | action      | value                     |
   |-------------|---------------------------|
   | description | Delete a DriverAssignment |
   | priority    | high                      |

* request admin bearer

* add company and carrier

* add user
* add driver only, email: "${store:response-user.email}"
* add vehicle
* assign v2.driver and vehicle

* Rest call

   | action                 | value                                                    |
   |------------------------|----------------------------------------------------------|
   | method:delete          | /api/v2/driverAssignment/${store:response-assignment#id} |
   | description            | Remove a DriverAssignment                                |
   | expected:header#status | 204                                                      |

* Rest call

   | action                     | value                                                    |
   |----------------------------|----------------------------------------------------------|
   | method:get                 | /api/v2/driverAssignment/${store:response-assignment#id} |
   | description                | Try delted DriverAssignment                              |
   | expected:header#status     | 200                                                      |
   | expected:smaller#validFrom | ${generate:datetime.iso}                                 |

## 1.8. Check Events

tags: md-25.8, event

* Test description

   | action      | value                               |
   |-------------|-------------------------------------|
   | description | Check events for a driverassignment |
   |             | * create                            |
   |             | * update                            |
   |             | * delete                            |
   | priority    | high                                |

* request admin bearer

* add company and carrier

* add user
* add driver only, email: "${store:response-user.email}"
* add vehicle

* Data manage

   | action       | value                        |
   |--------------|------------------------------|
   | in#id        | ${generate:uuid}             |
   | in#vehicleId | ${store:response-vehicle.id} |
   | in#driverId  | ${store:response-driver.id}  |
   | store        | payload-driverAssignment     |

* RabbitMQ bind

   | action      | value                                       |
   |-------------|---------------------------------------------|
   | exchange    | masterdata                                  |
   | queue       | test.driverAssignment                       |
   | description | Bind masterdata/driverAssignment crud event |

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* RabbitMQ publish

   | action            | value                                          |
   |-------------------|------------------------------------------------|
   | description       | CREATE: Publish DriverAssignment event manualy |
   | group             | Check Queues (CREATE)                          |
   | exchange          | masterdata.update                              |
   | routing           | driverAssignment                               |
   | payload           | ${store:payload-driverAssignment}              |
   | header#eventClass | DriverAssignment                               |
   | header#eventType  | CREATE                                         |

* RabbitMQ consume, continue

   | action                             | value                                        |
   |------------------------------------|----------------------------------------------|
   | queue                              | test.driverAssignment                        |
   | description                        | CREATE: DriverAssignment Event must be fired |
   | group                              | Check Queues (CREATE)                        |
   | expected:header#headers.eventClass | DriverAssignment                             |
   | expected:header#headers.eventType  | CREATE                                       |
   | store#id                           | payload-driverAssignment-id                  |

* Rest call

   | action                 | value                                                         |
   |------------------------|---------------------------------------------------------------|
   | method:get             | /api/v2/driverAssignment/${store:payload-driverAssignment-id} |
   | description            | CREATE: Read the DriverAssignment                             |
   | group                  | Check Queues (CREATE)                                         |
   | expected:header#status | 200                                                           |

@@@@@  @@@@@@ @      @@@@@@ @@@@@ @@@@@@
@    @ @      @      @        @   @
@    @ @@@@@  @      @@@@@    @   @@@@@
@    @ @      @      @        @   @
@    @ @      @      @        @   @
@@@@@  @@@@@@ @@@@@@ @@@@@@   @   @@@@@@

* RabbitMQ publish

   | action            | value                                            |
   |-------------------|--------------------------------------------------|
   | description       | DELETE: Publish onboarding updated event manualy |
   | group             | Check Queues (DELETE)                            |
   | exchange          | masterdata.update                                |
   | routing           | driverAssignment                                 |
   | payload#id        | ${store:payload-driverAssignment-id}             |
   | header#eventClass | DriverAssignment                                 |
   | header#eventType  | DELETE                                           |

* RabbitMQ consume, continue

   | action                             | value                                        |
   |------------------------------------|----------------------------------------------|
   | queue                              | test.driverAssignment                        |
   | description                        | DELETE: DriverAssignment Event must be fired |
   | group                              | Check Queues (DELETE)                        |
   | expected:header#headers.eventClass | DriverAssignment                             |
   | expected:header#headers.eventType  | UPDATE                                       |
   | expected#id                        | ${store:payload-driverAssignment-id}         |

* Rest call

   | action                     | value                                                         |
   |----------------------------|---------------------------------------------------------------|
   | method:get                 | /api/v2/driverAssignment/${store:payload-driverAssignment-id} |
   | description                | DELETE: Read the DriverAssignment, but it must be deleted now |
   | group                      | Check Queues (DELETE)                                         |
   | expected:smaller#validFrom | ${generate:datetime.iso}                                      |
   | expected:header#status     | 200                                                           |

## 1.9. Check Event Consuming Error

tags: md-25.9, event

* Test description

   | action      | value                                              |
   |-------------|----------------------------------------------------|
   | description | Errors must be processed by the death letter queue |
   | priority    | high                                               |

* RabbitMQ bind

   | action      | value                              |
   |-------------|------------------------------------|
   | exchange    | masterdata.error                   |
   | queue       | test.md.error                      |
   | description | Bind masterdata death letter queue |

* RabbitMQ publish

   | action            | value                                             |
   |-------------------|---------------------------------------------------|
   | description       | Publish deletion without id updated event manualy |
   | exchange          | masterdata.update                                 |
   | routing           | driverAssignment                                  |
   | payload#-id-      | xxxxx                                             |
   | header#eventClass | DriverAssignment                                  |
   | header#eventType  | Create                                            |

* RabbitMQ consume, continue

   | action        | value                            |
   |---------------|----------------------------------|
   | queue         | test.md.error                    |
   | description   | Death letter Event must be fired |
   | expected#-id- | xxxxx                            |

## 1.10 Check error handling when retrieving wrong DriverAssignment

tags: md-25.10, event

* Test description

   | action      | value                                        |
   |-------------|----------------------------------------------|
   | description | Try retrieving not existing DriverAssignment |
   | priority    | high                                         |

* request admin bearer

* Rest call

   | action                 | value                                     |
   |------------------------|-------------------------------------------|
   | method:get             | /api/v2/driverAssignment/${generate:uuid} |
   | description            | Try getting DriverAssignment              |
   | expected:header#status | 404                                       |

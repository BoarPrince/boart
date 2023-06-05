# 1. User - MasterData

tags: env-all, master-data, masterdata, md-23, user, v2

## 1.1. Check Version 1 triggered notification

tags: md-23.1, event

* Test description

   | action      | value                                                           |
   |-------------|-----------------------------------------------------------------|
   | description | Trigger changes on Version 1 User and check event notificatioin |
   | priority    | high                                                            |

* request admin bearer

* add company and carrier

* RabbitMQ bind

   | action      | value                     |
   |-------------|---------------------------|
   | exchange    | user                      |
   | queue       | test.md.v1.user           |
   | description | Bind user version 1 queue |
   | group       | Bind Queues               |

* RabbitMQ bind

   | action      | value                     |
   |-------------|---------------------------|
   | exchange    | masterdata                |
   | queue       | test.md.v2.user           |
   | description | Bind user version 2 queue |
   | group       | Bind Queues               |

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* add user

* RabbitMQ consume, continue

   | action      | value                               |
   |-------------|-------------------------------------|
   | queue       | test.md.v1.user                     |
   | group       | Check Queues (CREATE)               |
   | description | CREATE V1: User Event must be fired |

* RabbitMQ consume, continue

   | action                             | value                               |
   |------------------------------------|-------------------------------------|
   | queue                              | test.md.v2.user                     |
   | group                              | Check Queues (CREATE)               |
   | description                        | CREATE V2: User Event must be fired |
   | expected:header#headers.eventClass | User                                |
   | expected:header#headers.eventType  | CREATE                              |
   | expected#id                        | ${store:response-user.id}           |
   | expected#companyId                 | ${store:response-co.id}             |

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@
@    @ @    @ @    @  @  @    @   @
@    @ @    @ @    @ @    @   @   @@@@@
@    @ @@@@@  @    @ @@@@@@   @   @
@    @ @      @    @ @    @   @   @
 @@@@  @      @@@@@  @    @   @   @@@@@@

* Rest call

   | action                 | value                               |
   |------------------------|-------------------------------------|
   | method:put             | /api/user/${store:response-user.id} |
   | description            | Update the User                     |
   | group                  | Check Queues (UPDATE)               |
   | payload                | ${store:response-user}              |
   | expected:header#status | 200                                 |

* RabbitMQ consume, continue

   | action      | value                               |
   |-------------|-------------------------------------|
   | queue       | test.md.v1.user                     |
   | group       | Check Queues (UPDATE)               |
   | description | UPDATE V1: User Event must be fired |

* RabbitMQ consume, continue

   | action                             | value                               |
   |------------------------------------|-------------------------------------|
   | queue                              | test.md.v2.user                     |
   | group                              | Check Queues (UPDATE)               |
   | description                        | UPDATE V2: User Event must be fired |
   | expected:header#headers.eventClass | User                                |
   | expected:header#headers.eventType  | UPDATE                              |
   | expected#id                        | ${store:response-user.id}           |
   | expected#email                     | ${store:response-user.email}        |
   | expected#companyId                 | ${store:response-co.id}             |

@@@@@  @@@@@@ @      @@@@@@ @@@@@ @@@@@@
@    @ @      @      @        @   @
@    @ @@@@@  @      @@@@@    @   @@@@@
@    @ @      @      @        @   @
@    @ @      @      @        @   @
@@@@@  @@@@@@ @@@@@@ @@@@@@   @   @@@@@@

* Rest call

   | action                 | value                               |
   |------------------------|-------------------------------------|
   | method:delete          | /api/user/${store:response-user.id} |
   | description            | Delete the User                     |
   | group                  | Check Queues (DELETE)               |
   | expected:header#status | 204                                 |

* RabbitMQ consume, continue

   | action      | value                               |
   |-------------|-------------------------------------|
   | queue       | test.md.v1.user                     |
   | group       | Check Queues (DELETE)               |
   | description | DELETE V1: User Event must be fired |

* RabbitMQ consume, continue

   | action                             | value                               |
   |------------------------------------|-------------------------------------|
   | queue                              | test.md.v2.user                     |
   | group                              | Check Queues (DELETE)               |
   | description                        | DELETE V2: User Event must be fired |
   | expected:header#headers.eventClass | User                                |
   | expected:header#headers.eventType  | DELETE                              |
   | expected#id                        | ${store:response-user.id}           |

## 1.2. Retrieve User

tags: md-23.2

* Test description

   | action      | value           |
   |-------------|-----------------|
   | description | Getting an User |
   | priority    | high            |

* request admin bearer

* add company and carrier

* add user
* add driver only, email: "${store:response-user.email}"

* Rest call

   | action                          | value                                  |
   |---------------------------------|----------------------------------------|
   | method:get                      | /api/v2/user/${store:response-user.id} |
   | description                     | Get a User                             |
   | expected:header#status          | 200                                    |
   | expected#companyId              | ${store:response-co.id}                |
   | expected#id                     | ${store:response-user.id}              |
   | expected#driverId               | ${store:response-driver.id}            |
   | expected:count#contactPersonIds | 1                                      |
   | expected#contactPersonIds[0]    | ${store:response-ca.addresses[0].id}   |

## 1.3. Retrieve Users (admin)

tags: md-23.3

* Test description

   | action      | value                                |
   |-------------|--------------------------------------|
   | description | Getting all Users with admin account |
   | priority    | high                                 |

* request admin bearer

* add company and carrier

* Rest call

   | action                         | value                 |
   |--------------------------------|-----------------------|
   | method:get                     | /api/v2/user          |
   | description                    | Get all Users (admin) |
   | expected:header#status         | 200                   |
   | expected:greater#totalElements | 100                   |

## 1.4. Retrieve Users (admin, search)

tags: md-23.4

* Test description

   | action      | value                                           |
   |-------------|-------------------------------------------------|
   | description | Getting User with admin account by searchString |
   | priority    | high                                            |

* request admin bearer

* add company and carrier

* add user
* add driver only, email: "${store:response-user.email}"

* Rest call

   | action                 | value                        |
   |------------------------|------------------------------|
   | method:get             | /api/v2/user                 |
   | query#searchString     | ${store:response-user.email} |
   | description            | Get User with search         |
   | expected:header#status | 200                          |
   | expected#totalElements | 1                            |

## 1.5. Retrieve Users of specific company

tags: md-23.5

* Test description

   | action      | value                                     |
   |-------------|-------------------------------------------|
   | description | Getting all Users from a specific company |
   | priority    | high                                      |

* request admin bearer

* add company and carrier

* add user
* add user

* Rest call

   | action                 | value                                                         |
   |------------------------|---------------------------------------------------------------|
   | method:get             | /api/v2/user/company/${store:response-co.id}                  |
   | description            | Get all Users from Company (${store:response-co.companyName}) |
   | expected:header#status | 200                                                           |
   | expected#totalElements | 2                                                             |

## 1.6 Create a new User

tags: md-23.6

* Test description

   | action      | value             |
   |-------------|-------------------|
   | description | Create a new User |
   | priority    | high              |

* request admin bearer

* add company and carrier

* Rest call

   | action                 | value                        |
   |------------------------|------------------------------|
   | method:post            | /api/v2/user                 |
   | description            | Creates a new User           |
   | payload#email          | ${generate:s:tpl:user.email} |
   | payload#companyId      | ${store:response-co.id}      |
   | expected:header#status | 200                          |

## 1.7 Update a User

tags: md-23.7

* Test description

   | action      | value          |
   |-------------|----------------|
   | description | Update an User |
   | priority    | high           |

* request admin bearer

* add company and carrier
* add user

* Rest call

   | action                 | value                                  |
   |------------------------|----------------------------------------|
   | method:put             | /api/v2/user/${store:response-user.id} |
   | description            | Updates the User                       |
   | payload#email          | ${generate:s:tpl:user.email}           |
   | payload#companyId      | ${store:response-co.id}                |
   | expected:header#status | 200                                    |

## 1.8. Check Events

tags: md-23.8, event

* Test description

   | action      | value                   |
   |-------------|-------------------------|
   | description | Check events for a user |
   |             | * create                |
   |             | * update                |
   |             | * delete                |
   | priority    | high                    |

* request admin bearer

* add company and carrier

* Data manage

   | action       | value                        |
   |--------------|------------------------------|
   | in#id        | ${generate:uuid}             |
   | in#email     | ${generate:s:tpl:user.email} |
   | in#companyId | ${store:response-co.id}      |
   | store        | payload-user                 |

* RabbitMQ bind

   | action      | value                           |
   |-------------|---------------------------------|
   | exchange    | masterdata                      |
   | queue       | test.md                         |
   | description | Bind masterdata/user crud event |

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* RabbitMQ publish

   | action            | value                              |
   |-------------------|------------------------------------|
   | description       | CREATE: Publish User event manualy |
   | group             | Check Queues (CREATE)              |
   | exchange          | masterdata.update                  |
   | routing           | user                               |
   | payload           | ${store:payload-user}              |
   | header#eventClass | User                               |
   | header#eventType  | CREATE                             |

* RabbitMQ consume, continue

   | action                             | value                            |
   |------------------------------------|----------------------------------|
   | queue                              | test.md                          |
   | description                        | CREATE: User Event must be fired |
   | group                              | Check Queues (CREATE)            |
   | expected:header#headers.eventClass | User                             |
   | expected:header#headers.eventType  | CREATE                           |

* Rest call

   | action                 | value                                 |
   |------------------------|---------------------------------------|
   | method:get             | /api/v2/user/${store:payload-user#id} |
   | description            | CREATE: Read the User                 |
   | group                  | Check Queues (CREATE)                 |
   | expected:header#status | 200                                   |

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@
@    @ @    @ @    @  @  @    @   @
@    @ @    @ @    @ @    @   @   @@@@@
@    @ @@@@@  @    @ @@@@@@   @   @
@    @ @      @    @ @    @   @   @
 @@@@  @      @@@@@  @    @   @   @@@@@@

* RabbitMQ publish

   | action            | value                                        |
   |-------------------|----------------------------------------------|
   | description       | UPDATE: Publish User updated event manualy   |
   | group             | Check Queues (UPDATE)                        |
   | exchange          | masterdata.update                            |
   | routing           | user                                         |
   | payload           | ${store:payload-user}                        |
   | payload#email     | ${store:email:=${generate:s:tpl:user.email}} |
   | header#eventClass | User                                         |
   | header#eventType  | Update                                       |

* RabbitMQ consume, continue

   | action                             | value                            |
   |------------------------------------|----------------------------------|
   | queue                              | test.md                          |
   | description                        | UPDATE: User Event must be fired |
   | group                              | Check Queues (UPDATE)            |
   | expected:header#headers.eventClass | User                             |
   | expected:header#headers.eventType  | UPDATE                           |
   | expected#email                     | ${store:email}                   |

* Rest call

   | action                 | value                                 |
   |------------------------|---------------------------------------|
   | method:get             | /api/v2/user/${store:payload-user#id} |
   | description            | UPDATE: Read the User                 |
   | group                  | Check Queues (UPDATE)                 |
   | expected:header#status | 200                                   |
   | expected#email         | ${store:email}                        |

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
   | routing           | user                                             |
   | payload#id        | ${store:payload-user#id}                         |
   | header#eventClass | User                                             |
   | header#eventType  | Delete                                           |

* RabbitMQ consume, continue

   | action                             | value                            |
   |------------------------------------|----------------------------------|
   | queue                              | test.md                          |
   | description                        | DELETE: User Event must be fired |
   | group                              | Check Queues (DELETE)            |
   | expected:header#headers.eventClass | User                             |
   | expected:header#headers.eventType  | DELETE                           |
   | expected#id                        | ${store:payload-user#id}         |

* Rest call

   | action                 | value                                             |
   |------------------------|---------------------------------------------------|
   | method:get             | /api/v2/user/${store:payload-user#id}             |
   | description            | DELETE: Read the User, but it must be deleted now |
   | group                  | Check Queues (DELETE)                             |
   | expected:header#status | 404                                               |

## 1.9. Check Event Consuming Error

tags: md-23.9, event

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
   | routing           | user                                              |
   | payload#-id-      | xxxxx                                             |
   | header#eventClass | User                                              |
   | header#eventType  | Delete                                            |

* RabbitMQ consume, continue

   | action        | value                            |
   |---------------|----------------------------------|
   | queue         | test.md.error                    |
   | description   | Death letter Event must be fired |
   | expected#-id- | xxxxx                            |

## 1.10. Delete User

tags: md-23.10, event

* Test description

   | action      | value         |
   |-------------|---------------|
   | description | Delete a user |
   | priority    | high          |

* request admin bearer

* add company and carrier

* add user

* Rest call

   | action                 | value                                  |
   |------------------------|----------------------------------------|
   | method:delete          | /api/v2/user/${store:response-user.id} |
   | description            | Delete User                            |
   | expected:header#status | 204                                    |

* Rest call

   | action                 | value                                  |
   |------------------------|----------------------------------------|
   | method:get             | /api/v2/user/${store:response-user.id} |
   | description            | Get a User                             |
   | expected:header#status | 404                                    |

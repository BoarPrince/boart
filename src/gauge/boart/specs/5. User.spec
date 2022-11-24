# 1. User - MasterData

tags: env-all, master-data, user, md-5, masterdata

## 1.1. Add a User

tags: md-5.1

* Test description

   |action     |value                |
   |-----------|---------------------|
   |description|Add a user to company|
   |priority   |high                 |

* add company and carrier

* RabbitMQ bind

   |action     |value          |
   |-----------|---------------|
   |exchange   |user           |
   |queue      |test.md.user   |
   |description|Bind user queue|
   |group      |Bind Queues    |

* Rest call

   |action                |value                       |
   |----------------------|----------------------------|
   |method:post           |/api/user                   |
   |description           |Add a User with Phonenumbers|
   |payload               |<file:request-user.json>    |
   |expected:header#status|200                         |

* RabbitMQ consume, continue

   |action                      |value                                |
   |----------------------------|-------------------------------------|
   |queue                       |test.md.user                         |
   |group                       |Check Queues                         |
   |description                 |User Event must be fired             |
   |                            |And Phonenumber must also be inlucded|
   |expected:count#phoneNumbers |1                                    |
   |expected:empty:not#eventId  |                                     |
   |expected:string#eventId     |                                     |
   |expected:empty:not#eventType|                                     |
   |expected:string#eventType   |                                     |
   |expected:empty:not#eventDate|                                     |
   |expected:string#eventDate   |                                     |

## 1.2. Add a User (with cascaded Driver)

tags: md-5.2

* Test description

   |action     |value                                         |
   |-----------|----------------------------------------------|
   |description|Add a User with an cascaded Driver to acompany|
   |priority   |high                                          |

* add company and carrier

* RabbitMQ bind

   |action     |value            |
   |-----------|-----------------|
   |exchange   |driver           |
   |queue      |test.md.driver   |
   |description|Bind driver queue|
   |group      |Bind Queues      |

* RabbitMQ bind

   |action     |value          |
   |-----------|---------------|
   |exchange   |user           |
   |queue      |test.md.user   |
   |description|Bind user queue|
   |group      |Bind Queues    |

* Rest call

   |action                |value                                   |
   |----------------------|----------------------------------------|
   |method:post           |/api/user                               |
   |description           |Add a User (including a cascaded Driver)|
   |payload               |<file:request-user.json>                |
   |payload#driver        |<file:request-driver-only.json>         |
   |expected:header#status|200                                     |

* RabbitMQ consume, continue

   |action     |value                     |
   |-----------|--------------------------|
   |queue      |test.md.driver            |
   |group      |Check Queues              |
   |description|Driver Event must be fired|

* RabbitMQ consume, continue

   |action     |value                   |
   |-----------|------------------------|
   |queue      |test.md.user            |
   |group      |Check Queues            |
   |description|User Event must be fired|

## 1.3. Add an User and check validation

tags: md-5.3

* Test description

   |action     |value                                   |
   |-----------|----------------------------------------|
   |description|Adding an User without a local must fail|
   |priority   |high                                    |

* add company and carrier

* Rest call, continue

   |action                |value                                            |
   |----------------------|-------------------------------------------------|
   |method:post           |/api/user                                        |
   |description           |Add an User without local must result in an error|
   |payload               |<file:request-user.json>                         |
   |payload#locale        |null                                             |
   |expected:header#status|400                                              |
   |expected#description  |{locale=must not be null},                       |

* Rest call, continue

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/user                                           |
   |description           |Add an User with wrong local must result in an error|
   |payload               |<file:request-user.json>                            |
   |payload#locale        |due                                                 |
   |expected:header#status|400                                                 |
   |expected#description  |{locale=size must be between 2 and 2},              |

* Rest call, continue

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/user                                           |
   |description           |Add an User without username must result in an error|
   |payload               |<file:request-user.json>                            |
   |payload#username      |null                                                |
   |expected:header#status|400                                                 |

## 1.4. Add and Update an User

tags: md-5.4

* Test description

   |action     |value                                              |
   |-----------|---------------------------------------------------|
   |description|Adding an User and update the by using the response|
   |priority   |high                                               |

* add company and carrier

* add user

* Rest call

   |action                |value                                   |
   |----------------------|----------------------------------------|
   |method:put            |/api/user/${store:response-user.id}     |
   |description           |Update the User                         |
   |payload               |${store:response-user}                  |
   |payload#lastname      |${store:response-user.firstname}-Updated|
   |expected:header#status|200                                     |
   |expected#lastname     |${store:response-user.firstname}-Updated|

## 1.5. Delete an User and check if event payload is correct

tags: md-5.5, delete-event

* Test description

   |action     |value                                                       |
   |-----------|------------------------------------------------------------|
   |description|Deleting an User                                            |
   |           |Response and Event payload must still contain the CarriersId|
   |priority   |high                                                        |

* add company and carrier

* queues bind "user"

* add user

* queues check "user"

* Data manage

   |action                   |value                                          |
   |-------------------------|-----------------------------------------------|
   |in                       |${store:event-user}                            |
   |description              |User event for creation must contain carrierIds|
   |group                    |Check Queues                                   |
   |expected#eventType       |CREATE                                         |
   |expected:count#carrierIds|1                                              |

* Rest call

   |action                |value                              |
   |----------------------|-----------------------------------|
   |method:delete         |/api/user/${store:response-user.id}|
   |description           |Delete the User again              |
   |expected:header#status|204                                |

* queues check "user"

* Data manage

   |action                   |value                                          |
   |-------------------------|-----------------------------------------------|
   |in                       |${store:event-user}                            |
   |description              |User event for deleting must contain carrierIds|
   |group                    |Check Queues                                   |
   |expected#eventType       |DELETE                                         |
   |expected:count#carrierIds|1                                              |

## 1.6. Add User to two carriers

tags: md-5.6

* Test description

   |action     |value                                      |
   |-----------|-------------------------------------------|
   |description|User must associatable to multiple carriers|
   |priority   |high                                       |

* request admin bearer

* add company, response: "response-co"

* Rest call

   |action                |value                      |
   |----------------------|---------------------------|
   |method:post           |/api/carrier               |
   |description           |Create first Carrier       |
   |payload               |<file:request-carrier.json>|
   |payload#companyId     |${store:response-co.id}    |
   |payload#users[0]      |<file:request-user.json>   |
   |expected:header#status|200                        |
   |store                 |response-ca                |

* Rest call

   |action                |value                      |
   |----------------------|---------------------------|
   |method:post           |/api/carrier               |
   |description           |Create second Carrier      |
   |payload               |<file:request-carrier.json>|
   |payload#companyId     |${store:response-co.id}    |
   |expected:header#status|200                        |
   |store                 |response-ca2               |

* Rest call

   |action                |value                                                                      |
   |----------------------|---------------------------------------------------------------------------|
   |method:put            |/api/user/${store:response-ca.users[0].id}/carrier/${store:response-ca2.id}|
   |description           |Associate user to a second carrier                                         |
   |payload#companyId     |${store:response-co.id}                                                    |
   |expected:header#status|200                                                                        |

* Rest call

   |action                      |value                                       |
   |----------------------------|--------------------------------------------|
   |method:get                  |/api/user/${store:response-ca.users[0].id}  |
   |description                 |Check if user is associated to both carriers|
   |expected:header#status      |200                                         |
   |expected:count#carrierIds   |2                                           |
   |expected:contains#carrierIds|${store:response-ca.id}                     |
   |expected:contains#carrierIds|${store:response-ca2.id}                    |

## 1.7. Try add User with legitimationStatus = NONE

tags: md-5.7

* Test description

   |action     |value                                                |
   |-----------|-----------------------------------------------------|
   |description|User cannot have legitimation Status NONE (only None)|
   |priority   |high                                                 |

* request admin bearer

* add company and carrier

* Rest call

   |action                    |value                               |
   |--------------------------|------------------------------------|
   |method:post               |/api/user                           |
   |description               |Tray add an User (LegiStatus = NONE)|
   |payload                   |<file:request-user.json>            |
   |payload#legitimationStatus|NONE                                |
   |expected:header#status    |400                                 |

## 1.8. Add User with legitimationStatus = None

tags: md-5.8

* Test description

   |action     |value                                                    |
   |-----------|---------------------------------------------------------|
   |description|Add User with LegitimationStatus None and read user again|
   |priority   |high                                                     |

* request admin bearer

* add company and carrier

* Rest call

   |action                    |value                          |
   |--------------------------|-------------------------------|
   |method:post               |/api/user                      |
   |description               |Add an User (LegiStatus = None)|
   |payload                   |<file:request-user.json>       |
   |payload#legitimationStatus|None                           |
   |expected:header#status    |200                            |
   |store                     |response-user                  |

* Rest call

   |action                |value                              |
   |----------------------|-----------------------------------|
   |method:get            |/api/user/${store:response-user.id}|
   |description           |Read user again                    |
   |expected:header#status|200                                |

## 1.9. Update User with phonenumber description

tags: md-5.9

* Test description

   |action     |value                                                  |
   |-----------|-------------------------------------------------------|
   |description|Update a user with updating the phonenumber description|
   |ticket     |MD-154                                                 |
   |priority   |high                                                   |

* request admin bearer

* add company and carrier

* Rest call

   |action                    |value                          |
   |--------------------------|-------------------------------|
   |method:post               |/api/user                      |
   |description               |Add an User (LegiStatus = None)|
   |payload                   |<file:request-user.json>       |
   |payload#legitimationStatus|None                           |
   |expected:header#status    |200                            |
   |store                     |response-user                  |

* Rest call

   |action                             |value                              |
   |-----------------------------------|-----------------------------------|
   |method:put                         |/api/user/${store:response-user.id}|
   |description                        |Change Phonenumber description     |
   |payload                            |${store:response-user}             |
   |payload#phoneNumbers[0].description|lirum                              |
   |expected:header#status             |200                                |

* Rest call

   |action                              |value                              |
   |------------------------------------|-----------------------------------|
   |method:get                          |/api/user/${store:response-user.id}|
   |description                         |Read user again                    |
   |expected:header#status              |200                                |
   |expected#phoneNumbers[0].description|lirum                              |

* Rest call

   |action                             |value                              |
   |-----------------------------------|-----------------------------------|
   |method:put                         |/api/user/${store:response-user.id}|
   |description                        |Empty phone number description     |
   |payload                            |${store:response-user}             |
   |payload#phoneNumbers[0].description|                                   |
   |expected:header#status             |200                                |

* Rest call

   |action                              |value                                             |
   |------------------------------------|--------------------------------------------------|
   |method:get                          |/api/user/${store:response-user.id}               |
   |description                         |Read user with empty phonenumber description again|
   |expected:header#status              |200                                               |
   |expected#phoneNumbers[0].description|                                                  |

## 1.10. Add a user without id

tags: md-5.10

* Test description

   |action     |value                            |
   |-----------|---------------------------------|
   |description|Add a user without any defined id|
   |           |* user does not have an id       |
   |           |* phonenumber does not have an id|
   |priority   |high                             |

* request admin bearer

* add company and carrier

* Rest call

   |action                    |value                   |
   |--------------------------|------------------------|
   |method:post               |/api/user               |
   |description               |Create a user           |
   |payload                   |<file:request-user.json>|
   |payload#id                |undefined               |
   |payload#phoneNumbers[0].id|undefined               |
   |payload#carrierIds[0]     |${store:response-ca.id} |
   |expected:header#status    |200                     |

## 1.11. Add a cascaded user without ids

tags: cascading-deletion, md-5.11

* Test description

   |action     |value                                      |
   |-----------|-------------------------------------------|
   |description|Add a cascaded user without any defined ids|
   |           |* user does not have an id                 |
   |           |* driver does not have an id               |
   |           |* phonenumber does not have an id          |
   |priority   |high                                       |

* request admin bearer

* add company and carrier

* Rest call

   |action                           |value                                  |
   |---------------------------------|---------------------------------------|
   |method:post                      |/api/user                              |
   |description                      |Create cascaded User (including driver)|
   |payload                          |<file:request-user.json>               |
   |payload#.id                      |undefined                              |
   |payload#.carrierIds              |undefined                              |
   |payload#.phoneNumbers[0].id      |undefined                              |
   |payload#carrierIds[0]            |${store:response-ca.id}                |
   |payload#driver                   |<file:request-driver.json>             |
   |payload#driver.id                |undefined                              |
   |payload#driver.carrierId         |undefined                              |
   |payload#driver.email             |undefined                              |
   |payload#driver.firstname         |undefined                              |
   |payload#driver.lastname          |undefined                              |
   |payload#driver.phoneNumbers[0].id|undefined                              |
   |expected:header#status           |200                                    |



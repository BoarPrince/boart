# 1. User - MasterData

tags: env-all, master-data, user, md-5, masterdata

## 1.1. Add a User

tags: md-5.1

* Test description

   |action     |value                   |
   |-----------|------------------------|
   |description|Add an user to a company|
   |priority   |high                    |

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
   |expected:header#status|406                                              |
   |expected#detail       |{locale=must not be null},                       |

* Rest call, continue

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/user                                           |
   |description           |Add an User with wrong local must result in an error|
   |payload               |<file:request-user.json>                            |
   |payload#locale        |due                                                 |
   |expected:header#status|406                                                 |
   |expected#detail       |{locale=size must be between 2 and 2},              |

* Rest call, continue

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/user                                           |
   |description           |Add an User without username must result in an error|
   |payload               |<file:request-user.json>                            |
   |payload#username      |null                                                |
   |expected:header#status|406                                                 |

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
   |expected:header#status    |406                                 |

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

## 1.12. Search users of a carrier

tags: cascading-deletion, md-5.12

* Test description

   |action     |value                                      |
   |-----------|-------------------------------------------|
   |description|Search users of a previosly created carrier|
   |           |* new user contains three users            |
   |priority   |high                                       |

* request admin bearer

* add company and carrier

* add user "user-1"

* add user "user-2"

* add user "user-3"

* Rest call

   |action                |value                                            |
   |----------------------|-------------------------------------------------|
   |description           |Read users of the carrier without a search-string|
   |                      |It must return three users                       |
   |method:get            |/api/user/carrier/${store:response-ca.id}        |
   |expected:header#status|200                                              |
   |expected:count#content|3                                                |

* Rest call

   |action                |value                                                  |
   |----------------------|-------------------------------------------------------|
   |description           |Read users of the carrier with a search string (user-1)|
   |                      |The result must contain one user                       |
   |method:get            |/api/user/carrier/${store:response-ca.id}              |
   |query#searchString    |user-1                                                 |
   |expected:header#status|200                                                    |
   |expected:count#content|1                                                      |

* Rest call

   |action                |value                                                  |
   |----------------------|-------------------------------------------------------|
   |description           |Read users of the carrier with a search string (user-2)|
   |                      |The result must contain one user                       |
   |method:get            |/api/user/carrier/${store:response-ca.id}              |
   |query#searchString    |user-2                                                 |
   |expected:header#status|200                                                    |
   |expected:count#content|1                                                      |

* Rest call

   |action                |value                                                 |
   |----------------------|------------------------------------------------------|
   |description           |Read users of the carrier with a search string (user-)|
   |                      |The result must contain all users                     |
   |method:get            |/api/user/carrier/${store:response-ca.id}             |
   |query#searchString    |user-                                                 |
   |expected:header#status|200                                                   |
   |expected:count#content|3                                                     |

## 1.13. Carrier Admin can add Users

tags: md-5.13, carrier-admin, env:development, env:staging

* Test description

   |action     |value                                                   |
   |-----------|--------------------------------------------------------|
   |description|Add users to a carrier as CarrierAdmin and search for it|
   |priority   |high                                                    |

* request admin bearer

* add company, carrier and user

* request user bearer, username: "${store:response-user.email}", password: "${env:default_password}"

* add user "first 1"
* Save value: "${store:response-user.email}" to store: "email-of-first-1"

* add user "first 2"

* add user "first 3"

* Rest call

   |action                |value                                    |
   |----------------------|-----------------------------------------|
   |method:get            |/api/user/carrier/${store:response-ca.id}|
   |description           |Carrier must be able to read all users   |
   |expected:header#status|200                                      |
   |expected:count#content|4                                        |

* Rest call

   |action                   |value                                                |
   |-------------------------|-----------------------------------------------------|
   |method:get               |/api/user/carrier/${store:response-ca.id}            |
   |query#searchString       |first 1                                              |
   |query#page               |0                                                    |
   |query#size               |0                                                    |
   |query#sort               |firstname,asc                                        |
   |description              |Carrier must be able to search for the assigned users|
   |expected:header#status   |200                                                  |
   |expected:count#content   |1                                                    |
   |expected#content[0].email|${store:email-of-first-1}                            |

## 1.14. Carrier Admin cannot add an User with Role "JitpayAdmin"

tags: md-5.14, env:development, env:staging

* Test description

   |action     |value                              |
   |-----------|-----------------------------------|
   |description|Backend must prevent adding an user|
   |           |with role "JitpayAdmin"            |
   |priority   |high                               |

* request admin bearer

* add company and carrier

* add user with role "CarrierAdmin"

* request user bearer, username: "${store:response-user.email}", password: "${env:default_password}"

* Rest call

   |action                |value                                          |
   |----------------------|-----------------------------------------------|
   |method:post           |/api/user                                      |
   |run:env               |development, staging                           |
   |description           |Add a user with role JitpayAdmin is not allowed|
   |payload               |<file:request-user.json>                       |
   |payload#roles[0]      |JitpayAdmin                                    |
   |expected:header#status|403                                            |

## 1.15. Carrier Admin can add an User with Role "CarrierAdmin"

tags: md-5.15, env:development, env:staging

* Test description

   |action     |value                              |
   |-----------|-----------------------------------|
   |description|Backend must prevent adding an user|
   |           |with role "CarrierAdmin"           |
   |priority   |high                               |

* request admin bearer

* add company and carrier

* add user with role "CarrierAdmin"

* request user bearer, username: "${store:response-user.email}", password: "${env:default_password}"

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:post           |/api/user                                    |
   |run:env               |development, staging                         |
   |description           |Add an User with role CarrierAdmin is allowed|
   |payload               |<file:request-user.json>                     |
   |payload#roles[0]      |CarrierAdmin                                 |
   |expected:header#status|200                                          |

* Rest call

   |action                |value                                                         |
   |----------------------|--------------------------------------------------------------|
   |method:post           |/api/user                                                     |
   |run:env               |development, staging                                          |
   |description           |Add an User with role CarrierManager is allowd as CarrierAdmin|
   |payload               |<file:request-user.json>                                      |
   |payload#roles[0]      |CarrierManager                                                |
   |expected:header#status|200                                                           |

* Rest call

   |action                |value                                                 |
   |----------------------|------------------------------------------------------|
   |method:post           |/api/user                                             |
   |run:env               |development, staging                                  |
   |description           |Add an User with role Driver is allowd as CarrierAdmin|
   |payload               |<file:request-user.json>                              |
   |payload#roles[0]      |Driver                                                |
   |expected:header#status|200                                                   |


## 1.16. Carrier Manager can only add an User with Role "Driver"

tags: md-5.16, env:development, env:staging

* Test description

   |action     |value                             |
   |-----------|----------------------------------|
   |description|Backend must check adding an users|
   |           |for role "CarrierManager"         |
   |priority   |high                              |

* request admin bearer

* add company and carrier

* add user with role "CarrierManager"

* request user bearer, username: "${store:response-user.email}", password: "${env:default_password}"

* Rest call

   |action                |value                                          |
   |----------------------|-----------------------------------------------|
   |method:post           |/api/user                                      |
   |run:env               |development, staging                           |
   |description           |Add an User with role JItpayAdmin is not allowd|
   |payload               |<file:request-user.json>                       |
   |payload#roles[0]      |JitpayAdmin                                    |
   |expected:header#status|403                                            |

* Rest call

   |action                |value                                           |
   |----------------------|------------------------------------------------|
   |method:post           |/api/user                                       |
   |run:env               |development, staging                            |
   |description           |Add an User with role CarrierAdmin is not allowd|
   |payload               |<file:request-user.json>                        |
   |payload#roles[0]      |CarrierAdmin                                    |
   |expected:header#status|403                                             |

* Rest call

   |action                |value                                                               |
   |----------------------|--------------------------------------------------------------------|
   |method:post           |/api/user                                                           |
   |run:env               |development, staging                                                |
   |description           |Add an User with role CarrierManager is not allowd as CarrierManager|
   |payload               |<file:request-user.json>                                            |
   |payload#roles[0]      |CarrierManager                                                      |
   |expected:header#status|403                                                                 |

* Rest call

   |action                |value                                                   |
   |----------------------|--------------------------------------------------------|
   |method:post           |/api/user                                               |
   |run:env               |development, staging                                    |
   |description           |Add an User with role Driver is allowd as CarrierManager|
   |payload               |<file:request-user.json>                                |
   |payload#roles[0]      |Driver                                                  |
   |expected:header#status|200                                                     |

## 1.17. Driver cannot create any other user

tags: md-5.17, env:development, env:staging

* Test description

   |action     |value                                               |
   |-----------|----------------------------------------------------|
   |description|Driver itself cannot create any other user or driver|
   |priority   |high                                                |

* request admin bearer

* add company and carrier

* add user with role "Driver"

* request user bearer, username: "${store:response-user.email}", password: "${env:default_password}"

* Rest call

   |action                |value                                          |
   |----------------------|-----------------------------------------------|
   |method:post           |/api/user                                      |
   |run:env               |development, staging                           |
   |description           |Add an User with role JItpayAdmin is not allowd|
   |payload               |<file:request-user.json>                       |
   |payload#roles[0]      |JitpayAdmin                                    |
   |expected:header#status|403                                            |

* Rest call

   |action                |value                                           |
   |----------------------|------------------------------------------------|
   |method:post           |/api/user                                       |
   |run:env               |development, staging                            |
   |description           |Add an User with role CarrierAdmin is not allowd|
   |payload               |<file:request-user.json>                        |
   |payload#roles[0]      |CarrierAdmin                                    |
   |expected:header#status|403                                             |

* Rest call

   |action                |value                                                               |
   |----------------------|--------------------------------------------------------------------|
   |method:post           |/api/user                                                           |
   |run:env               |development, staging                                                |
   |description           |Add an User with role CarrierManager is not allowd as CarrierManager|
   |payload               |<file:request-user.json>                                            |
   |payload#roles[0]      |CarrierManager                                                      |
   |expected:header#status|403                                                                 |

* Rest call

   |action                |value                                                   |
   |----------------------|--------------------------------------------------------|
   |method:post           |/api/user                                               |
   |run:env               |development, staging                                    |
   |description           |Add an User with role Driver is allowd as CarrierManager|
   |payload               |<file:request-user.json>                                |
   |payload#roles[0]      |Driver                                                  |
   |expected:header#status|200                                                     |


## 1.18. Sync specific user

tags: md-5.18, sync

* Test description

   |action     |value                                                          |
   |-----------|---------------------------------------------------------------|
   |description|Sync specific user must trigger event for user and for keycloak|
   |priority   |high                                                           |

* request admin bearer

* add company and carrier

* add user

* queues bind "user, identity-claim"

* Rest call

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:patch          |/api/maintenance/sync/user/${store:response-user.id}|
   |description           |Sync specific user - force trigger keycloak event   |
   |link:jaeager          |${generate:tpl:link.jaeger.header.traceId}          |
   |link:grafana          |${generate:tpl:link.grafana.header.traceId}         |
   |expected:header#status|202                                                 |
   |expected:contains:not |null                                                |

* queues check "user, identity-claim"

## 1.19. Sync specific users (list)

tags: md-5.19, sync

* Test description

   |action     |value                                                                 |
   |-----------|----------------------------------------------------------------------|
   |description|Sync specific users must trigger event for every user and for keycloak|
   |priority   |high                                                                  |

* request admin bearer

* add company and carrier

* add user
* Save value: "${store:response-user.id}" to store: "user-1-id"

* add user
* Save value: "${store:response-user.id}" to store: "user-2-id"

* queues bind "user, identity-claim"

* Rest call

   |action                |value                                                    |
   |----------------------|---------------------------------------------------------|
   |method:post           |/api/maintenance/sync/users                              |
   |description           |Sync specific users (list) - force trigger keycloak event|
   |payload#0             |${store:user-1-id}                                       |
   |payload#1             |${store:user-2-id}                                       |
   |link:jaeager          |${generate:tpl:link.jaeger.header.traceId}               |
   |link:grafana          |${generate:tpl:link.grafana.header.traceId}              |
   |expected:header#status|202                                                      |
   |expected:contains:not |null                                                     |

* queues check "user, identity-claim", min: "2", max: "2"

## 1.20. Wrong user event update must force an error

tags: md-5.20, sync

* Test description

   |action     |value                                                             |
   |-----------|------------------------------------------------------------------|
   |description|try update a user with a wrong event payload must lead to an error|
   |priority   |medium                                                            |

* queues bind "md-user-error, md-all-error, user-consumer"

* RabbitMQ publish

   |action        |value                                             |
   |--------------|--------------------------------------------------|
   |description   |Send a wrong event to the masterdata user exchange|
   |exchange      |user                                              |
   |header#email  |jitpay@irgendwo.de                                |
   |routing       |updatemasterdata                                  |
   |payload       |{"any wrong payload"}                             |
   |wait:after:sec|4                                                 |

* queues check "md-user-error, md-all-error, user-consumer"

## 1.21. Search User by company name (legacy=true)

tags: md-5.21

* Test description

   |action     |value                                      |
   |-----------|-------------------------------------------|
   |description|user must be searchable by the company name|
   |           |legacy = true                              |
   |priority   |medium                                     |

* request admin bearer

* add company, carrier and user

* Rest call

   |action                |value                   |
   |----------------------|------------------------|
   |method:post           |/api/user               |
   |description           |Create a user           |
   |payload               |<file:request-user.json>|
   |payload#id            |undefined               |
   |payload#carrierIds[0] |${store:response-ca.id} |
   |expected:header#status|200                     |

* Rest call

   |action                |value                            |
   |----------------------|---------------------------------|
   |description           |Search users by the company name |
   |                      |The result must contain all users|
   |method:get            |/api/users                       |
   |query#searchString    |${store:response-co.companyName} |
   |query#legacy          |true                             |
   |expected:header#status|200                              |
   |expected:count#content|2                                |

## 1.22. Search User by company name (legacy=false)

tags: md-5.22

* Test description

   |action     |value                                      |
   |-----------|-------------------------------------------|
   |description|user must be searchable by the company name|
   |           |legacy = false                             |
   |priority   |medium                                     |

* request admin bearer

* add company, carrier and user

* Rest call

   |action                |value                   |
   |----------------------|------------------------|
   |method:post           |/api/user               |
   |description           |Create a user           |
   |payload               |<file:request-user.json>|
   |payload#id            |undefined               |
   |payload#carrierIds[0] |${store:response-ca.id} |
   |expected:header#status|200                     |

* Rest call

   |action                |value                            |
   |----------------------|---------------------------------|
   |description           |Search users by the company name |
   |                      |The result must contain all users|
   |method:get            |/api/users                       |
   |query#searchString    |${store:response-co.companyName} |
   |query#legacy          |false                            |
   |expected:header#status|200                              |
   |expected:count#content|2                                |

## 1.23. Search User by jitpayId (legacy=false and true)

tags: md-5.23

* Test description

   |action     |value                                  |
   |-----------|---------------------------------------|
   |description|user must be searchable by the jitPayId|
   |           |legacy = false and true                |
   |priority   |medium                                 |

* request admin bearer

* add company, carrier and user

* Rest call

   |action                |value                   |
   |----------------------|------------------------|
   |method:post           |/api/user               |
   |description           |Create a user           |
   |payload               |<file:request-user.json>|
   |payload#id            |undefined               |
   |payload#carrierIds[0] |${store:response-ca.id} |
   |expected:header#status|200                     |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |description           |Search users by the jitpayId (legacy = false)|
   |                      |The result must contain all users            |
   |method:get            |/api/users                                   |
   |query#searchString    |${store:response-co.jitPayId}                |
   |query#legacy          |false                                        |
   |expected:header#status|200                                          |
   |expected:count#content|2                                            |

* Rest call

   |action                |value                                       |
   |----------------------|--------------------------------------------|
   |description           |Search users by the jitpayId (legacy = true)|
   |                      |The result must contain all users           |
   |method:get            |/api/users                                  |
   |query#searchString    |${store:response-co.jitPayId}               |
   |query#legacy          |true                                        |
   |expected:header#status|200                                         |
   |expected:count#content|2                                           |


## 1.24. Search over all users

tags: md-5.24

* Test description

   |action     |value              |
   |-----------|-------------------|
   |description|searching all users|
   |priority   |medium             |

* request admin bearer

* Rest call, continue

   |action                |value                        |
   |----------------------|-----------------------------|
   |method:get            |/api/users                   |
   |description           |get all users (legacy: false)|
   |query#legacy          |false                        |
   |query#page            |0                            |
   |query#size            |5                            |
   |expected:header#status|200                          |

* Rest call, continue

   |action                |value                       |
   |----------------------|----------------------------|
   |method:get            |/api/users                  |
   |description           |get all users (legacy: true)|
   |query#legacy          |true                        |
   |query#page            |0                           |
   |query#size            |5                           |
   |expected:header#status|200                         |

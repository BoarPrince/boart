# 1. Carrier - MasterData

tags: env-all, master-data, user, md-3, masterdata

## 1.1. Delete a Carrier and check if event payload is correct

tags: md-3.1, delete-event

* Test description

   |action     |value                                                                     |
   |-----------|--------------------------------------------------------------------------|
   |description|Deleting a Carrier                                                        |
   |           |Associated Users must only be deleted                                     |
   |           |Response and Event payload for the users must still contain the CarriersId|
   |priority   |high                                                                      |

* add company and carrier

* add user "first"

* add user "second"

* queues bind "user, carrier"

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:delete         |/api/carrier/${store:response-ca.id}|
   |description           |Delete the Carrier again            |
   |expected:header#status|204                                 |

* queues check "user, carrier"

* Data manage

   |action                     |value                                               |
   |---------------------------|----------------------------------------------------|
   |in                         |${store:event-carrier}                              |
   |description                |Carrier event for deleting must contain phonenumbers|
   |group                      |Check Queues                                        |
   |expected#eventType         |DELETE                                              |
   |expected:count#phoneNumbers|1                                                   |

* Data manage

   |action                     |value                                                           |
   |---------------------------|----------------------------------------------------------------|
   |in                         |${store:event-user}                                             |
   |description                |User event for deleting must contain phonenumbers and carrierIds|
   |group                      |Check Queues                                                    |
   |expected#eventType         |DELETE                                                          |
   |expected:count#phoneNumbers|1                                                               |
   |expected:count#carrierIds  |1                                                               |

## 1.2. Cascading creation of a carrier

tags: cascading-deletion, md-3.2

* Test description

   |action     |value                                                     |
   |-----------|----------------------------------------------------------|
   |description|Check that all dependend entities of a carrier are created|
   |priority   |high                                                      |

* request admin bearer

* add company, response: "response-co"

* Rest call

   |action                      |value                                        |
   |----------------------------|---------------------------------------------|
   |method:post                 |/api/carrier                                 |
   |description                 |Create cascaded Carrier                      |
   |payload                     |<file:request-carrier.json>                  |
   |payload#companyId           |${store:response-co.id}                      |
   |payload#users[0]            |<file:request-user.json>                     |
   |payload#drivers[0]          |<file:request-driver.json>                   |
   |payload#drivers[0].email    |jitpaytest+ob${generate:s:random:4}@gmail.com|
   |payload#drivers[0].firstname|${generate:t:fake:name:firstName}            |
   |payload#drivers[0].lastname |${generate:t:fake:name:lastName}             |
   |payload#vehicles[0]         |<file:request-vehicle.json>                  |
   |store:payload               |request-ca                                   |
   |expected:header#status      |200                                          |
   |store                       |response-ca                                  |

* Rest call

   |action                   |value                                     |
   |-------------------------|------------------------------------------|
   |method:get               |/api/user/${store:response-ca.users[0].id}|
   |description              |Check that cascaded user is created       |
   |expected:header#status   |200                                       |
   |expected:count#carrierIds|1                                         |

* Rest call

   |action                |value                                          |
   |----------------------|-----------------------------------------------|
   |method:get            |/api/vehicle/${store:request-ca.vehicles[0].id}|
   |description           |Check that cascaded vehicle is created         |
   |expected:header#status|200                                            |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:get            |/api/driver/${store:request-ca.drivers[0].id}|
   |description           |Check that cascaded driver is created        |
   |expected:header#status|200                                          |

## 1.3. Cascading deletion of carrier

tags: cascading-deletion, md-3.3, JIT-456, env-local

* Test description

   |action     |value                                                         |
   |-----------|--------------------------------------------------------------|
   |description|Check that all dependend entities of a carrier are deleted too|
   |ticket     |adesso:JIT-456                                                |
   |priority   |high                                                          |

* request admin bearer

* add company, response: "response-co"

* Rest call

   |action                      |value                                         |
   |----------------------------|----------------------------------------------|
   |method:post                 |/api/carrier                                  |
   |description                 |Create cascaded Carrier                       |
   |payload                     |<file:request-carrier.json>                   |
   |payload#companyId           |${store:response-co.id}                       |
   |payload#users[0]            |<file:request-user.json>                      |
   |payload#drivers[0]          |<file:request-driver.json>                    |
   |payload#drivers[0].email    |jitpaytest+ob${generate:s:random:10}@gmail.com|
   |payload#drivers[0].firstname|${generate:t:fake:name:firstName}             |
   |payload#drivers[0].lastname |${generate:t:fake:name:lastName}              |
   |payload#vehicles[0]         |<file:request-vehicle.json>                   |
   |store:payload               |request-ca                                    |
   |expected:header#status      |200                                           |
   |store                       |response-ca                                   |

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:delete         |/api/carrier/${store:response-ca.id}|
   |description           |Delete carrier again                |
   |expected:header#status|204                                 |

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:get            |/api/user/${store:response-ca.users[0].id}|
   |description           |Check that cascaded user is deleted       |
   |expected:header#status|404                                       |

* Rest call

   |action                |value                                          |
   |----------------------|-----------------------------------------------|
   |method:get            |/api/vehicle/${store:request-ca.vehicles[0].id}|
   |description           |Check that cascaded vehicle is deleted         |
   |expected:header#status|404                                            |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:get            |/api/driver/${store:request-ca.drivers[0].id}|
   |description           |Check that cascaded driver is deleted        |
   |expected:header#status|404                                          |

## 1.4. Cascading deletion of carrier, assigned user is associated to multiple carriers

tags: cascading-deletion, md-3.4, JIT-456, env-local

* Test description

   |action     |value                                                                |
   |-----------|---------------------------------------------------------------------|
   |description|Check that all dependend entities of a carrier are deleted too       |
   |           |But not the user, because the user is associated to multiple carriers|
   |ticket     |adesso:JIT-456                                                       |
   |priority   |high                                                                 |

* request admin bearer

* add company, response: "response-co"

* Rest call

   |action                      |value                                        |
   |----------------------------|---------------------------------------------|
   |method:post                 |/api/carrier                                 |
   |description                 |Create first Carrier                         |
   |payload                     |<file:request-carrier.json>                  |
   |payload#companyId           |${store:response-co.id}                      |
   |payload#users[0]            |<file:request-user.json>                     |
   |payload#drivers[0]          |<file:request-driver.json>                   |
   |payload#drivers[0].email    |jitpaytest+ob${generate:s:random:4}@gmail.com|
   |payload#drivers[0].firstname|${generate:t:fake:name:firstName}            |
   |payload#drivers[0].lastname |${generate:t:fake:name:lastName}             |
   |payload#vehicles[0]         |<file:request-vehicle.json>                  |
   |expected:header#status      |200                                          |
   |store:payload               |request-ca                                   |
   |store                       |response-ca                                  |

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

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:delete         |/api/carrier/${store:response-ca.id}|
   |description           |Delete carrier again                |
   |expected:header#status|204                                 |

* Rest call

   |action                   |value                                     |
   |-------------------------|------------------------------------------|
   |method:get               |/api/user/${store:response-ca.users[0].id}|
   |description              |Check that cascaded user is not deleted   |
   |expected:header#status   |200                                       |
   |expected:count#carrierIds|1                                         |
   |expected#carrierIds[0]   |${store:response-ca2.id}                  |

## 1.5. Cascading Response / Event must contain vehicles too

tags: cascading-resposne, MD-209, md-3.5

* Test description

   |action     |value                                                   |
   |-----------|--------------------------------------------------------|
   |description|Carrier Event and Response must contain all child events|
   |ticket     |MD-209                                                  |
   |priority   |high                                                    |

* request admin bearer

* add company and carrier

comment * add carrier, companyId: "${store:response-co.id}", response: "response-ca2"

* add user
* add driver only, email: "${store:response-user.email}"
* add user
* add driver only, email: "${store:response-user.email}"
* add user
* add driver only, email: "${store:response-user.email}"

* add vehicle
* add vehicle
* add vehicle

* Rest call

   |action                            |value                                                            |
   |----------------------------------|-----------------------------------------------------------------|
   |method:get                        |/api/carrier/${store:response-ca.id}                             |
   |description                       |Carrier request must contain all childs (users, driver, vehicles)|
   |expected:header#status            |200                                                              |
   |expected:count#vehicles           |3                                                                |
   |expected:count#users              |3                                                                |
   |expected:empty:not#users[0].driver|                                                                 |
   |group                             |Check Response                                                   |

* Rest call

   |action                                        |value                                                                      |
   |----------------------------------------------|---------------------------------------------------------------------------|
   |method:get                                    |/api/company/${store:response-co.id}                                       |
   |description                                   |Company request must contain all childs (carriers, users, driver, vehicles)|
   |expected:header#status                        |200                                                                        |
   |expected:count#carriers[0].vehicles           |3                                                                          |
   |expected:count#carriers[0].users              |3                                                                          |
   |expected:empty:not#carriers[0].users[0].driver|                                                                           |
   |group                                         |Check Response                                                             |

* queues bind "company, carrier"

* Rest call

   |action                |value                                                |
   |----------------------|-----------------------------------------------------|
   |method:get            |/api/maintenance/sync/carrier/${store:response-ca.id}|
   |description           |Trigger carrier event                                |
   |expected:header#status|202                                                  |
   |group                 |Trigger Event                                        |

* Rest call

   |action                |value                                                |
   |----------------------|-----------------------------------------------------|
   |method:get            |/api/maintenance/sync/company/${store:response-co.id}|
   |description           |Trigger company event                                |
   |expected:header#status|202                                                  |
   |group                 |Trigger Event                                        |

* queues check "company, carrier"

## 1.6. Add a carrier without ids

tags: cascading-deletion, md-3.6

* Test description

   |action     |value                               |
   |-----------|------------------------------------|
   |description|Add a carrier without any defined id|
   |           |* carrier does not have an id       |
   |           |* address does not have an id       |
   |           |* phonenumber does not have an id   |
   |priority   |high                                |

* request admin bearer

* add company, response: "response-co"

* Rest call

   |action                    |value                      |
   |--------------------------|---------------------------|
   |method:post               |/api/carrier               |
   |description               |Create cascaded Carrier    |
   |payload                   |<file:request-carrier.json>|
   |payload#id                |undefined                  |
   |payload#addresses[0].id   |undefined                  |
   |payload#phoneNumbers[0].id|undefined                  |
   |payload#companyId         |${store:response-co.id}    |
   |expected:header#status    |200                        |

## 1.7. Add a cascaded carrier without ids

tags: cascading-deletion, md-3.7

* Test description

   |action     |value                                         |
   |-----------|----------------------------------------------|
   |description|Add a cascaded carrier without any defined ids|
   |           |* user does not have an id                    |
   |           |* carrier does not have an id                 |
   |           |* address does not have an id                 |
   |           |* phonenumber does not have an id             |
   |priority   |high                                          |

* request admin bearer

* add company, response: "response-co"

* Rest call

   |action                               |value                                |
   |-------------------------------------|-------------------------------------|
   |method:post                          |/api/carrier                         |
   |description                          |Create cascaded Carrier              |
   |payload                              |<file:request-carrier.json>          |
   |payload#id                           |undefined                            |
   |payload#addresses[0].id              |undefined                            |
   |payload#phoneNumbers[0].id           |undefined                            |
   |payload#users[0]                     |<file:request-user.json>             |
   |payload#users[0].id                  |undefined                            |
   |payload#users[0].carrierIds          |undefined                            |
   |payload#users[0].phoneNumbers[0].id  |undefined                            |
   |payload#drivers[0]                   |<file:request-driver.json>           |
   |payload#drivers[0].id                |undefined                            |
   |payload#drivers[0].carrierId         |undefined                            |
   |payload#drivers[0].email             |${context:payload#users[0].email}    |
   |payload#drivers[0].firstname         |${context:payload#users[0].firstname}|
   |payload#drivers[0].lastname          |${context:payload#users[0].lastname} |
   |payload#drivers[0].phoneNumbers[0].id|undefined                            |
   |payload#vehicles[0]                  |<file:request-vehicle.json>          |
   |payload#vehicles[0].id               |undefined                            |
   |payload#vehicles[0].carrierId        |undefined                            |
   |payload#companyId                    |${store:response-co.id}              |
   |expected:header#status               |200                                  |


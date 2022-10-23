# 1. Carrier - MasterData

tags: env-all, master-data, user, md-3

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

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
   |payload#drivers[0].email    |jitpaytest+ob${generate:s:random:8}@gmail.com|
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
   |payload#drivers[0].email    |jitpaytest+ob${generate:s:random:8}@gmail.com|
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
   |query#deep            |true                                         |
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
   |payload#drivers[0].email    |jitpaytest+ob${generate:s:random:8}@gmail.com|
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

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:get            |/api/carrier/${store:response-ca.id}|
   |description           |Check that Carrier is deleted       |
   |expected:header#status|404                                 |

* Rest call

   |action                   |value                                     |
   |-------------------------|------------------------------------------|
   |method:get               |/api/user/${store:response-ca.users[0].id}|
   |query#deep               |true                                      |
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
   |query#deep                        |true                                                             |
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
   |query#deep                                    |true                                                                       |
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
   |method:patch          |/api/maintenance/sync/carrier/${store:response-ca.id}|
   |description           |Trigger carrier event                                |
   |expected:header#status|202                                                  |
   |group                 |Trigger Event                                        |

* Rest call

   |action                |value                                                |
   |----------------------|-----------------------------------------------------|
   |method:patch          |/api/maintenance/sync/company/${store:response-co.id}|
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

## 1.8 Deep getting

tags: md-3.8

* Test description

   |action     |value                             |
   |-----------|----------------------------------|
   |description|only with deep users are requested|
   |priority   |medium                            |

* request admin bearer

* add company, response: "response-co"

* queues bind "carrier"

* Rest call

   |action                              |value                                                                |
   |------------------------------------|---------------------------------------------------------------------|
   |method:post                         |/api/carrier                                                         |
   |payload                             |<file:request-carrier.json>                                          |
   |payload#companyId                   |${store:response-co.id}                                              |
   |payload#users[0]                    |<file:request-user.json>                                             |
   |payload#vehicles[0]                 |<file:request-vehicle.json>                                          |
   |description                         |Create a cascaded Carrier (including users)                          |
   |                                    |addresses, bankDetails, phoneNumbers must be included in the response|
   |expected:header#status              |200                                                                  |
   |expected:count#addresses            |1                                                                    |
   |expected:count#phoneNumbers         |1                                                                    |
   |expected:count#users                |1                                                                    |
   |expected:count#users[0].phoneNumbers|1                                                                    |
   |expected:count#vehicles             |1                                                                    |
   |store#id                            |carrierId                                                            |

* Rest call

   |action                     |value                                                              |
   |---------------------------|-------------------------------------------------------------------|
   |method:get                 |/api/carrier/${store:carrierId}                                    |
   |description                |Only get carrier informations (Adresses, BankDetails, Phonenumbers)|
   |expected:header#status     |200                                                                |
   |expected:count#addresses   |1                                                                  |
   |expected:count#phoneNumbers|1                                                                  |
   |expected:count#users?      |0                                                                  |
   |expected:count#vehicles?   |0                                                                  |

* Rest call

   |action                              |value                          |
   |------------------------------------|-------------------------------|
   |method:get                          |/api/carrier/${store:carrierId}|
   |query#deep                          |true                           |
   |description                         |Get deep informations          |
   |expected:header#status              |200                            |
   |expected:count#addresses            |1                              |
   |expected:count#phoneNumbers         |1                              |
   |expected:count#users                |1                              |
   |expected:count#users[0].phoneNumbers|1                              |
   |expected:count#vehicles             |1                              |

* queues check "carrier"

* Data manage

   |action                              |value                         |
   |------------------------------------|------------------------------|
   |in                                  |${store:event-carrier}        |
   |description                         |Carrier event must always deep|
   |expected:count#addresses            |1                             |
   |expected:count#phoneNumbers         |1                             |
   |expected:count#users                |1                             |
   |expected:count#users[0].phoneNumbers|1                             |
   |expected:count#vehicles             |1                             |

## 1.9 Get all carriers with no pagination parameteres

tags: md-3.9, performance

* Test description

   |action     |value                                                                |
   |-----------|---------------------------------------------------------------------|
   |description|no pagination parameters defined. The default parameters must be used|
   |priority   |medium                                                               |

* request admin bearer

* Rest call

   |action                |value                                                  |
   |----------------------|-------------------------------------------------------|
   |method:get            |/api/carrier                                           |
   |description           |Get carrier informations, without pagination definition|
   |expected:header#status|200                                                    |
   |expected#size         |20                                                     |
   |expected#number       |0                                                      |
   |expected:count#content|20                                                     |
   |expected#sort.sorted  |false                                                  |
   |expected:contains:not |addresses                                              |
   |expected:contains:not |phoneNumbers                                           |
   |expected:contains:not |users                                                  |
   |expected:contains:not |vehicles                                               |

## 1.10 Get all carriers with pagination, but no sort order

tags: md-3.10, performance

* Test description

   |action     |value                                           |
   |-----------|------------------------------------------------|
   |description|pagination parameters defined, but no sort order|
   |priority   |medium                                          |

* request admin bearer

* Rest call

   |action                |value                   |
   |----------------------|------------------------|
   |method:get            |/api/carrier            |
   |query#size            |2                       |
   |query#page            |11                      |
   |description           |Get carrier informations|
   |expected:header#status|200                     |
   |expected#size         |2                       |
   |expected#number       |11                      |
   |expected:count#content|2                       |
   |expected#sort.sorted  |false                   |
   |expected:contains:not |addresses               |
   |expected:contains:not |phoneNumbers            |
   |expected:contains:not |users                   |
   |expected:contains:not |vehicles                |

## 1.11. Get all carriers with pagination and sort order

tags: md-3.11, performance

* Test description

   |action     |value                                       |
   |-----------|--------------------------------------------|
   |description|pagination parameters defined and sort order|
   |priority   |medium                                      |

* request admin bearer

* Rest call

   |action                |value                   |
   |----------------------|------------------------|
   |method:get            |/api/carrier            |
   |query#size            |2                       |
   |query#page            |11                      |
   |query#sort            |id                      |
   |description           |Get carrier informations|
   |expected:header#status|200                     |
   |expected#size         |2                       |
   |expected#number       |11                      |
   |expected:count#content|2                       |
   |expected#sort.sorted  |true                    |
   |expected:contains:not |addresses               |
   |expected:contains:not |phoneNumbers            |
   |expected:contains:not |users                   |
   |expected:contains:not |vehicles                |

## 1.12. Get all carriers with pagination, sort order and searchString

tags: md-3.12, performance

* Test description

   |action     |value                                                     |
   |-----------|----------------------------------------------------------|
   |description|pagination parameters, sort order and searchString defined|
   |priority   |high                                                      |

* request admin bearer

* add company, response: "response-co"

* Rest call

   |action                |value                      |
   |----------------------|---------------------------|
   |method:post           |/api/carrier               |
   |description           |Create Jitpay Carrier      |
   |payload               |<file:request-carrier.json>|
   |payload#carrierName   |JitPay 1 Gmbh              |
   |payload#companyId     |${store:response-co.id}    |
   |expected:header#status|200                        |

* Rest call

   |action                |value                      |
   |----------------------|---------------------------|
   |method:post           |/api/carrier               |
   |description           |Create Jitpay Carrier      |
   |payload               |<file:request-carrier.json>|
   |payload#carrierName   |JitPay 2 Gmbh              |
   |payload#companyId     |${store:response-co.id}    |
   |expected:header#status|200                        |

* Rest call

   |action                |value                      |
   |----------------------|---------------------------|
   |method:post           |/api/carrier               |
   |description           |Create Jitpay Carrier      |
   |payload               |<file:request-carrier.json>|
   |payload#carrierName   |JitPay 3 Gmbh              |
   |payload#companyId     |${store:response-co.id}    |
   |expected:header#status|200                        |


* Rest call

   |action                             |value                   |
   |-----------------------------------|------------------------|
   |method:get                         |/api/carrier            |
   |query#size                         |2                       |
   |query#page                         |0                       |
   |query#sort                         |id                      |
   |query#searchString                 |jitpay                  |
   |description                        |Get carrier informations|
   |expected:header#status             |200                     |
   |expected#size                      |2                       |
   |expected#number                    |0                       |
   |expected:count#content             |2                       |
   |expected#sort.sorted               |true                    |
   |expected:containsKey:not#content[*]|addresses               |
   |expected:containsKey:not#content[*]|phoneNumbers            |
   |expected:containsKey:not#content[*]|users                   |
   |expected:containsKey:not#content[*]|vehicles                |
   |expected:containsKey#content[*]    |jitPayId                |

## 1.13. Update carrier without deletion of cascaded child entities

tags: md-3.13

* Test description

   |action     |value                                             |
   |-----------|--------------------------------------------------|
   |description|While updating a carrier without child definition.|
   |           |No child entity must be deleted.                  |
   |priority   |high                                              |

* request admin bearer

* add company, carrier and user

* Rest call

   |action                     |value                                                                        |
   |---------------------------|-----------------------------------------------------------------------------|
   |method:get                 |/api/carrier/${store:response-ca.id}                                         |
   |description                |Only get carrier (Adresses, BankDetails, Phonenumbers) without child entities|
   |expected:header#status     |200                                                                          |
   |expected:count#addresses   |1                                                                            |
   |expected:count#phoneNumbers|1                                                                            |
   |expected:count#users?      |0                                                                            |
   |expected:count#vehicles?   |0                                                                            |
   |store                      |carrier-response                                                             |

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:put            |/api/carrier/${store:response-ca.id}|
   |description           |Update carrier without any changes  |
   |payload               |${store:carrier-response}           |
   |expected:header#status|200                                 |

* Rest call

   |action                |value                                                             |
   |----------------------|------------------------------------------------------------------|
   |method:get            |/api/user/carrier/${store:response-ca.id}                         |
   |description           |Read user of the carrier and check that it still contains the user|
   |expected:header#status|200                                                               |
   |expected:count#content|1                                                                 |

* Rest call

   |action                |value                                                         |
   |----------------------|--------------------------------------------------------------|
   |method:put            |/api/carrier/${store:response-ca.id}                          |
   |description           |Update carrier again, but now with empty users list (users:[])|
   |payload               |${store:carrier-response}                                     |
   |payload#users         |[]                                                            |
   |expected:header#status|200                                                           |

* Rest call

   |action                |value                                                                   |
   |----------------------|------------------------------------------------------------------------|
   |method:get            |/api/user/carrier/${store:response-ca.id}                               |
   |description           |Read user of the carrier again and check that now user should be deleted|
   |expected:header#status|200                                                                     |
   |expected:count#content|0                                                                       |


## 1.14. Carrier Admin can only read his assigned Carriers

tags: md-3.14, carrier-admin, env:development, env:staging

* Test description

   |action     |value                                                 |
   |-----------|------------------------------------------------------|
   |description|A CarrierAdmin can only read his own assigned Carriers|
   |priority   |high                                                  |

* request admin bearer

* add company, carrier and user

* request user bearer, username: "${store:response-user.email}", password: "${env:default_password}"

* Rest call

   |action                |value                                                                  |
   |----------------------|-----------------------------------------------------------------------|
   |method:get            |/api/carrier                                                           |
   |description           |Read associated Carrier                                                |
   |                      |It must exactly one carrier and this must be the previously created one|
   |expected:header#status|200                                                                    |
   |expected:count#content|1                                                                      |
   |expected#content[0].id|${store:response-ca.id}                                                |

## 1.15. Carrier Admin can only search his associated carriers

tags: md-3.15, carrier-admin, env:development, env:staging

* Test description

   |action     |value                                                   |
   |-----------|--------------------------------------------------------|
   |description|A CarrierAdmin can only search his own assigned Carriers|
   |priority   |high                                                    |

* request admin bearer

* add company, carrier and user

* request user bearer, username: "${store:response-user.email}", password: "${env:default_password}"

* Rest call

   |action                |value                                                                   |
   |----------------------|------------------------------------------------------------------------|
   |method:get            |/api/carrier                                                            |
   |query#searchString    |${store:response-co.jitPayId}                                           |
   |description           |Search associated Carrier                                               |
   |                      |It must exactly one carrier and this must be the previously created one.|
   |                      |Searching with the unique JitpayId: ${store:response-co.jitPayId}       |
   |expected:header#status|200                                                                     |
   |expected:count#content|1                                                                       |
   |expected#content[0].id|${store:response-ca.id}                                                 |

* Rest call

   |action                |value                                                   |
   |----------------------|--------------------------------------------------------|
   |method:get            |/api/carrier                                            |
   |query#searchString    |UNKNOWN-${store:response-co.jitPayId}-UNKNOWN           |
   |description           |Search Response must be empty if no carrier can be found|
   |expected:header#status|200                                                     |
   |expected:count#content|0                                                       |

## 1.15. Create carrier without an address

tags: md-3.15

* Test description

   |action     |value                                   |
   |-----------|----------------------------------------|
   |description|A carrier must have at least one address|
   |priority   |high                                    |

* request admin bearer

* add company, response: "response-co"

* Rest call

   |action                |value                         |
   |----------------------|------------------------------|
   |method:post           |/api/carrier                  |
   |description           |Create cascaded Carrier       |
   |payload               |<file:request-carrier.json>   |
   |payload#addresses     |undefined                     |
   |payload#companyId     |${store:response-co.id}       |
   |expected:header#status|406                           |
   |expected#detail       |{addresses=must not be empty},|

## 1.16. Add a carrier without an address country

tags: md-3.16

* Test description

   |action     |value                                    |
   |-----------|-----------------------------------------|
   |description|A carrier address must define the country|
   |priority   |high                                     |
   |ticket     |MD-312                                   |

* request admin bearer

* add company, response: "response-co"

* Rest call

   |action                      |value                                         |
   |----------------------------|----------------------------------------------|
   |method:post                 |/api/carrier                                  |
   |description                 |Create a Carrier without an address           |
   |payload                     |<file:request-carrier.json>                   |
   |payload#addresses[0].country|undefined                                     |
   |payload#companyId           |${store:response-co.id}                       |
   |expected:header#status      |406                                           |
   |expected#detail             |{addresses[].country=country must be defined},|


## 1.17. Add a second address

tags: md-3.17

* Test description

   |action     |value                                                              |
   |-----------|-------------------------------------------------------------------|
   |description|After deleting a third address, only the two address must remaining|
   |priority   |high                                                               |
   |ticket     |MD-312                                                             |

* request admin bearer

* add company, response: "response-co"

* Rest call

   |action                    |value                                |
   |--------------------------|-------------------------------------|
   |method:post               |/api/carrier                         |
   |description               |Create a Carrier with three addresses|
   |payload                   |<file:request-carrier.json>          |
   |payload#addresses[0].id   |undefined                            |
   |payload#addresses[1]      |${context:payload#addresses[0]}      |
   |payload#addresses[2]      |${context:payload#addresses[0]}      |
   |payload#addresses[0].email|jitpaytest+first@gmail.com           |
   |payload#addresses[1].email|jitpaytest+second@gmail.com          |
   |payload#addresses[2].email|jitpaytest+third@gmail.com           |
   |expected:header#status    |200                                  |
   |expected:count#addresses  |3                                    |
   |store                     |response-ca                          |

* Rest call

   |action                  |value                               |
   |------------------------|------------------------------------|
   |method:put              |/api/carrier/${store:response-ca.id}|
   |description             |Update the carrier                  |
   |payload                 |${store:response-ca}                |
   |payload#addresses       |undefined                           |
   |payload#addresses[0]    |${store:response-ca.addresses[0]}   |
   |payload#addresses[1]    |${store:response-ca.addresses[2]}   |
   |expected:header#status  |200                                 |
   |expected:count#addresses|2                                   |

## 1.18. Create carrier casceded with a carrier without an address

tags: md-3.18

* Test description

   |action     |value                                   |
   |-----------|----------------------------------------|
   |description|A carrier must have at least one address|
   |priority   |high                                    |

* request admin bearer

* Rest call

   |action                       |value                                                                |
   |-----------------------------|---------------------------------------------------------------------|
   |method:post                  |/api/company                                                         |
   |description                  |Create a cascaded Company/Carrier without a Carrier Address must fail|
   |payload                      |<file:request-company.json>                                          |
   |payload#carriers[0]          |<file:request-carrier.json>                                          |
   |payload#carriers[0].addresses|[]                                                                   |
   |expected:header#status       |406                                                                  |
   |expected#detail              |{carriers[0].addresses=must not be empty},                           |

## 1.19. Create carrier casceded with a carrier without an address country

tags: md-3.19

* Test description

   |action     |value                                                                       |
   |-----------|----------------------------------------------------------------------------|
   |description|A carrier must have at least one address and the address must have a country|
   |priority   |high                                                                        |

* request admin bearer

* Rest call

   |action                                  |value                                                                        |
   |----------------------------------------|-----------------------------------------------------------------------------|
   |method:post                             |/api/company                                                                 |
   |description                             |Create a cascaded Company/Carrier without a Carrier Address Country must fail|
   |payload                                 |<file:request-company.json>                                                  |
   |payload#carriers[0]                     |<file:request-carrier.json>                                                  |
   |payload#carriers[0].addresses[0].country|undefined                                                                    |
   |expected:header#status                  |406                                                                          |
   |expected#detail                         |{carriers[0].addresses[].country=country must be defined},                   |

## 1.20. Sync specific carrier with multiple users

tags: md-3.20, sync

* Test description

   |action     |value                                                                         |
   |-----------|------------------------------------------------------------------------------|
   |description|Sync specific carrier must trigger event for associated users and for keycloak|
   |priority   |high                                                                          |

* request admin bearer

* add company and carrier

* add user

* add user

* queues bind "carrier, user, identity-claim"

* Rest call

   |action                |value                                                |
   |----------------------|-----------------------------------------------------|
   |method:patch          |/api/maintenance/sync/carrier/${store:response-ca.id}|
   |description           |Sync specific carrier - force trigger keycloak event |
   |link:jaeager          |${generate:tpl:link.jaeger.header.traceId}           |
   |link:grafana          |${generate:tpl:link.grafana.header.traceId}          |
   |expected:header#status|202                                                  |
   |expected:contains:not |null                                                 |

* queues check "carrier"

* queues check "identity-claim, user", min: "2", max: "2"

## 1.21. Sync specific carriers

tags: md-3.21, sync

* Test description

   |action     |value                                                                         |
   |-----------|------------------------------------------------------------------------------|
   |description|Sync specific carrier must trigger event for associated users and for keycloak|
   |priority   |high                                                                          |

* request admin bearer

* add company and carrier
* Save value: "${store:response-ca.id}" to store: "carrier-1-id"

* add user

* add carrier
* Save value: "${store:response-ca.id}" to store: "carrier-2-id"

* add user

* add user

* queues bind "carrier, user, identity-claim"

* Rest call

   |action                |value                                                       |
   |----------------------|------------------------------------------------------------|
   |method:post           |/api/maintenance/sync/carriers                              |
   |description           |Sync specific carriers (list) - force trigger keycloak event|
   |payload#0             |${store:carrier-1-id}                                       |
   |payload#1             |${store:carrier-2-id}                                       |
   |link:jaeager          |${generate:tpl:link.jaeger.header.traceId}                  |
   |link:grafana          |${generate:tpl:link.grafana.header.traceId}                 |
   |wait:after            |5                                                           |
   |expected:header#status|202                                                         |
   |expected:contains:not |null                                                        |

* queues check "carrier", min: "2", max: "2"

* queues check "identity-claim, user", min: "3", max: "3"

## 1.22. Check if address is correct when creating a new carrier

tags: md-3.22, version2

* Test description

   |action     |value                                                     |
   |-----------|----------------------------------------------------------|
   |description|Create a new carrier and check that the address is correct|
   |priority   |high                                                      |

* request admin bearer

* Rest call

   |action                                        |value                                                    |
   |----------------------------------------------|---------------------------------------------------------|
   |method:post                                   |/api/company                                             |
   |description                                   |Create a Company, including a Carrier (send post request)|
   |payload                                       |<file:company-with-carrier-without-ids-request.json>     |
   |payload#carriers[0].addresses[0].street       |street a                                                 |
   |payload#carriers[0].addresses[0].zipCode      |1234                                                     |
   |payload#carriers[0].addresses[0].city         |city a                                                   |
   |payload#carriers[0].addresses[0].country      |deutschland                                              |
   |payload#carriers[0].addresses[0].firstname    |first a                                                  |
   |payload#carriers[0].addresses[0].lastname     |last a                                                   |
   |payload#carriers[0].addresses[0].email        |email a                                                  |
   |payload#carriers[0].addresses[0].countryPrefix|49                                                       |
   |payload#carriers[0].addresses[0].phoneNumber  |00 a                                                     |
   |payload#carriers[0].addresses[0].type         |BILLING                                                  |
   |store#id                                      |companyId                                                |

* Rest call

   |action                                         |value                                        |
   |-----------------------------------------------|---------------------------------------------|
   |method:get                                     |/api/company/${store:companyId}              |
   |description                                    |Check if newly added company can be requested|
   |expected:header#status                         |200                                          |
   |expected#carriers[0].addresses[0].street       |street a                                     |
   |expected#carriers[0].addresses[0].zipCode      |1234                                         |
   |expected#carriers[0].addresses[0].city         |city a                                       |
   |expected#carriers[0].addresses[0].country      |DE                                           |
   |expected#carriers[0].addresses[0].firstname    |first a                                      |
   |expected#carriers[0].addresses[0].lastname     |last a                                       |
   |expected#carriers[0].addresses[0].email        |email a                                      |
   |expected#carriers[0].addresses[0].countryPrefix|49                                           |
   |--expected#addresses[0].phoneNumber            |00 a                                         |
   |expected#carriers[0].addresses[0].type         |BILLING                                      |

## 1.23. Check if phonenumbers is correct when creating a new carrier

tags: md-3.23, version2

* Test description

   |action     |value                                                                              |
   |-----------|-----------------------------------------------------------------------------------|
   |description|Create a new company, including a carrier and check that the phonenumber is correct|
   |priority   |high                                                                               |

* request admin bearer

* Rest call

   |action                                           |value                                               |
   |-------------------------------------------------|----------------------------------------------------|
   |method:post                                      |/api/company                                        |
   |description                                      |Create a Company (send post request)                |
   |payload                                          |<file:company-with-carrier-without-ids-request.json>|
   |payload#carriers[0].phoneNumbers[0].description  |desc a                                              |
   |payload#carriers[0].phoneNumbers[0].number       |1 a                                                 |
   |payload#carriers[0].phoneNumbers[0].countryPrefix|41                                                  |
   |payload#carriers[0].phoneNumbers[0].category     |OFFICE                                              |
   |payload#carriers[0].phoneNumbers[0].phoneType    |PHONE                                               |
   |payload#carriers[0].phoneNumbers[0].favorite     |true                                                |
   |store#id                                         |companyId                                           |

* Rest call

   |action                                            |value                                        |
   |--------------------------------------------------|---------------------------------------------|
   |method:get                                        |/api/company/${store:companyId}              |
   |description                                       |Check if newly added company can be requested|
   |expected:header#status                            |200                                          |
   |expected#carriers[0].phoneNumbers[0].description  |null                                         |
   |expected#carriers[0].phoneNumbers[0].number       |1 a                                          |
   |expected#carriers[0].phoneNumbers[0].countryPrefix|41                                           |
   |expected#carriers[0].phoneNumbers[0].category     |null                                         |
   |expected#carriers[0].phoneNumbers[0].phoneType    |null                                         |
   |expected#carriers[0].phoneNumbers[0].favorite     |false                                        |

# 1. Company - MasterData

tags: env-all, master-data, md-1, masterdata

## 1.1. Add a company

tags: md-1.1

* Test description

   |action     |value                                             |
   |-----------|--------------------------------------------------|
   |description|Check if a company can be created via the rest api|
   |           |And can be loaded afterwards via rest api         |
   |priority   |high                                              |

* request admin bearer

* Rest call

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/company                                        |
   |description           |Create a Company (send post request)                |
   |payload               |<file:company-with-carrier-without-ids-request.json>|
   |expected:header#status|200                                                 |
   |store#id              |companyId                                           |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:get            |/api/company/${store:companyId}              |
   |description           |Check if newly added company can be requested|
   |expected:header#status|200                                          |

## 1.2. Update a company

tags: md-1.2

* Test description

   |action     |value                                             |
   |-----------|--------------------------------------------------|
   |description|Check if a company can be created via the rest api|
   |           |And can be loaded afterwards via rest api         |
   |priority   |high                                              |

* request admin bearer

* Rest call

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/company                                        |
   |description           |Create a Company (send post request)                |
   |payload               |<file:company-with-carrier-without-ids-request.json>|
   |expected:header#status|200                                                 |
   |store                 |response                                            |

* Rest call

   |action                |value                             |
   |----------------------|----------------------------------|
   |method:put            |/api/company/${store:response.id} |
   |payload               |${store:response}                 |
   |payload#companyName   |x-x-x                             |
   |description           |Update previously created commpany|
   |expected:header#status|200                               |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:get            |/api/company/${store:response.id}            |
   |description           |Check if newly added company can be requested|
   |expected:header#status|200                                          |
   |expected#companyName  |x-x-x                                        |

## 1.3. Update a company with another id

tags: md-1.3

* Test description

   |action     |value                                |
   |-----------|-------------------------------------|
   |description|Check updating a company with another|
   |priority   |high                                 |

* request admin bearer

* Rest call

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/company                                        |
   |description           |Create first Company                                |
   |payload               |<file:company-with-carrier-without-ids-request.json>|
   |payload#companyName   |first company ${context:payload#companyName}        |
   |expected:header#status|200                                                 |
   |store                 |response1                                           |

* Rest call

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/company                                        |
   |description           |Create second Company                               |
   |payload               |<file:company-with-carrier-without-ids-request.json>|
   |payload#companyName   |second company                                      |
   |expected:header#status|200                                                 |
   |store                 |response2                                           |

* Rest call

   |action                 |value                                               |
   |-----------------------|----------------------------------------------------|
   |method:get             |/api/company/${store:response1.id}                  |
   |description            |Check before updating if Carrier is the expected one|
   |expected:header#status |200                                                 |
   |expected#carriers[0].id|${store:response1.carriers[0].id}                   |

* Rest call

   |action                |value                                         |
   |----------------------|----------------------------------------------|
   |method:get            |/api/carrier/${store:response1.carriers[0].id}|
   |description           |Load lost carrier before Updating             |
   |expected:header#status|200                                           |

* Rest call

   |action                |value                                                 |
   |----------------------|------------------------------------------------------|
   |method:put            |/api/company/${store:response1.id}                    |
   |description           |Update first Company with payload id of second Company|
   |payload               |${store:response1}                                    |
   |payload#id            |${store:response2.id}                                 |
   |expected:header#status|409                                                   |
   |expected#message      |id in payload does not match path id                  |

## 1.4. Text search company name (/api/companysearchString=abc)

tags: company-search, md-1-4

* Test description

   |action     |value                                                   |
   |-----------|--------------------------------------------------------|
   |description|Check that a company can be searched by the company name|
   |ticket     |adesso:JIT-401                                          |
   |priority   |medium                                                  |

* add company and carrier

* Rest call

   |action                         |value                           |
   |-------------------------------|--------------------------------|
   |method:get                     |/api/company                    |
   |description                    |Search company by name          |
   |query#size                     |100                             |
   |query#searchString             |${store:response-co.companyName}|
   |expected:header#status         |200                             |
   |expected:count#content         |1                               |
   |expected#content[0].id         |${store:response-co.id}         |
   |expected#content[0].companyName|${store:response-co.companyName}|

## 1.5. Text search company jitpayId (/api/companysearchString=abc)

tags: company-search, md-1-5

* Test description

   |action     |value                                                       |
   |-----------|------------------------------------------------------------|
   |description|Check that a company can be searched by the company jitPayId|
   |ticket     |adesso:JIT-401                                              |
   |priority   |medium                                                      |

* add company and carrier

* Rest call

   |action                      |value                        |
   |----------------------------|-----------------------------|
   |method:get                  |/api/company                 |
   |description                 |Search company by jitpayId   |
   |query#size                  |100                          |
   |query#searchString          |${store:response-co.jitPayId}|
   |expected:header#status      |200                          |
   |expected:count#content      |1                            |
   |expected#content[0].id      |${store:response-co.id}      |
   |expected#content[0].jitPayId|${store:response-co.jitPayId}|

## 1.6. Check queue event (creationDate, modifiedDate)

tags: company-create-event, md-1-6

* Test description

   |action     |value                                                                             |
   |-----------|----------------------------------------------------------------------------------|
   |description|Check event when creating a company (creationDate and modifiedDate cannot be null)|
   |priority   |medium                                                                            |

* queues bind "company"

* request admin bearer

* add company, response: "response-co"

* queues check "company"

* Data manage

   |action                         |value                 |
   |-------------------------------|----------------------|
   |in                             |${store:event-company}|
   |expected:empty:not#createDate  |                      |
   |expected:empty:not#modifiedDate|                      |

## 1.7. Check queue event, cascading creation with queue (creationDate, modifiedDate)

tags: company-create-cascading-queue-event, md-1.7

* Test description

   |action     |value                                                                             |
   |-----------|----------------------------------------------------------------------------------|
   |description|Check event when creating a company (creationDate and modifiedDate cannot be null)|
   |           |carrier and user event must be triggered too                                      |
   |           |even keycloak/identity event                                                      |
   |priority   |medium                                                                            |

* queues bind "company, carrier, user, identity"

* request admin bearer

* Rest call

   |action                         |value                                                          |
   |-------------------------------|---------------------------------------------------------------|
   |method:post                    |/api/company                                                   |
   |payload                        |<file:request-company.json>                                    |
   |payload#carriers[0]            |<file:request-carrier.json>                                    |
   |payload#carriers[0].id         |undefined                                                      |
   |payload#carriers[0].users[0]   |<file:request-user.json>                                       |
   |payload#carriers[0].users[0].id|undefined                                                      |
   |description                    |Create a cascaded Company request (including Carrier and users)|
   |expected:header#status         |200                                                            |
   |store                          |response-company                                               |

* queues check "company, carrier, user, identity"

* Data manage

   |action                          |value                                                 |
   |--------------------------------|------------------------------------------------------|
   |in                              |${store:event-company}                                |
   |description                     |Company event must contain createDate and modifiedDate|
   |                                |Carrier and User must also be included                |
   |expected#eventType              |CREATE                                                |
   |expected:empty:not#createDate   |                                                      |
   |expected:empty:not#modifiedDate |                                                      |
   |expected:string#createDate      |                                                      |
   |expected:string#modifiedDate    |                                                      |
   |expected:count#carriers         |1                                                     |
   |expected:count#carriers[0].users|1                                                     |

* get user claims, username: "${store:response-company.carriers[0].users[0].email}", password: "${env:default_password}"

* Data manage

   |action               |value                                                                                                           |
   |---------------------|----------------------------------------------------------------------------------------------------------------|
   |in                   |${store:response_claims}                                                                                        |
   |run:env              |development, staging                                                                                            |
   |description          |Claims must contain the correct Id's                                                                            |
   |                     |CompanyId, SubsidiaryId, UserId                                                                                 |
   |expected#companyName |${store:response-company.companyName}                                                                           |
   |expected#companyId   |${store:response-company.id}                                                                                    |
   |expected#userId      |${store:response-company.carriers[0].users[0].id}                                                               |
   |expected#subsidiaryId|${store:response-company.carriers[0].id}                                                                        |
   |expected#name        |${store:response-company.carriers[0].users[0].firstname} ${store:response-company.carriers[0].users[0].lastname}|

## 1.8. Delete must trigger event queue

tags: md-1.8

* Test description

   |action     |value                               |
   |-----------|------------------------------------|
   |description|Delete should trigger a delete event|
   |priority   |high                                |

* request admin bearer

* add company

* queues bind "company"

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:delete         |/api/company/${store:response-co.id}|
   |description           |Delete a Company                    |
   |wait:before           |5                                   |
   |expected:header#status|204                                 |

* queues check "company"

## 1.9. Add a company without ids

tags: md-1.9

* Test description

   |action     |value                               |
   |-----------|------------------------------------|
   |description|Add a company without any defined id|
   |           |* company does not have an id       |
   |           |* address does not have an id       |
   |           |* phonenumber does not have an id   |
   |priority   |medium                              |

* request admin bearer

* Rest call

   |action                    |value                                 |
   |--------------------------|--------------------------------------|
   |method:post               |/api/company                          |
   |description               |Create company without pre-defined Ids|
   |payload                   |<file:request-company.json>           |
   |payload#id                |undefined                             |
   |payload#addresses[0].id   |undefined                             |
   |payload#phoneNumbers[0].id|undefined                             |
   |expected:header#status    |200                                   |

## 1.10. Add a cascaded company without ids

tags: cascading-deletion, md-1.10

* Test description

   |action     |value                                         |
   |-----------|----------------------------------------------|
   |description|Add a cascaded company without any defined ids|
   |           |* company does not have an id                 |
   |           |* carrier does not have an id                 |
   |           |* user does not have an id                    |
   |           |* address does not have an id                 |
   |           |* phonenumber does not have an id             |
   |priority   |high                                          |

* request admin bearer

* Rest call

   |action                                           |value                                            |
   |-------------------------------------------------|-------------------------------------------------|
   |method:post                                      |/api/company                                     |
   |description                                      |Create cascaded Carrier                          |
   |payload                                          |<file:request-company.json>                      |
   |payload#id                                       |undefined                                        |
   |payload#addresses[0].id                          |undefined                                        |
   |payload#phoneNumbers[0].id                       |undefined                                        |
   |payload#carriers[0]                              |<file:request-carrier.json>                      |
   |payload#carriers[0].id                           |undefined                                        |
   |payload#carriers[0].addresses[0].id              |undefined                                        |
   |payload#carriers[0].phoneNumbers[0].id           |undefined                                        |
   |payload#carriers[0].companyId                    |undefined                                        |
   |payload#carriers[0].users[0]                     |<file:request-user.json>                         |
   |payload#carriers[0].users[0].id                  |undefined                                        |
   |payload#carriers[0].users[0].carrierIds          |undefined                                        |
   |payload#carriers[0].users[0].phoneNumbers[0].id  |undefined                                        |
   |payload#carriers[0].drivers[0]                   |<file:request-driver.json>                       |
   |payload#carriers[0].drivers[0].id                |undefined                                        |
   |payload#carriers[0].drivers[0].carrierId         |undefined                                        |
   |payload#carriers[0].drivers[0].email             |${context:payload#carriers[0].users[0].email}    |
   |payload#carriers[0].drivers[0].firstname         |${context:payload#carriers[0].users[0].firstname}|
   |payload#carriers[0].drivers[0].lastname          |${context:payload#carriers[0].users[0].lastname} |
   |payload#carriers[0].drivers[0].phoneNumbers[0].id|undefined                                        |
   |payload#carriers[0].vehicles[0]                  |<file:request-vehicle.json>                      |
   |payload#carriers[0].vehicles[0].id               |undefined                                        |
   |payload#carriers[0].vehicles[0].carrierId        |undefined                                        |
   |expected:header#status                           |200                                              |

## 1.11. Getting companies must failed, when not authenticated

tags: md-1-11

* Test description

   |action     |value                         |
   |-----------|------------------------------|
   |description|rest api must be authenticated|
   |ticket     |MD-17                         |
   |priority   |medium                        |

* Rest call

   |action                |value                 |
   |----------------------|----------------------|
   |method:get            |/api/company          |
   |description           |Search company by name|
   |query#size            |10                    |
   |expected:header#status|401                   |

## 1.12. Read all roles

tags: md-1-12

* Test description

   |action     |value                 |
   |-----------|----------------------|
   |description|Roles must be loadable|
   |priority   |medium                |

* request admin bearer

* Rest call

   |action                |value        |
   |----------------------|-------------|
   |method:get            |/api/roles   |
   |description           |Get all roles|
   |expected:header#status|200          |

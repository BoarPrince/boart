# 1. Company - MasterData

tags: env-all, master-data, md-1, masterdata

## 1.1. Add a company

tags: md-1.1a

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

## 1.1. Add a company by message queue

tags: md-1.1b

* Test description

   |action     |value                                              |
   |-----------|---------------------------------------------------|
   |description|Check if a company can be created via message queue|
   |           |And can be loaded afterwards via rest api          |
   |priority   |high                                               |

* RabbitMQ publish

   |action        |value                                               |
   |--------------|----------------------------------------------------|
   |description   |Send company creation event manually                |
   |exchange      |company                                             |
   |routing       |updatemasterdata                                    |
   |payload       |<file:company-with-carrier-without-ids-request.json>|
   |payload#id    |${generate:t:uuid}                                  |
   |wait:after:sec|4                                                   |

* request admin bearer

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:get            |/api/company/${generate:t:uuid}              |
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
   |expected#status       |409                                                   |
   |expected#detail       |id in payload does not match id in request path       |

## 1.4. Text search company name (/api/companysearchString=abc)

tags: company-search, md-1.4

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

tags: company-search, md-1.5

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

tags: company-create-event, md-1.6

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
   |description                    |Create a cascaded Company request (including Carrier and users)|
   |payload                        |<file:request-company.json>                                    |
   |payload#carriers[0]            |<file:request-carrier.json>                                    |
   |payload#carriers[0].id         |undefined                                                      |
   |payload#carriers[0].users[0]   |<file:request-user.json>                                       |
   |payload#carriers[0].users[0].id|undefined                                                      |
   |expected:header#status         |200                                                            |
   |link:jaeager                   |${generate:tpl:link.jaeger.header.traceId}                     |
   |link:grafana                   |${generate:tpl:link.grafana.header.traceId}                    |
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

tags: md-1.11

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

tags: md-1.12

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

## 1.13 Deep getting

tags: md-1.13

* Test description

   |action     |value                                          |
   |-----------|-----------------------------------------------|
   |description|only with deep carriers and users are requested|
   |priority   |medium                                         |

* request admin bearer

* queues bind "company"

* Rest call

   |action                                          |value                                                                                    |
   |------------------------------------------------|-----------------------------------------------------------------------------------------|
   |method:post                                     |/api/company                                                                             |
   |payload                                         |<file:request-company.json>                                                              |
   |payload#carriers[0]                             |<file:request-carrier.json>                                                              |
   |payload#carriers[0].users[0]                    |<file:request-user.json>                                                                 |
   |payload#carriers[0].vehicles[0]                 |<file:request-vehicle.json>                                                              |
   |description                                     |Create a cascaded Company request (including Carrier and users)                          |
   |                                                |addresses, bankDetails, phoneNumbers and Carrier details must be included in the response|
   |expected:header#status                          |200                                                                                      |
   |expected:count#addresses                        |1                                                                                        |
   |expected:count#bankDetails                      |1                                                                                        |
   |expected:count#phoneNumbers                     |1                                                                                        |
   |expected:count#carriers                         |1                                                                                        |
   |expected:count#carriers[0].addresses            |1                                                                                        |
   |expected:count#carriers[0].phoneNumbers         |1                                                                                        |
   |expected:count#carriers[0].users                |1                                                                                        |
   |expected:count#carriers[0].users[0].phoneNumbers|1                                                                                        |
   |expected:count#carriers[0].vehicles             |1                                                                                        |
   |store#id                                        |companyId                                                                                |

* Rest call

   |action                                 |value                                                              |
   |---------------------------------------|-------------------------------------------------------------------|
   |method:get                             |/api/company/${store:companyId}                                    |
   |description                            |Only get company informations (Adresses, BankDetails, Phonenumbers)|
   |expected:header#status                 |200                                                                |
   |expected:count#addresses               |1                                                                  |
   |expected:count#bankDetails             |1                                                                  |
   |expected:count#phoneNumbers            |1                                                                  |
   |expected:count#carriers                |1                                                                  |
   |expected:count#carriers[0].addresses   |1                                                                  |
   |expected:count#carriers[0].phoneNumbers|1                                                                  |
   |expected:count#carriers[0].users?      |0                                                                  |
   |expected:count#carriers[0].vehicles?   |0                                                                  |

* Rest call

   |action                                          |value                          |
   |------------------------------------------------|-------------------------------|
   |method:get                                      |/api/company/${store:companyId}|
   |query#deep                                      |true                           |
   |description                                     |Get deep informations          |
   |expected:header#status                          |200                            |
   |expected:count#addresses                        |1                              |
   |expected:count#bankDetails                      |1                              |
   |expected:count#phoneNumbers                     |1                              |
   |expected:count#carriers                         |1                              |
   |expected:count#carriers[0].addresses            |1                              |
   |expected:count#carriers[0].phoneNumbers         |1                              |
   |expected:count#carriers[0].users                |1                              |
   |expected:count#carriers[0].users[0].phoneNumbers|1                              |
   |expected:count#carriers[0].vehicles             |1                              |

* queues check "company"

* Data manage

   |action                                          |value                         |
   |------------------------------------------------|------------------------------|
   |in                                              |${store:event-company}        |
   |description                                     |Company event must always deep|
   |expected:count#addresses                        |1                             |
   |expected:count#bankDetails                      |1                             |
   |expected:count#phoneNumbers                     |1                             |
   |expected:count#carriers                         |1                             |
   |expected:count#carriers[0].addresses            |1                             |
   |expected:count#carriers[0].phoneNumbers         |1                             |
   |expected:count#carriers[0].users                |1                             |
   |expected:count#carriers[0].users[0].phoneNumbers|1                             |
   |expected:count#carriers[0].vehicles             |1                             |

## 1.14. Update a company (company is reloaded)

tags: md-1.14, MD-259

* Test description

   |action     |value                                                                                            |
   |-----------|-------------------------------------------------------------------------------------------------|
   |description|Check if a company can be created via the rest api                                               |
   |           |And can be updated afterwards. Before updating and after creating, the company is re-loaded again|
   |ticket     |MD-259                                                                                           |
   |priority   |high                                                                                             |

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

   |action                 |value                            |
   |-----------------------|---------------------------------|
   |method:get             |/api/company/${store:response.id}|
   |description            |Read previously created commpany |
   |expected:header#status |200                              |
   |expected:count#carriers|1                                |
   |store                  |reload-response                  |


* Rest call

   |action                |value                                   |
   |----------------------|----------------------------------------|
   |method:put            |/api/company/${store:reload-response.id}|
   |payload               |${store:reload-response}                |
   |payload#companyName   |x-x-x                                   |
   |description           |Update previously created commpany      |
   |expected:header#status|200                                     |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:get            |/api/company/${store:reload-response.id}     |
   |description           |Check if newly added company can be requested|
   |expected:header#status|200                                          |
   |expected#companyName  |x-x-x                                        |

## 1.15. Update a company, containing one carrier (Carrier is removed from payload)

tags: md-1.15, MD-259

* Test description

   |action     |value                                                  |
   |-----------|-------------------------------------------------------|
   |description|Check if a company can be created via the rest api     |
   |           |And can be updated without the previously added carrier|
   |ticket     |MD-259                                                 |
   |priority   |high                                                   |

* request admin bearer

* add company and carrier

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:get            |/api/company/${store:response-co.id}|
   |description           |Read previously created commpany    |
   |expected:header#status|200                                 |
   |store                 |reload-response                     |


* Rest call

   |action                |value                                   |
   |----------------------|----------------------------------------|
   |method:put            |/api/company/${store:reload-response.id}|
   |payload               |${store:reload-response}                |
   |payload#carriers      |[]                                      |
   |payload#companyName   |x-x-x                                   |
   |description           |Update previously created commpany      |
   |expected:header#status|200                                     |

* Rest call

   |action                 |value                                        |
   |-----------------------|---------------------------------------------|
   |method:get             |/api/company/${store:reload-response.id}     |
   |description            |Check if newly added company can be requested|
   |expected:header#status |200                                          |
   |expected:count#carriers|0                                            |
   |expected#companyName   |x-x-x                                        |

## 1.16. Update a company, containing two carriers (Carriers are removed from payload)

tags: md-1.16, MD-259

* Test description

   |action     |value                                                   |
   |-----------|--------------------------------------------------------|
   |description|Check if a company can be created via the rest api      |
   |           |And can be updated without the previously added carriers|
   |ticket     |MD-259                                                  |
   |priority   |high                                                    |

* request admin bearer

* add company and carrier

* add carrier

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:get            |/api/company/${store:response-co.id}|
   |description           |Read previously created commpany    |
   |expected:header#status|200                                 |
   |store                 |reload-response                     |


* Rest call

   |action                 |value                                   |
   |-----------------------|----------------------------------------|
   |method:put             |/api/company/${store:reload-response.id}|
   |payload                |${store:reload-response}                |
   |payload#carriers       |[]                                      |
   |payload#companyName    |x-x-x                                   |
   |description            |Update previously created commpany      |
   |expected:count#carriers|0                                       |
   |expected:header#status |200                                     |

* Rest call

   |action                 |value                                        |
   |-----------------------|---------------------------------------------|
   |method:get             |/api/company/${store:reload-response.id}     |
   |description            |Check if newly added company can be requested|
   |expected:header#status |200                                          |
   |expected:count#carriers|0                                            |
   |expected#companyName   |x-x-x                                        |

## 1.17. Add a company without an address must fail

tags: md-1.17

* Test description

   |action     |value                                     |
   |-----------|------------------------------------------|
   |description|Add a company without an address must fail|
   |priority   |medium                                    |
   |ticket     |MD-312                                    |

* request admin bearer

* Rest call

   |action                |value                                    |
   |----------------------|-----------------------------------------|
   |method:post           |/api/company                             |
   |description           |Create company without an address country|
   |payload               |<file:request-company.json>              |
   |payload#addresses     |undefined                                |
   |expected:header#status|406                                      |
   |expected#detail       |{addresses=must not be empty},           |

## 1.18. Add a company without an address country

tags: md-1.18

* Test description

   |action     |value                                             |
   |-----------|--------------------------------------------------|
   |description|Add a company without an address country must fail|
   |priority   |medium                                            |
   |ticket     |MD-312                                            |

* request admin bearer

* Rest call

   |action                      |value                                          |
   |----------------------------|-----------------------------------------------|
   |method:post                 |/api/company                                   |
   |description                 |Create company without pre-defined Ids         |
   |payload                     |<file:request-company.json>                    |
   |payload#addresses[0].country|undefined                                      |
   |expected:header#status      |406                                            |
   |expected#detail             |{addresses[0].country=country must be defined},|

## 1.19. Add a second address

tags: md-1.19

* Test description

   |action     |value                                                      |
   |-----------|-----------------------------------------------------------|
   |description|Add a second address to a company and removed it afterwards|
   |priority   |medium                                                     |

* request admin bearer

* Rest call

   |action                    |value                            |
   |--------------------------|---------------------------------|
   |method:post               |/api/company                     |
   |description               |Create company with two addresses|
   |payload                   |<file:request-company.json>      |
   |payload#addresses[0].id   |undefined                        |
   |payload#addresses[1]      |${context:payload#addresses[0]}  |
   |payload#addresses[0].email|jitpaytest+first@gmail.com       |
   |payload#addresses[1].email|jitpaytest+second@gmail.com      |
   |expected:header#status    |200                              |
   |expected:count#addresses  |2                                |
   |store                     |response-co                      |

* Rest call

   |action                     |value                               |
   |---------------------------|------------------------------------|
   |method:put                 |/api/company/${store:response-co.id}|
   |description                |Update the company                  |
   |payload                    |${store:response-co}                |
   |payload#addresses          |undefined                           |
   |payload#addresses[0]       |${store:response-co.addresses[1]}   |
   |expected:header#status     |200                                 |
   |expected:count#addresses   |1                                   |
   |expected#addresses[0].email|jitpaytest+second@gmail.com         |

## 1.20. Sync specific company with multiple users

tags: md-1.20, sync

* Test description

   |action     |value                                                                         |
   |-----------|------------------------------------------------------------------------------|
   |description|Sync specific company must trigger event for associated users and for keycloak|
   |priority   |high                                                                          |

* request admin bearer

* add company and carrier

* add user

* add carrier

* add user

* queues bind "company, carrier, user, identity-claim"

* Rest call

   |action                |value                                                |
   |----------------------|-----------------------------------------------------|
   |method:patch          |/api/maintenance/sync/company/${store:response-co.id}|
   |description           |Sync specific company - force trigger keycloak event |
   |link:jaeager          |${generate:tpl:link.jaeger.header.traceId}           |
   |link:grafana          |${generate:tpl:link.grafana.header.traceId}          |
   |wait:after            |10                                                   |
   |expected:header#status|202                                                  |
   |expected:contains:not |null                                                 |

* queues check "company"

* queues check "carrier, identity-claim, user", min: "2", max: "2"

## 1.21. Sync specific companies

tags: md-1.21, sync

* Test description

   |action     |value                                                                                  |
   |-----------|---------------------------------------------------------------------------------------|
   |description|Sync specific companies (list) must trigger event for associated users and for keycloak|
   |priority   |high                                                                                   |

* request admin bearer

* add company and carrier
* Save value: "${store:response-co.id}" to store: "company-1-id"
* add user

* add company and carrier
* Save value: "${store:response-co.id}" to store: "company-2-id"
* add user

* queues bind "company, carrier, user, identity-claim"

* Rest call

   |action                |value                                                        |
   |----------------------|-------------------------------------------------------------|
   |method:post           |/api/maintenance/sync/companies                              |
   |description           |Sync specific companies (list) - force trigger keycloak event|
   |payload#0             |${store:company-1-id}                                        |
   |payload#1             |${store:company-2-id}                                        |
   |link:jaeager          |${generate:tpl:link.jaeger.header.traceId}                   |
   |link:grafana          |${generate:tpl:link.grafana.header.traceId}                  |
   |wait:after            |5                                                            |
   |expected:header#status|202                                                          |
   |expected:contains:not |null                                                         |

* queues check "company, carrier, identity-claim, user", min: "2", max: "2"

## 1.22. Add a company and check queue syncronisation

tags: md-1.22

* Test description

   |action     |value                                                                    |
   |-----------|-------------------------------------------------------------------------|
   |description|Check that the synchronisation is working correctly when adding a company|
   |priority   |high                                                                     |

* request admin bearer

* queues bind "company, carrier, user, identity"

* Rest call

   |action                      |value                                               |
   |----------------------------|----------------------------------------------------|
   |method:post                 |/api/company                                        |
   |description                 |Create a Company (send post request)                |
   |payload                     |<file:company-with-carrier-without-ids-request.json>|
   |payload#carriers[0].users[0]|<file:request-user.json>                            |
   |expected:header#status      |200                                                 |
   |store                       |resonse                                             |

* queues check "company, carrier, user, identity"

* Data manage

   |action         |value                 |
   |---------------|----------------------|
   |in             |${store:event-company}|
   |store#eventDate|companyDate           |

* Data manage

   |action                    |value                                                 |
   |--------------------------|------------------------------------------------------|
   |in                        |${store:event-carrier}                                |
   |group                     |Check Receive Order                                   |
   |description               |Carrier event must be received after the carrier event|
   |store#eventDate           |carrierDate                                           |
   |expected:greater#eventDate|${store:companyDate}                                  |

* Data manage

   |action                    |value                                              |
   |--------------------------|---------------------------------------------------|
   |in                        |${store:event-user}                                |
   |group                     |Check Receive Order                                |
   |description               |User event must be received after the carrier event|
   |expected:greater#eventDate|${store:carrierDate}                               |

* check db backend sync, company: "${store:resonse}", carrier: "${store:resonse.carriers[0]}", user: "${store:resonse.carriers[0].users[0]}", driver: "", vehicle: ""

## 1.23 Create / Update companies by maintanance

tags: md-1.23

* Test description

   |action     |value                                         |
   |-----------|----------------------------------------------|
   |description|a list of companies must be createable at once|
   |priority   |medium                                        |

* request admin bearer

* Rest call

   |action                                   |value                                     |
   |-----------------------------------------|------------------------------------------|
   |method:patch                             |/api/maintenance/companies                |
   |payload#[0]                              |<file:request-company.json>               |
   |payload#[0].id                           |${store:companyId1:=${generate:uuid}}     |
   |payload#[0].carriers[0]                  |<file:request-carrier.json>               |
   |payload#[0].carriers[0].users[0]         |<file:request-user.json>                  |
   |payload#[0].carriers[0].vehicles[0]      |<file:request-vehicle.json>               |
   |payload#[1]                              |<file:request-company.json>               |
   |payload#[1].id                           |${store:companyId2:=${generate:uuid}}     |
   |payload#[1].carriers[0]                  |<file:request-carrier.json>               |
   |payload#[1].carriers[0].users[0]         |<file:request-user.json>                  |
   |payload#[1].carriers[0].users[0].email   |second_${generate:tpl:user.email}         |
   |payload#[1].carriers[0].users[0].username|second_${generate:tpl:user.email}         |
   |payload#[1].carriers[0].vehicles[0]      |<file:request-vehicle.json>               |
   |description                              |Create Companies by a maintanance request)|
   |expected:header#status                   |202                                       |

* Rest call

   |action                |value                                              |
   |----------------------|---------------------------------------------------|
   |method:get            |/api/company/${store:companyId1}                   |
   |description           |Check if first newly added company can be requested|
   |wait:before           |3                                                  |
   |expected:header#status|200                                                |

* Rest call

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:get            |/api/company/${store:companyId2}                    |
   |description           |Check if second newly added company can be requested|
   |wait:before           |3                                                   |
   |expected:header#status|200                                                 |

## 1.24. Change company id and carrier id in identity by company syncing

tags: md-1.24

* Test description

   |action     |value                                                     |
   |-----------|----------------------------------------------------------|
   |description|Send Onboarding Event to Masterdata manualy and check id's|
   |           |and afterwards change the companyId, carrierId and userId |
   |priority   |high                                                      |

* RabbitMQ publish

   |action        |value                                                |
   |--------------|-----------------------------------------------------|
   |description   |Send event to identity to create the user on keycload|
   |exchange      |Identity.Exchange                                    |
   |routing       |Identity.UserSync                                    |
   |payload       |<file:event-identity.json>                           |
   |wait:after:sec|4                                                    |

* get user claims, username: "${store:ob-email}", password: "${env:default_password}"

* Data manage

   |action               |value                               |
   |---------------------|------------------------------------|
   |in                   |${store:response_claims}            |
   |run:env              |development, staging                |
   |description          |Claims must contain the correct Id's|
   |                     |CompanyId, SubsidiaryId, UserId     |
   |expected#companyName |${store:ob-companyName}             |
   |expected#companyId   |${store:ob-companyId}               |
   |expected#userId      |${store:ob-userId}                  |
   |expected#subsidiaryId|${store:ob-carrierId}               |

* add company and carrier

* Rest call, continue

   |action                |value                    |
   |----------------------|-------------------------|
   |method:post           |/api/user                |
   |description           |Add an User to masterdata|
   |payload               |<file:request-user.json> |
   |payload#username      |${store:ob-email}        |
   |payload#email         |${store:ob-email}        |
   |expected:header#status|200                      |
   |store                 |response-user            |

* queues bind "identity-claim"

* Rest call

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:patch          |/api/maintenance/sync/user/${store:response-user.id}|
   |description           |Sync specific user - update existing keycloak id's  |
   |link:jaeager          |${generate:tpl:link.jaeger.header.traceId}          |
   |link:grafana          |${generate:tpl:link.grafana.header.traceId}         |
   |expected:header#status|202                                                 |

* queues check "identity-claim"

* get user claims, username: "${store:ob-email}", password: "${env:default_password}"

* Data manage

   |action                |value                               |
   |----------------------|------------------------------------|
   |in                    |${store:response_claims}            |
   |run:env               |development, staging                |
   |description           |Claims must contain the updated Id's|
   |                      |CompanyId, SubsidiaryId, UserId     |
   |--expected#companyName|${store:response-co.companyName}    |
   |expected#companyId    |${store:response-co.id}             |
   |expected#subsidiaryId |${store:response-ca.id}             |
   |expected#userId       |${store:response-user.id}           |

## 1.25. Sync specific company with user, driver, vehicle and driverAssignment

tags: md-1.25, sync

* Test description

   |action     |value                                             |
   |-----------|--------------------------------------------------|
   |description|Sync specific company including all child entities|
   |priority   |high                                              |

* request admin bearer

* add company and carrier

* add user

* add driver only, email: "${store:response-user.email}"

* add vehicle

* assign driver and vehicle

* queues bind "company, carrier, user, driver, vehicle, identity-claim"

* Rest call

   |action                |value                                                |
   |----------------------|-----------------------------------------------------|
   |method:patch          |/api/maintenance/sync/company/${store:response-co.id}|
   |description           |Sync specific companies                              |
   |link:jaeager          |${generate:tpl:link.jaeger.header.traceId}           |
   |link:grafana          |${generate:tpl:link.grafana.header.traceId}          |
   |wait:after            |5                                                    |
   |expected:header#status|202                                                  |
   |expected:contains:not |null                                                 |

* queues check "company, carrier, identity-claim, user, driver, vehicle", min: "1", max: "1"

## 1.26. Check if address is correct when creating a new company

tags: md-1.26, version2

* Test description

   |action     |value                                                     |
   |-----------|----------------------------------------------------------|
   |description|Create a new company and check that the address is correct|
   |priority   |high                                                      |

* request admin bearer

* Rest call

   |action                            |value                                               |
   |----------------------------------|----------------------------------------------------|
   |method:post                       |/api/company                                        |
   |description                       |Create a Company (send post request)                |
   |payload                           |<file:company-with-carrier-without-ids-request.json>|
   |payload#addresses[0].street       |street a                                            |
   |payload#addresses[0].zipCode      |1234                                                |
   |payload#addresses[0].city         |city a                                              |
   |payload#addresses[0].country      |DE                                                  |
   |payload#addresses[0].firstname    |first a                                             |
   |payload#addresses[0].lastname     |last a                                              |
   |payload#addresses[0].email        |email a                                             |
   |payload#addresses[0].countryPrefix|49                                                  |
   |payload#addresses[0].phoneNumber  |00 a                                                |
   |payload#addresses[0].type         |BILLING                                             |
   |store#id                          |companyId                                           |

* Rest call

   |action                             |value                                        |
   |-----------------------------------|---------------------------------------------|
   |method:get                         |/api/company/${store:companyId}              |
   |description                        |Check if newly added company can be requested|
   |expected:header#status             |200                                          |
   |expected#addresses[0].street       |street a                                     |
   |expected#addresses[0].zipCode      |1234                                         |
   |expected#addresses[0].city         |city a                                       |
   |expected#addresses[0].country      |DE                                           |
   |expected#addresses[0].firstname    |first a                                      |
   |expected#addresses[0].lastname     |last a                                       |
   |expected#addresses[0].email        |email a                                      |
   |expected#addresses[0].countryPrefix|49                                           |
   |--expected#addresses[0].phoneNumber|00 a                                         |
   |expected#addresses[0].type         |BILLING                                      |

## 1.27. Check if phonenumbers is correct when creating a new company

tags: md-1.27, version2

* Test description

   |action     |value                                                         |
   |-----------|--------------------------------------------------------------|
   |description|Create a new company and check that the phonenumber is correct|
   |priority   |high                                                          |

* request admin bearer

* Rest call

   |action                               |value                                               |
   |-------------------------------------|----------------------------------------------------|
   |method:post                          |/api/company                                        |
   |description                          |Create a Company (send post request)                |
   |payload                              |<file:company-with-carrier-without-ids-request.json>|
   |payload#phoneNumbers[0].description  |desc a                                              |
   |payload#phoneNumbers[0].number       |1 a                                                 |
   |payload#phoneNumbers[0].countryPrefix|41                                                  |
   |payload#phoneNumbers[0].category     |OFFICE                                              |
   |payload#phoneNumbers[0].phoneType    |PHONE                                               |
   |payload#phoneNumbers[0].favorite     |true                                                |
   |store#id                             |companyId                                           |

* Rest call

   |action                                |value                                        |
   |--------------------------------------|---------------------------------------------|
   |method:get                            |/api/company/${store:companyId}              |
   |description                           |Check if newly added company can be requested|
   |expected:header#status                |200                                          |
   |expected#phoneNumbers[0].description  |desc a                                       |
   |expected#phoneNumbers[0].number       |1 a                                          |
   |expected#phoneNumbers[0].countryPrefix|41                                           |
   |expected#phoneNumbers[0].category     |OFFICE                                       |
   |expected#phoneNumbers[0].phoneType    |PHONE                                        |
   |expected#phoneNumbers[0].favorite     |true                                         |

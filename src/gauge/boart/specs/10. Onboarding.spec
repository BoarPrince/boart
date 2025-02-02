# 1. Onboarding Fleet

tags: env-all, onboarding, ob-10

## 1.0 Basic Registration

tags: ob-10.test, env:development, env:staging

* Test description

   |action     |value|
   |-----------|-----|
   |description|xxxxx|
   |priority   |high |

* queues bind "company-onboarding, fleet-error, md-error, portal-error, company-consumer"

* onboarding - register
* onboarding - change password "${store:response-register.companyId}", username: "${store:response-register.email}", password: "${store:response-register.password}", new-password: "${env:default_password}"
* onboarding - request user bearer, username: "${store:response-register.email}", password: "${env:default_password}"
* onboarding - update company
* onboarding - update bank
* onboarding - update representative
* onboarding - accept contract and condition
* onboarding - start video legimitation

* queues check "company-onboarding, fleet-error, md-error, portal-error"
* queues check "company-consumer", min: "0", max: "0"

## 1.1. Send Onboarding Events (manualy)

tags: ob-10.1, manual

* Test description

   |action     |value                              |
   |-----------|-----------------------------------|
   |description|Send Onboarding Event to Masterdata|
   |priority   |high                               |

* queues bind "company, user, md-error"

* RabbitMQ publish

   |action        |value                                 |
   |--------------|--------------------------------------|
   |description   |Send onboarding event manualy         |
   |exchange      |com.jitpay.company.onboarding         |
   |wait:after:sec|4                                     |
   |routing       |JitpayServicesSync.RoutingKey         |
   |routing       |company-onboarding-data-sync-to-portal|
   |payload       |<file:event-onboarding.json>          |

* RabbitMQ publish

   |action        |value                               |
   |--------------|------------------------------------|
   |description   |Send portal onboarding event manualy|
   |exchange      |fleet_event_bus                     |
   |wait:after:sec|4                                   |
   |routing       |OnBoardingFleetEvent                |
   |payload       |<file:event-portal-onboarding.json> |

* queues check "company, user, md-error"

* Data manage

   |action                                   |value                                             |
   |-----------------------------------------|--------------------------------------------------|
   |in                                       |${store:event-company}                            |
   |description                              |Check Masterdata -> External Event                |
   |                                         |And check that the user contains the correct roles|
   |expected:count#carriers[0].users[0].roles|2                                                 |
   |expected#carriers[0].users[0].roles      |["CarrierAdmin","CustomerAdmin"]                  |

* request admin bearer

* Rest call

   |action                                   |value                                             |
   |-----------------------------------------|--------------------------------------------------|
   |method:get                               |/api/company/${generate:t:tpl:company.id}         |
   |query#deep                               |true                                              |
   |description                              |Request onboarded company                         |
   |                                         |And check that the user contains the correct roles|
   |expected:header#status                   |200                                               |
   |expected:count#carriers[0].users[0].roles|2                                                 |
   |expected#carriers[0].users[0].roles      |["CarrierAdmin","CustomerAdmin"]                  |

## 1.2 Onboarding Using Rest API (manualy)

tags: ob-10.2, manual, env:development, env:staging, env:local

* Test description

   |action     |value                 |
   |-----------|----------------------|
   |description|Onboard using Rest API|
   |priority   |high                  |

* queues bind "company, user"

* request admin bearer

* Rest call

   |action                |value                       |
   |----------------------|----------------------------|
   |method:post           |/api/onboarding             |
   |description           |onboard a new user          |
   |payload               |<file:event-onboarding.json>|
   |expected:header#status|200                         |

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:put            |/api/onboarding                           |
   |description           |update onboarded company with portal event|
   |payload               |<file:event-portal-onboarding.json>       |
   |expected:header#status|200                                       |

* queues check "company, user"

* Data manage

   |action                                   |value                                             |
   |-----------------------------------------|--------------------------------------------------|
   |in                                       |${store:event-company}                            |
   |description                              |Check Masterdata -> External Event                |
   |                                         |And check that the user contains the correct roles|
   |expected:count#carriers[0].users[0].roles|2                                                 |
   |expected#carriers[0].users[0].roles      |["CarrierAdmin","CustomerAdmin"]                  |

* Rest call

   |action                                   |value                                             |
   |-----------------------------------------|--------------------------------------------------|
   |method:get                               |/api/company/${generate:t:tpl:company.id}         |
   |query#deep                               |true                                              |
   |description                              |Request onboarded company                         |
   |                                         |And check that the user contains the correct roles|
   |expected:header#status                   |200                                               |
   |expected:count#carriers[0].users[0].roles|2                                                 |
   |expected#carriers[0].users[0].roles      |["CarrierAdmin","CustomerAdmin"]                  |

## 1.3. Send Onboarding Events and check id's (manualy, using queue)

tags: ob-10.3, manual, env:staging, env:development

* Test description

   |action     |value                                                                       |
   |-----------|----------------------------------------------------------------------------|
   |description|Send Onboarding Event to Masterdata manualy and check id's                  |
   |           |* User is generated by identity event                                       |
   |           |* Onboard Event (create) is send to exchange 'com.jitpay.company.onboarding'|
   |           |* Portal Event (update) is send to exchange 'fleet_event_bus'               |
   |priority   |high                                                                        |

* queues bind "user, company, carrier, company-onboarding, identity, md-error"

* RabbitMQ publish

   |action        |value                                                |
   |--------------|-----------------------------------------------------|
   |description   |Send event to identity to create the user on keycload|
   |exchange      |Identity.Exchange                                    |
   |routing       |Identity.UserSync                                    |
   |payload       |<file:event-identity.json>                           |
   |wait:after:sec|4                                                    |

* request admin bearer

* RabbitMQ publish

   |action        |value                        |
   |--------------|-----------------------------|
   |description   |Send onboarding event manualy|
   |exchange      |com.jitpay.company.onboarding|
   |wait:after:sec|2                            |
   |routing       |JitpayServicesSync.RoutingKey|
   |payload       |<file:event-onboarding.json> |

* queues check "md-error"

comment * RabbitMQ publish
comment
comment    |action        |value                               |
comment    |--------------|------------------------------------|
comment    |description   |Send portal onboarding event manualy|
comment    |exchange      |fleet_event_bus                     |
comment    |wait:after:sec|4                                   |
comment    |routing       |OnBoardingFleetEvent                |
comment    |payload       |<file:event-portal-onboarding.json> |

* queues check "user, company, carrier, company-onboarding, identity, md-error"

* onboarding - check matching ids, email: "${store:ob-email}", group: "Check IDs", wait: "0", not: "portal"

## 1.4. Send Onboarding Events and check id's (manualy, using rest)

tags: ob-10.4, manual, env:staging, env:development

* Test description

   |action     |value                                                                       |
   |-----------|----------------------------------------------------------------------------|
   |description|Send Onboarding Event to Masterdata manualy and check id's                  |
   |           |* User is generated by identity event                                       |
   |           |* Onboard Event (create) is send to exchange 'com.jitpay.company.onboarding'|
   |           |* Portal Event (update) is send to exchange 'fleet_event_bus'               |
   |priority   |high                                                                        |

* queues bind "user, company, carrier, identity, fleet-error, md-error"

* RabbitMQ publish

   |action        |value                                                |
   |--------------|-----------------------------------------------------|
   |description   |Send event to identity to create the user on keycload|
   |exchange      |Identity.Exchange                                    |
   |routing       |Identity.UserSync                                    |
   |payload       |<file:event-identity.json>                           |
   |wait:after:sec|4                                                    |

* request admin bearer

* Rest call

   |action                |value                         |
   |----------------------|------------------------------|
   |method:post           |/api/onboarding               |
   |description           |Send onboarding event via rest|
   |payload               |<file:event-onboarding.json>  |
   |expected:header#status|200                           |

* queues check "fleet-error, md-error"

* Rest call

   |action                |value                              |
   |----------------------|-----------------------------------|
   |method:put            |/api/onboarding                    |
   |description           |Send portal onboarding via rest    |
   |payload               |<file:event-portal-onboarding.json>|
   |expected:header#status|200                                |

* queues check "user, company, carrier, identity, fleet-error, md-error"

* onboarding - check matching ids, email: "${store:ob-email}", group: "Check IDs", wait: "0", not: "portal"

## 1.5. Id's must match after onboarding (register)

tags: ob-10.5, register, env:development, env:staging

* Test description

   |action     |value                                                                      |
   |-----------|---------------------------------------------------------------------------|
   |description|After Onboarding ID's must be the same for all backends, including keycloak|
   |priority   |high                                                                       |

* queues bind "user, company, carrier, company-onboarding, identity, portal-error, fleet-error, md-error"

* onboarding - complete

* queues check "user, company, carrier, company-onboarding, identity, portal-error, fleet-error, md-error"

* onboarding - check matching ids, email: "${store:response-register.email}", group: "Check IDs", wait: "0", not: ""

## 1.6. Id's must match after onboarding event when debtor already exists (tax - match, register)

tags: ob-10.6, register, env:development, env:staging

* Test description

   |action     |value                                                                      |
   |-----------|---------------------------------------------------------------------------|
   |description|After Onboarding ID's must be the same for all backends, including keycloak|
   |           |Debtor with same taxId already exists                                      |
   |           |In this case the companyId of the existing Debtor must be used             |
   |priority   |high                                                                       |

* request admin bearer

* Rest call

   |action                |value                            |
   |----------------------|---------------------------------|
   |method:post           |<portal>/api/company             |
   |payload               |<file:request-portal-debtor.json>|
   |description           |Create a portal debtor           |
   |expected:header#status|201                              |
   |store#taxNumber       |company.taxId                    |
   |store#name            |company.name                     |
   |store#taxNumber       |debtor.taxId                     |
   |store#id              |debtor.id                        |

* queues bind "company, carrier, user, company-onboarding, fleet-error, md-error, portal-error"

* onboarding - complete

* queues check "company, carrier, user, company-onboarding, fleet-error, md-error, portal-error"

* onboarding - check matching ids, email: "${store:response-register.email}", group: "Check IDs", wait: "0", not: ""

## 1.7. Id's must match after onboarding event when debtor already exists (tax - match, manualy)

tags: ob-10.7, manual

* Test description

   |action     |value|
   |-----------|-----|
   |description|XXXX |
   |priority   |high |

* Rest call

   |action                |value                                   |
   |----------------------|----------------------------------------|
   |method:get            |/info/version                           |
   |description           |Reads the version of the running backend|
   |expected:header#status|200                                     |

* queues bind "company, carrier, user, company-onboarding, md-error"

* RabbitMQ publish

   |action                  |value                        |
   |------------------------|-----------------------------|
   |description             |Send onboarding event manualy|
   |exchange                |com.jitpay.company.onboarding|
   |wait:after:sec          |3                            |
   |routing                 |JitpayServicesSync.RoutingKey|
   |messageId               |${generate:s:uuid}           |
   |payload                 |<file:event-onboarding.json> |
   |payload#companyDto.state|CREATED                      |

* RabbitMQ publish

   |action                 |value                                  |
   |-----------------------|---------------------------------------|
   |description            |Send onboarding event manualy          |
   |                       |Event is consumed by Portal Backend    |
   |exchange               |fleet_event_bus                        |
   |routing                |OnBoardingFleetEvent                   |
   |messageId              |${generate:s:uuid}                     |
   |wait:after:sec         |2                                      |
   |payload                |<file:event-portal-onboarding.json>    |
   |payload#Taker#companyId|${store:newCompanyId:=${generate:uuid}}|
   |payload#Taker#xxxxx    |###############                        |
   |payload#xxxxx          |###############                        |

* queues check "company, carrier, user, company-onboarding, md-error"

* Data manage

   |action     |value                                              |
   |-----------|---------------------------------------------------|
   |in         |${store:event-company}                             |
   |group      |Check Ids                                          |
   |description|Check Company CRUD event contains the new companyId|
   |expected#id|${store:newCompanyId}                              |

* Data manage

   |action            |value                                                |
   |------------------|-----------------------------------------------------|
   |in                |${store:event-carrier}                               |
   |group             |Check Ids                                            |
   |description       |Check Carrier CRUD event is assigned to new CompanyId|
   |expected#companyId|${store:newCompanyId}                                |


## 1.8. If portal is sending the event (fleet event bus) more than one time, the carrier must always be the same (manualy)

tags: ob-10.8, manual

* Test description

   |action     |value                                                                                          |
   |-----------|-----------------------------------------------------------------------------------------------|
   |description|portal can send the fleet_event_bus event more than one times.                                 |
   |           |In any case the carrierId should not be changed by the master data backend.                    |
   |           |* Master data is updating the keycloak subsidiary all the time with the first created carrierId|
   |           |* The first update has eventType: CREATE, all other updates has the eventType: UPDATE          |
   |priority   |high                                                                                           |

* request admin bearer

* Rest call

   |action                |value                            |
   |----------------------|---------------------------------|
   |method:post           |/api/company                     |
   |description           |Create a Company without jitpayId|
   |group                 |Initial Create                   |
   |payload               |<file:request-company.json>      |
   |payload#jitPayId      |                                 |
   |expected:header#status|200                              |
   |store                 |response-co                      |

* add carrier

* add user

* queues bind "company, carrier, user, identity-claim"

@@@@@@ @ @@@@@   @@@@  @@@@@    @@@@@@ @    @ @@@@@@ @    @ @@@@@
@      @ @    @ @        @      @      @    @ @      @@   @   @
@@@@@  @ @    @  @@@@    @      @@@@@  @    @ @@@@@  @ @  @   @
@      @ @@@@@       @   @      @      @    @ @      @  @ @   @
@      @ @   @  @    @   @      @       @  @  @      @   @@   @
@      @ @    @  @@@@    @      @@@@@@   @@   @@@@@@ @    @   @

* RabbitMQ publish

   |action                         |value                              |
   |-------------------------------|-----------------------------------|
   |description                    |Send onboarding event manualy      |
   |exchange                       |fleet_event_bus                    |
   |routing                        |OnBoardingFleetEvent               |
   |wait:after:sec                 |2                                  |
   |payload                        |<file:event-portal-onboarding.json>|
   |payload#Taker.companyId        |${store:response-co.id}            |
   |payload#Taker.UserDetail.userId|${store:response-user.id}          |

* queues check "company, carrier, user, identity-claim"

* Data manage, continue

   |action                 |value                              |
   |-----------------------|-----------------------------------|
   |in                     |${store:event-company}             |
   |description            |EventType of Company must be CREATE|
   |group                  |Check Queues                       |
   |expected#eventType     |CREATE                             |
   |expected#carriers[0].id|${store:response-ca.id}            |

* Data manage, continue

   |action            |value                              |
   |------------------|-----------------------------------|
   |in                |${store:event-carrier}             |
   |description       |EventType of Carrier must be CREATE|
   |group             |Check Queues                       |
   |expected#eventType|CREATE                             |
   |expected#id       |${store:response-ca.id}            |

* Data manage, continue

   |action               |value                                             |
   |---------------------|--------------------------------------------------|
   |in                   |${store:event-identity-claim}                     |
   |description          |Claim Update must contain the correct subsidiaryId|
   |group                |Check Queues                                      |
   |expected#SubsidiaryId|${store:response-ca.id}                           |
   |expected#Email       |${store:response-user.email}                      |

 @@@@  @@@@@@  @@@@   @@@@  @    @ @@@@@     @@@@@@ @    @ @@@@@@ @    @ @@@@@
@      @      @    @ @    @ @@   @ @    @    @      @    @ @      @@   @   @
 @@@@  @@@@@  @      @    @ @ @  @ @    @    @@@@@  @    @ @@@@@  @ @  @   @
     @ @      @      @    @ @  @ @ @    @    @      @    @ @      @  @ @   @
@    @ @      @    @ @    @ @   @@ @    @    @       @  @  @      @   @@   @
 @@@@  @@@@@@  @@@@   @@@@  @    @ @@@@@     @@@@@@   @@   @@@@@@ @    @   @

* RabbitMQ publish

   |action                         |value                                     |
   |-------------------------------|------------------------------------------|
   |description                    |Send onboarding event manualy, second time|
   |                               |with changed customerId                   |
   |exchange                       |fleet_event_bus                           |
   |routing                        |OnBoardingFleetEvent                      |
   |wait:after:sec                 |2                                         |
   |payload                        |<file:event-portal-onboarding.json>       |
   |payload#Taker.companyId        |${store:response-co.id}                   |
   |payload#Taker.UserDetail.userId|${store:response-user.id}                 |
   |payload#Taker.subsidiaryId     |${generate:uuid}                          |

* queues check "company, carrier, user, identity-claim"

* Data manage, continue

   |action                 |value                                               |
   |-----------------------|----------------------------------------------------|
   |in                     |${store:event-company}                              |
   |description            |EventType of Company must be UPDATE for second event|
   |group                  |Check Queues                                        |
   |expected#eventType     |UPDATE                                              |
   |expected#carriers[0].id|${store:response-ca.id}                             |

* Data manage, continue

   |action            |value                                                   |
   |------------------|--------------------------------------------------------|
   |in                |${store:event-carrier}                                  |
   |description       |EventType of Carrier must be UPDATE for the second event|
   |group             |Check Queues                                            |
   |expected#eventType|UPDATE                                                  |
   |expected#id       |${store:response-ca.id}                                 |

* Data manage, continue

   |action               |value                                             |
   |---------------------|--------------------------------------------------|
   |in                   |${store:event-identity-claim}                     |
   |description          |Claim Update must contain the correct subsidiaryId|
   |group                |Check Queues                                      |
   |expected#SubsidiaryId|${store:response-ca.id}                           |
   |expected#Email       |${store:response-user.email}                      |

 @@@@  @    @ @@@@@@  @@@@  @    @     @@@@  @        @@    @  @    @  @@@@
@    @ @    @ @      @    @ @   @     @    @ @       @  @   @  @@  @@ @
@      @@@@@@ @@@@@  @      @@@@      @      @      @    @  @  @ @@ @  @@@@
@      @    @ @      @      @  @      @      @      @@@@@@  @  @    @      @
@    @ @    @ @      @    @ @   @     @    @ @      @    @  @  @    @ @    @
 @@@@  @    @ @@@@@@  @@@@  @    @     @@@@  @@@@@@ @    @  @  @    @  @@@@

* get user claims, username: "${store:response-user.email}", password: "${env:default_password}"

* Data manage

   |action               |value                               |
   |---------------------|------------------------------------|
   |in                   |${store:response_claims}            |
   |description          |Claims must contain the correct Id's|
   |                     |CompanyId, SubsidiaryId, UserId     |
   |run:env              |development, staging                |
   |expected#companyName |${store:response-co.companyName}    |
   |expected#companyId   |${store:response-co.id}             |
   |expected#userId      |${store:response-user.id}           |
   |expected#subsidiaryId|${store:response-ca.id}             |


## 1.9. Deadletter queue for onboarding - create

tags: ob-10.9, manual

* Test description

   |action     |value                                                                   |
   |-----------|------------------------------------------------------------------------|
   |description|Wrong "onboarding - create" event must lead to an deadletter queue entry|
   |priority   |high                                                                    |

* queues bind "md-error-create"

* request admin bearer

* RabbitMQ publish

   |action               |value                                                                                                                   |
   |---------------------|------------------------------------------------------------------------------------------------------------------------|
   |description          |Send onboarding event manualy                                                                                           |
   |                     |company without an id can not be processable                                                                            |
   |exchange             |com.jitpay.company.onboarding                                                                                           |
   |routing              |JitpayServicesSync.RoutingKey                                                                                           |
   |messageId            |${generate:s:uuid}                                                                                                      |
   |payload              |<file:event-onboarding.json>                                                                                            |
   |payload#companyDto.id|undefined                                                                                                               |
   |link:jaeger          |https://jaeger.mgmt.jitpay.eu/search?service=masterdata&tags=%7B%22messaging.message_id%22%3A%22${generate:s:uuid}%22%7D|
   |wait:after:sec       |2                                                                                                                       |

* queues check "md-error-create"

## 1.10. Deadletter queue for onboarding - update

tags: ob-10.10, manual

* Test description

   |action     |value                                                                   |
   |-----------|------------------------------------------------------------------------|
   |description|Wrong "onboarding - update" event must lead to an deadletter queue entry|
   |priority   |high                                                                    |

* queues bind "md-error-update"

* request admin bearer

* RabbitMQ publish

   |action               |value                                                                                                                   |
   |---------------------|------------------------------------------------------------------------------------------------------------------------|
   |description          |Send portal update event manualy                                                                                        |
   |                     |company without an id can not be processable                                                                            |
   |exchange             |fleet_event_bus                                                                                                         |
   |routing              |OnBoardingFleetEvent                                                                                                    |
   |messageId            |${generate:s:uuid}                                                                                                      |
   |payload              |<file:event-portal-onboarding.json>                                                                                     |
   |payload#companyDto.id|undefined                                                                                                               |
   |link:jaeger          |https://jaeger.mgmt.jitpay.eu/search?service=masterdata&tags=%7B%22messaging.message_id%22%3A%22${generate:s:uuid}%22%7D|
   |wait:after:sec       |2                                                                                                                       |

* queues check "md-error-update"

## 1.11. Check Onboarding Events Validation - no Address (manualy)

tags: ob-10.11, manual

* Test description

   |action     |value                                                            |
   |-----------|-----------------------------------------------------------------|
   |description|Send Onboarding Event to Masterdata without Address / CountryCode|
   |priority   |high                                                             |

* queues bind "company, carrier, user, md-error"

* RabbitMQ publish

   |action                        |value                                          |
   |------------------------------|-----------------------------------------------|
   |description                   |Send onboarding event manualy (without Address)|
   |exchange                      |com.jitpay.company.onboarding                  |
   |wait:after:sec                |4                                              |
   |routing                       |JitpayServicesSync.RoutingKey                  |
   |routing                       |company-onboarding-data-sync-to-portal         |
   |payload                       |<file:event-onboarding.json>                   |
   |payload#addressDto.countryCode|                                               |

* RabbitMQ publish

   |action                           |value                                                 |
   |---------------------------------|------------------------------------------------------|
   |description                      |Send portal onboarding event manualy (without Address)|
   |exchange                         |fleet_event_bus                                       |
   |wait:after:sec                   |4                                                     |
   |routing                          |OnBoardingFleetEvent                                  |
   |payload                          |<file:event-portal-onboarding.json>                   |
   |payload#Taker.address.countryCode|                                                      |

* queues check "company, carrier, user, md-error"

* Data manage

   |action                                   |value                                                          |
   |-----------------------------------------|---------------------------------------------------------------|
   |in                                       |${store:event-company}                                         |
   |description                              |Check Masterdata Company Event (must contain Address / Country)|
   |                                         |Carrier and Company Address must contain a Country             |
   |expected#addresses[0].country            |DE                                                             |
   |expected#carriers[0].addresses[0].country|DE                                                             |

* Data manage

   |action                       |value                                                          |
   |-----------------------------|---------------------------------------------------------------|
   |in                           |${store:event-carrier}                                         |
   |description                  |Check Masterdata Carrier Event (must contain Address / Country)|
   |                             |Carrier Address must contain a Country                         |
   |expected#addresses[0].country|DE                                                             |

## 1.12. Check Onboarding Events Validation - no Bank BIC (manualy)

tags: ob-10.12, manual

* Test description

   |action     |value                                          |
   |-----------|-----------------------------------------------|
   |description|Send Onboarding Event to Masterdata without BIC|
   |priority   |high                                           |

* queues bind "company, carrier, user, md-error"

* RabbitMQ publish

   |action                    |value                                      |
   |--------------------------|-------------------------------------------|
   |description               |Send onboarding event manualy (without BIC)|
   |exchange                  |com.jitpay.company.onboarding              |
   |wait:after:sec            |4                                          |
   |messageId                 |${generate:s:uuid}                         |
   |routing                   |JitpayServicesSync.RoutingKey              |
   |routing                   |company-onboarding-data-sync-to-portal     |
   |payload                   |<file:event-onboarding-with-bank.json>     |
   |payload#bankAccountDto.bic|null                                       |

* RabbitMQ publish

   |action        |value                               |
   |--------------|------------------------------------|
   |description   |Send portal onboarding event manualy|
   |exchange      |fleet_event_bus                     |
   |wait:after:sec|4                                   |
   |messageId     |${generate:s:uuid}                  |
   |routing       |OnBoardingFleetEvent                |
   |payload       |<file:event-portal-onboarding.json> |

* queues check "company, carrier, user, md-error"

## 1.13. Check Onboarding Events Validation - no Bank BIC, no Address Country (manualy)

tags: ob-10.13, env:development, env:staging, manual

* Test description

   |action     |value                                                                                      |
   |-----------|-------------------------------------------------------------------------------------------|
   |description|Send Onboarding Event to Masterdata without BIC and not Address Country must be processable|
   |priority   |high                                                                                       |

* queues bind "company, carrier, user, md-error"

* RabbitMQ publish

   |action                        |value                                      |
   |------------------------------|-------------------------------------------|
   |description                   |Send onboarding event manualy (without BIC)|
   |exchange                      |com.jitpay.company.onboarding              |
   |wait:after:sec                |4                                          |
   |messageId                     |${generate:s:uuid}                         |
   |routing                       |JitpayServicesSync.RoutingKey              |
   |routing                       |company-onboarding-data-sync-to-portal     |
   |payload                       |<file:event-onboarding-with-bank.json>     |
   |payload#bankAccountDto.bic    |null                                       |
   |payload#addressDto.countryCode|null                                       |
   |store                         |response-register                          |

* RabbitMQ publish

   |action                           |value                               |
   |---------------------------------|------------------------------------|
   |description                      |Send portal onboarding event manualy|
   |exchange                         |fleet_event_bus                     |
   |wait:after:sec                   |4                                   |
   |messageId                        |${generate:s:uuid}                  |
   |routing                          |OnBoardingFleetEvent                |
   |payload                          |<file:event-portal-onboarding.json> |
   |payload#Taker.address.countryCode|null                                |

* queues check "company, carrier, user, md-error"

* RabbitMQ publish

   |action              |value                                                |
   |--------------------|-----------------------------------------------------|
   |description         |Send event to identity to create the user on keycload|
   |exchange            |Identity.Exchange.MasterData                         |
   |routing             |Identity.UserSync                                    |
   |payload             |<file:event-identity.json>                           |
   |payload#CompanyId   |${store:event-company.id}                            |
   |payload#SubsidiaryId|${store:event-company.carriers[0].id}                |
   |payload#UserId      |${store:event-company.carriers[0].users[0].id}       |
   |wait:after:sec      |4                                                    |

* onboarding - check matching ids, email: "${store:response-register.userDetail.email}", group: "Check IDs", wait: "0", not: "portal, claims"

## 1.14. Send Onboarding Event twice Times

tags: ob-10.14, manual

* Test description

   |action     |value                                              |
   |-----------|---------------------------------------------------|
   |description|Send Onboarding Event twice times                  |
   |           |It shall check, that no Entity Merge Problem exists|
   |ticket     |MD-404                                             |
   |priority   |high                                               |

* request admin bearer

* Rest call

   |action                |value                                         |
   |----------------------|----------------------------------------------|
   |method:post           |/api/onboarding                               |
   |description           |onboard a new user (send event the first time)|
   |payload               |<file:event-onboarding.json>                  |
   |expected:header#status|200                                           |

* Rest call

   |action                |value                       |
   |----------------------|----------------------------|
   |method:post           |/api/onboarding             |
   |description           |send event a second time    |
   |payload               |<file:event-onboarding.json>|
   |expected:header#status|200                         |

* Rest call

   |action                                      |value                                             |
   |--------------------------------------------|--------------------------------------------------|
   |method:get                                  |/api/company/${generate:t:tpl:company.id}         |
   |query#deep                                  |true                                              |
   |description                                 |Request onboarded company                         |
   |                                            |And check that the user contains the correct roles|
   |expected:header#status                      |200                                               |
   |-- expected:count#carriers[0].users[0].roles|2                                                 |
   |-- expected#carriers[0].users[0].roles      |["CarrierAdmin","CustomerAdmin"]                  |

## 1.15 Use Default Values

tags: ob-10.15, manual, env:development, env:staging, env:local

* Test description

   |action     |value                                                          |
   |-----------|---------------------------------------------------------------|
   |description|Default Values must be used, if not value is explicitly defined|
   |priority   |high                                                           |

* request admin bearer

* Rest call

   |action                |value                       |
   |----------------------|----------------------------|
   |method:post           |/api/onboarding             |
   |description           |onboard a new user          |
   |payload               |<file:event-onboarding.json>|
   |expected:header#status|200                         |

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:put            |/api/onboarding                           |
   |description           |update onboarded company with portal event|
   |payload               |<file:event-portal-onboarding.json>       |
   |expected:header#status|200                                       |

* Rest call

   |action                                |value                                             |
   |--------------------------------------|--------------------------------------------------|
   |method:get                            |/api/company/${generate:t:tpl:company.id}         |
   |description                           |Request onboarded company                         |
   |                                      |And check that the user contains the correct roles|
   |expected:header#status                |200                                               |
   |expected#carriers[0].currency         |EUR                                               |
   |expected#carriers[0].maximumCards     |0                                                 |
   |expected#carriers[0].baseCashpoolValue|0                                                 |

## 1.16 Use Defined Values

tags: ob-10.16, manual, env:development, env:staging, env:local

* Test description

   |action     |value                                   |
   |-----------|----------------------------------------|
   |description|If Values are defined, they must be used|
   |priority   |high                                    |

* request admin bearer

* Rest call

   |action                          |value                       |
   |--------------------------------|----------------------------|
   |method:post                     |/api/onboarding             |
   |description                     |onboard a new user          |
   |payload                         |<file:event-onboarding.json>|
   |payload#companyDto.currency     |USD                         |
   |payload#companyDto.cardAmount   |111                         |
   |payload#companyDto.cashpoolValue|222                         |
   |expected:header#status          |200                         |

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:put            |/api/onboarding                           |
   |description           |update onboarded company with portal event|
   |payload               |<file:event-portal-onboarding.json>       |
   |expected:header#status|200                                       |

* Rest call

   |action                                |value                                             |
   |--------------------------------------|--------------------------------------------------|
   |method:get                            |/api/company/${generate:t:tpl:company.id}         |
   |description                           |Request onboarded company                         |
   |                                      |And check that the user contains the correct roles|
   |expected:header#status                |200                                               |
   |expected#carriers[0].currency         |USD                                               |
   |expected#carriers[0].maximumCards     |111                                               |
   |expected#carriers[0].baseCashpoolValue|222                                               |
